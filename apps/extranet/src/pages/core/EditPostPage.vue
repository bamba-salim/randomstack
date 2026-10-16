<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {
  savePost,
  deletePost,
  purgePost,
  fetchTags,
  fetchPostFormData,
  fetchEditorialAuthors,
  uploadFile,
  fileUrl,
  getMe,
  ApiError
} from '#services'
import {PostContentManager, BaseInput, BaseToggle} from '#components'
import {toast} from '../../lib/toast'
import {validateSavePost, FILE_TYPE, TABLE} from '@randomstack/commons'
import type {EditPostFormBean, EditorialAuthorLite, PostStatus, Role} from '@randomstack/commons'

const CLIENT_URL = String(import.meta.env['VITE_CLIENT_URL'] || 'http://localhost:5173').replace(/\/$/, '')

const route = useRoute()
const router = useRouter()
const isEditMode = ref(false)
const postId = ref<string | undefined>(undefined)
const loading = ref(false)
const actorRole = ref<Role | null>(null)
const isSuperAdmin = computed(() => actorRole.value === 'ADMIN')
const canFeature = computed(() => actorRole.value === 'ADMIN' || actorRole.value === 'EDITOR')
const isReadOnly = computed(() => actorRole.value === 'MODERATOR')
const canWrite = computed(() => !isReadOnly.value)
const authorOptions = ref<EditorialAuthorLite[]>([])

const formBean = ref<EditPostFormBean | null>(null)
const scheduleAtLocal = ref('')
const showScheduleModal = ref(false)
const scheduleModalError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const currentTag = ref('')
const availableTags = ref<string[]>([])
const currentSource = ref('')

const clearFieldError = (key: string) => {
  if (!fieldErrors.value[key]) return
  const next = {...fieldErrors.value}
  delete next[key]
  fieldErrors.value = next
}

const previewHref = computed(() => {
  if (!formBean.value?.shareCode) return null
  return `${CLIENT_URL}/preview/${formBean.value.shareCode}`
})

/** Une fois publié : plus de brouillon ni de planification (Publier / Archiver / Corbeille). */
const canDraft = computed(() =>
  canWrite.value && formBean.value?.hasBeenPublished !== true
)
const canSchedule = computed(() => canDraft.value)

const toDatetimeLocalValue = (iso: string | null | undefined) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const defaultScheduleLocal = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const handleCoverUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !formBean.value) return
  try {
    loading.value = true
    const {idFile} = await uploadFile(file, FILE_TYPE.IMAGE, TABLE.POST)
    formBean.value.imageId = idFile
  } catch {
    toast.error("Erreur lors de l'upload de l'image de couverture.")
  } finally {
    loading.value = false
  }
}

const openScheduleModal = () => {
  if (!canSchedule.value || loading.value) return
  scheduleModalError.value = null
  scheduleAtLocal.value =
    toDatetimeLocalValue(formBean.value?.publishAt) || defaultScheduleLocal()
  showScheduleModal.value = true
}

const closeScheduleModal = () => {
  showScheduleModal.value = false
  scheduleModalError.value = null
}

const confirmSchedule = async () => {
  if (!formBean.value || !canSchedule.value) return
  scheduleModalError.value = null

  if (!scheduleAtLocal.value) {
    scheduleModalError.value = 'Choisis une date et une heure.'
    return
  }

  const when = new Date(scheduleAtLocal.value)
  if (Number.isNaN(when.getTime()) || when <= new Date()) {
    scheduleModalError.value = 'La date doit être dans le futur.'
    return
  }

  formBean.value.publishAt = when.toISOString()
  showScheduleModal.value = false
  await handleSave('SCHEDULED')
}

/** Bouton principal : Enregistrer si déjà en ligne, sinon Publier (y compris depuis Archivé). */
const isLivePublished = computed(
  () => formBean.value?.hasBeenPublished === true && formBean.value?.status === 'PUBLISHED'
)

const handlePrimarySave = async () => {
  if (!formBean.value) return
  if (isLivePublished.value) {
    await handleSave('PUBLISHED', {keepPublishAt: true})
    return
  }
  // 1ʳᵉ publication ou republication depuis ARCHIVED / autre
  await handleSave('PUBLISHED', {
    keepPublishAt: formBean.value.hasBeenPublished === true
  })
}

const handleSave = async (status: PostStatus, opts?: {keepPublishAt?: boolean}) => {
  if (!formBean.value || loading.value || !canWrite.value) return
  fieldErrors.value = {}

  if (status === 'DRAFT' && !canDraft.value) {
    toast.error('Un article déjà publié ne peut plus repasser en brouillon.')
    return
  }

  if (status === 'SCHEDULED') {
    if (!canSchedule.value) {
      toast.error('Un article déjà publié ne peut plus être planifié.')
      return
    }
  }

  if (status === 'PUBLISHED' && !opts?.keepPublishAt) {
    formBean.value.publishAt = new Date().toISOString()
  }

  if (status === 'DRAFT') {
    formBean.value.isFeatured = false
  }

  const previousStatus = formBean.value.status
  const payload: EditPostFormBean = {...formBean.value, status}

  const local = validateSavePost(payload)
  if (!local.ok) {
    fieldErrors.value = local.errors || (local.field ? {[local.field]: local.error} : {})
    if (local.field === 'publishAt' || local.errors?.['publishAt']) {
      scheduleModalError.value = local.errors?.['publishAt'] || local.error
      if (status === 'SCHEDULED') showScheduleModal.value = true
    }
    return
  }

  formBean.value.status = status
  loading.value = true

  const wasCreate = !postId.value
  const isContentUpdate =
    Boolean(opts?.keepPublishAt) && previousStatus === 'PUBLISHED' && status === 'PUBLISHED'

  try {
    const result = await savePost(local.data, postId.value)
    postId.value = result.post.id
    isEditMode.value = true

    if (wasCreate) {
      await router.replace(`/edit-post/${result.post.id}`)
    }

    formBean.value = await fetchPostFormData(result.post.id)

    if (isContentUpdate) {
      toast.success('Modifications enregistrées.')
      return
    }

    if (status === 'SCHEDULED') {
      toast.success('Article planifié.')
      await router.push('/manage-post')
      return
    }
    if (status === 'PUBLISHED') {
      toast.success('Article publié.')
      await router.push('/manage-post')
      return
    }
    if (status === 'ARCHIVED') {
      toast.success('Article archivé.')
      await router.push('/manage-post')
      return
    }

    toast.success('Brouillon enregistré.')
  } catch (err: any) {
    if (err instanceof ApiError && err.errors) {
      fieldErrors.value = err.errors
      return
    }
    if (err instanceof ApiError && err.field) {
      fieldErrors.value = {[err.field]: err.message}
      return
    }
    toast.error(err.message || "Erreur d'enregistrement de l'article.")
  } finally {
    loading.value = false
  }
}

const handleSoftDelete = async () => {
  if (!postId.value || !canWrite.value || loading.value) return
  if (!confirm('Mettre cet article à la corbeille ? (suppression définitive auto après 90 jours)')) return
  loading.value = true
  try {
    await deletePost(postId.value)
    toast.success('Article déplacé dans la corbeille.')
    await router.push('/manage-post')
  } catch (err: any) {
    toast.error(err.message || 'Suppression impossible.')
  } finally {
    loading.value = false
  }
}

const handleHardDelete = async () => {
  if (!postId.value || !isSuperAdmin.value || loading.value) return
  if (!confirm('Supprimer DÉFINITIVEMENT cet article ? Irréversible.')) return
  loading.value = true
  try {
    await purgePost(postId.value)
    toast.success('Article supprimé définitivement.')
    await router.push('/manage-post')
  } catch (err: any) {
    toast.error(err.message || 'Purge impossible.')
  } finally {
    loading.value = false
  }
}

const addTag = (value: string) => {
  const cleanTag = value.trim().toLowerCase()
  if (cleanTag && formBean.value && !formBean.value.tags.includes(cleanTag)) {
    formBean.value.tags.push(cleanTag)
  }
  currentTag.value = ''
}

const handleTagInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  if (val.includes(',')) {
    val.split(',').forEach(t => addTag(t))
  }
}

const handleTagEnter = (e: KeyboardEvent) => {
  e.preventDefault()
  addTag(currentTag.value)
}

const removeTag = (index: number) => {
  formBean.value?.tags.splice(index, 1)
}

const addSource = (value: string) => {
  const clean = value.trim()
  if (clean && formBean.value && !formBean.value.sources.includes(clean)) {
    formBean.value.sources.push(clean)
  }
  currentSource.value = ''
}

const handleSourceInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  if (val.includes(',')) {
    val.split(',').forEach(t => addSource(t))
  }
}

const handleSourceEnter = (e: KeyboardEvent) => {
  e.preventDefault()
  addSource(currentSource.value)
}

const removeSource = (index: number) => {
  formBean.value?.sources.splice(index, 1)
}

onMounted(async () => {
  loading.value = true
  try {
    const me = await getMe()
    actorRole.value = me?.role ?? null

    try {
      availableTags.value = await fetchTags()
    } catch {
      availableTags.value = []
    }

    if (isSuperAdmin.value) {
      try {
        authorOptions.value = await fetchEditorialAuthors()
      } catch {
        authorOptions.value = []
      }
    }

    const {id} = route.params
    postId.value = id as string | undefined
    isEditMode.value = Boolean(postId.value)

    if (!postId.value && isReadOnly.value) {
      toast.error('Un modérateur ne peut pas créer d’article.')
      return
    }

    formBean.value = await fetchPostFormData(postId.value)
    if (!formBean.value.sources) formBean.value.sources = []
  } catch {
    toast.error('Erreur de chargement.')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="admin-main">
    <header class="main-header">
      <div>
        <h1 class="header-title">{{ isEditMode ? 'Édition article' : 'Nouvel article' }}</h1>
        <p v-if="formBean?.status" class="header-sub">Statut actuel : {{ formBean.status }}</p>
      </div>
      <a
          v-if="previewHref"
          class="add-btn"
          :href="previewHref"
          target="_blank"
          rel="noopener noreferrer"
      >
        Prévisualiser
      </a>
    </header>

    <div v-if="loading && !formBean" class="text-sm text-blue-500 animate-pulse">
      Chargement...
    </div>

    <form v-else-if="formBean" @submit.prevent class="form-page-container">
      <p v-if="isReadOnly" class="error-box mb-4">
        Lecture seule — tu pourras signaler un problème sur cet article prochainement.
      </p>

      <div v-if="canFeature" class="form-group mb-2">
        <BaseToggle
            v-model="formBean.isFeatured"
            label="Épingler cet article à la une"
        />
        <p class="text-[10px] text-slate-500 mt-1">
          Un seul article à la une : épingler celui-ci désépingle les autres.
        </p>
      </div>

      <div v-if="isSuperAdmin" class="form-group mb-2">
        <label class="form-label">Auteur</label>
        <select v-model="formBean.authorId" class="form-input" :disabled="isReadOnly">
          <option disabled :value="null">Choisir un auteur…</option>
          <option
              v-for="author in authorOptions"
              :key="author.id"
              :value="author.id"
          >
            {{ author.displayName }} ({{ author.email }})
          </option>
        </select>
      </div>

      <BaseInput
          v-model="formBean.title"
          label="Titre"
          :disabled="isReadOnly"
          :error="fieldErrors.title"
          @clear-error="clearFieldError('title')"
      />

      <div class="form-group col-span-2">
        <label class="form-label">Résumé court</label>
        <textarea
            v-model="formBean.summary"
            :class="['form-textarea', {'form-input--invalid': fieldErrors.summary}]"
            :disabled="isReadOnly"
            placeholder="Écrivez un court résumé..."
            @input="clearFieldError('summary')"
        ></textarea>
        <p v-if="fieldErrors.summary" class="form-field-error">{{ fieldErrors.summary }}</p>
      </div>

      <div class="form-group col-span-2">
        <label class="form-label">Illustration principale (optionnelle)</label>
        <div class="file-upload-zone">
          <img
              v-if="formBean.imageId"
              :src="fileUrl(formBean.imageId)"
              class="w-full max-h-64 object-contain mb-3 bg-white border border-[#c3c4c7] rounded shadow-sm"
              loading="lazy"
          />
          <input
              v-if="canWrite"
              type="file"
              accept="image/*"
              @change="handleCoverUpload"
              class="file-input w-full"
          />
          <input
              v-if="formBean.imageId"
              v-model="formBean.imageCaption"
              type="text"
              class="form-input-inline w-full mt-3 !mb-0"
              :disabled="isReadOnly"
              maxlength="300"
              placeholder="Légende de la cover (optionnelle)"
          />
        </div>
      </div>

      <PostContentManager v-model="formBean.content"/>

      <!-- Tags -->
      <div class="form-group col-span-2 border border-[#c3c4c7] p-4 bg-[#f6f8fa]">
        <label class="form-label">Mots-clés (Tags)</label>
        <p class="text-[10px] text-slate-500 mb-2">Virgule ou Entrée pour ajouter.</p>
        <div class="flex gap-2 mb-3">
          <input
              v-model="currentTag"
              list="suggested-tags"
              type="text"
              class="form-input flex-1"
              :disabled="isReadOnly"
              placeholder="Ex: javascript, tutoriel..."
              @input="handleTagInput"
              @keydown.enter="handleTagEnter"
          />
          <button type="button" class="px-4 py-2 bg-white border border-[#c3c4c7] text-xs font-bold" :disabled="isReadOnly" @click="addTag(currentTag)">
            Ajouter
          </button>
        </div>
        <datalist id="suggested-tags">
          <option v-for="tag in availableTags" :key="tag" :value="tag"/>
        </datalist>
        <div v-if="formBean.tags.length" class="flex flex-wrap gap-2 pt-2 border-t border-[#c3c4c7]/40">
          <span
              v-for="(tag, index) in formBean.tags"
              :key="tag"
              class="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#c3c4c7] rounded-full text-[10px] font-black uppercase"
          >
            #{{ tag }}
            <button v-if="canWrite" type="button" class="text-slate-400 hover:text-red-500" @click="removeTag(index)">✕</button>
          </span>
        </div>
      </div>

      <!-- Sources (comme tags, sans autocomplete) -->
      <div class="form-group col-span-2 border border-[#c3c4c7] p-4 bg-[#f6f8fa]">
        <label class="form-label">Sources</label>
        <p class="text-[10px] text-slate-500 mb-2">URLs ou libellés — virgule ou Entrée.</p>
        <div class="flex gap-2 mb-3">
          <input
              v-model="currentSource"
              type="text"
              class="form-input flex-1"
              :disabled="isReadOnly"
              placeholder="https://… ou Nom de la source"
              @input="handleSourceInput"
              @keydown.enter="handleSourceEnter"
          />
          <button type="button" class="px-4 py-2 bg-white border border-[#c3c4c7] text-xs font-bold" :disabled="isReadOnly" @click="addSource(currentSource)">
            Ajouter
          </button>
        </div>
        <div v-if="formBean.sources.length" class="flex flex-wrap gap-2 pt-2 border-t border-[#c3c4c7]/40">
          <span
              v-for="(source, index) in formBean.sources"
              :key="source"
              class="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#c3c4c7] text-[10px] font-medium max-w-full"
          >
            <span class="truncate">{{ source }}</span>
            <button v-if="canWrite" type="button" class="text-slate-400 hover:text-red-500 shrink-0" @click="removeSource(index)">✕</button>
          </span>
        </div>
        <div v-else class="text-xs italic text-slate-400 pt-2 border-t border-[#c3c4c7]/40">
          Aucune source.
        </div>
      </div>

      <p
          v-if="formBean.status === 'SCHEDULED' && formBean.publishAt"
          class="col-span-2 text-xs text-slate-600 border border-[#c3c4c7] bg-[#f6f8fa] p-3"
      >
        Planifié pour le
        <strong>{{ new Date(formBean.publishAt).toLocaleString('fr-FR') }}</strong>
      </p>

      <div v-if="canWrite" class="form-actions border-t border-[#c3c4c7] pt-6 mt-4 flex flex-wrap gap-3">
        <button
            v-if="canDraft"
            type="button"
            class="py-2.5 px-4 bg-white border border-[#c3c4c7] text-xs font-bold"
            :disabled="loading"
            @click="handleSave('DRAFT')"
        >
          Brouillon
        </button>
        <button
            v-if="canSchedule"
            type="button"
            class="py-2.5 px-4 bg-white border border-[#c3c4c7] text-xs font-bold"
            :disabled="loading"
            @click="openScheduleModal"
        >
          Planifier
        </button>
        <button
            type="button"
            class="py-2.5 px-5 bg-[#2271b1] hover:bg-[#135e96] text-xs font-bold text-white"
            :disabled="loading"
            @click="handlePrimarySave"
        >
          {{ isLivePublished ? 'Enregistrer' : 'Publier' }}
        </button>
        <button
            v-if="formBean.status !== 'ARCHIVED'"
            type="button"
            class="py-2.5 px-4 bg-white border border-[#c3c4c7] text-xs font-bold"
            :disabled="loading"
            @click="handleSave('ARCHIVED')"
        >
          Archiver
        </button>
        <button
            v-if="isEditMode"
            type="button"
            class="py-2.5 px-4 bg-white border border-red-300 text-xs font-bold text-red-700 ml-auto"
            :disabled="loading"
            @click="handleSoftDelete"
        >
          Corbeille
        </button>
        <button
            v-if="isEditMode && isSuperAdmin"
            type="button"
            class="py-2.5 px-4 bg-red-700 text-xs font-bold text-white"
            :disabled="loading"
            @click="handleHardDelete"
        >
          Supprimer définitivement
        </button>
      </div>
      <div v-else class="form-actions border-t border-[#c3c4c7] pt-6 mt-4">
        <button type="button" class="py-2.5 px-4 bg-white border border-[#c3c4c7] text-xs font-bold" @click="router.push('/manage-post')">
          ← Retour à la liste
        </button>
      </div>
    </form>

    <!-- Modal planification -->
    <div
        v-if="showScheduleModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeScheduleModal"
    >
      <div class="w-full max-w-md bg-white border border-[#c3c4c7] shadow-lg p-5" role="dialog" aria-modal="true" aria-labelledby="schedule-modal-title">
        <h2 id="schedule-modal-title" class="text-sm font-extrabold uppercase tracking-wide mb-3">
          Planifier la publication
        </h2>
        <p class="text-xs text-slate-500 mb-4">
          Choisis la date et l’heure de mise en ligne. Le worker publiera automatiquement à ce moment.
        </p>
        <label class="form-label" for="schedule-at">Date et heure</label>
        <input
            id="schedule-at"
            v-model="scheduleAtLocal"
            type="datetime-local"
            class="form-input w-full"
        />
        <p v-if="scheduleModalError" class="error-box mt-3 mb-0">{{ scheduleModalError }}</p>
        <div class="flex justify-end gap-2 mt-5">
          <button
              type="button"
              class="py-2 px-4 bg-white border border-[#c3c4c7] text-xs font-bold"
              :disabled="loading"
              @click="closeScheduleModal"
          >
            Annuler
          </button>
          <button
              type="button"
              class="py-2 px-4 bg-[#2271b1] hover:bg-[#135e96] text-xs font-bold text-white"
              :disabled="loading"
              @click="confirmSchedule"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
