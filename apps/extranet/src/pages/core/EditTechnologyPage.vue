<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'

import {Sidebar, ParagraphManager, BaseInput, BaseToggle} from '#components'

import {saveTechnology, fetchTechnologies, fetchTechnologyFormData, uploadFile, fileUrl, ApiError} from '#services'
import {
  TechnologyFilter,
  validateSaveTechnology,
  FILE_TYPE,
  TABLE,
  TECHNOLOGY_CATEGORY,
  TECHNOLOGY_CATEGORY_LABELS,
  type Category,
  type AdminTechnologyListed,
  type EditTechnologyFormBean
} from '@randomstack/commons'
import {toast} from '../../lib/toast'

const categoryOptions = Object.values(TECHNOLOGY_CATEGORY)

const categoriesOverlap = (a: Category[], b: Category[]) =>
  a.some(cat => b.includes(cat))

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const techId = ref<string | undefined>(undefined)

const loading = ref(false)
const loadError = ref<string | null>(null)

const formBean = ref<EditTechnologyFormBean | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const allTechnologies = ref<AdminTechnologyListed[]>([])
const selectedLanguageDropdown = ref('')
const isCustomLanguage = ref(false)

type CompatListKey = 'recommendedIds' | 'worksWithIds' | 'incompatibleIds'
const compatQueries = ref<Record<CompatListKey, string>>({
  recommendedIds: '',
  worksWithIds: '',
  incompatibleIds: ''
})

const clearFieldError = (key: string) => {
  if (!fieldErrors.value[key]) return
  const next = {...fieldErrors.value}
  delete next[key]
  fieldErrors.value = next
}

const uniqueLanguages = computed(() => {
  return TechnologyFilter.getUniqueLanguages(allTechnologies.value)
})

const techById = computed(() => new Map(allTechnologies.value.map(t => [t.id, t])))

/** Cibles de compatibilité : hors soi, catégories disjointes */
const compatCandidates = computed(() => {
  if (!formBean.value) return []
  const selfId = formBean.value.id
  const selfCats = formBean.value.categories || []
  return allTechnologies.value
    .filter(t => t.id !== selfId && !categoriesOverlap(selfCats, t.categories || []))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
})

/** Suggestions datalist : pas déjà liées dans une des 3 listes */
const compatSuggestions = computed(() => {
  if (!formBean.value) return []
  const taken = new Set([
    ...formBean.value.recommendedIds,
    ...formBean.value.worksWithIds,
    ...formBean.value.incompatibleIds
  ])
  return compatCandidates.value.filter(t => !taken.has(t.id))
})

const resolveCompatTech = (raw: string) => {
  const q = raw.trim().toLowerCase()
  if (!q) return null
  return (
    compatSuggestions.value.find(t => t.name.toLowerCase() === q)
    || compatSuggestions.value.find(t => t.name.toLowerCase().startsWith(q))
    || null
  )
}

const addCompat = (key: CompatListKey) => {
  if (!formBean.value) return
  const tech = resolveCompatTech(compatQueries.value[key])
  if (!tech) return

  for (const list of ['recommendedIds', 'worksWithIds', 'incompatibleIds'] as CompatListKey[]) {
    formBean.value[list] = formBean.value[list].filter(id => id !== tech.id)
  }
  formBean.value[key].push(tech.id)
  compatQueries.value[key] = ''
  clearFieldError('compatibilities')
}

const handleCompatInput = (key: CompatListKey, e: Event) => {
  const val = (e.target as HTMLInputElement).value
  if (val.includes(',')) {
    val.split(',').forEach(chunk => {
      compatQueries.value[key] = chunk
      addCompat(key)
    })
  }
}

const handleCompatEnter = (key: CompatListKey, e: KeyboardEvent) => {
  e.preventDefault()
  addCompat(key)
}

const removeCompat = (key: CompatListKey, id: string) => {
  if (!formBean.value) return
  formBean.value[key] = formBean.value[key].filter(x => x !== id)
  clearFieldError('compatibilities')
}

const compatChipName = (id: string) => techById.value.get(id)?.name || id

const handleLanguageSelect = () => {
  if (!formBean.value) return
  if (selectedLanguageDropdown.value === '__NEW__') {
    isCustomLanguage.value = true
    formBean.value.language = ''
  } else {
    formBean.value.language = selectedLanguageDropdown.value
  }
}

const cancelCustomLanguage = () => {
  if (!formBean.value) return
  isCustomLanguage.value = false
  selectedLanguageDropdown.value = uniqueLanguages.value[0] || ''
  formBean.value.language = selectedLanguageDropdown.value
}

// Upload instantané du logo (comme la couverture des posts)
const handleLogoUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !formBean.value) return

  try {
    loading.value = true
    const {idFile} = await uploadFile(file, FILE_TYPE.IMAGE, TABLE.TECHNOLOGY)
    formBean.value.logo = idFile
  } catch {
    toast.error("Erreur lors de l'upload du logo.")
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!formBean.value || loading.value) return

  fieldErrors.value = {}
  const local = validateSaveTechnology(formBean.value)
  if (!local.ok) {
    fieldErrors.value = local.errors || (local.field ? {[local.field]: local.error} : {})
    return
  }

  loading.value = true
  try {
    await saveTechnology(local.data, techId.value)
    toast.success('Technologie enregistrée.')
    router.push('/dashboard')
  } catch (err: unknown) {
    if (err instanceof ApiError && err.errors) {
      fieldErrors.value = err.errors
      return
    }
    if (err instanceof ApiError && err.field) {
      fieldErrors.value = {[err.field]: err.message}
      return
    }
    toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.")
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    try {
      allTechnologies.value = await fetchTechnologies()
    } catch {
      console.warn("Impossible de pré-charger la liste des langages.")
    }

    const {id} = route.params
    techId.value = id as string | undefined
    isEditMode.value = Boolean(techId.value)

    const flatFormBean = await fetchTechnologyFormData(techId.value)
    formBean.value = {
      ...flatFormBean,
      recommendedIds: flatFormBean.recommendedIds || [],
      worksWithIds: flatFormBean.worksWithIds || [],
      incompatibleIds: flatFormBean.incompatibleIds || []
    }

    selectedLanguageDropdown.value = flatFormBean.language || ''
    isCustomLanguage.value = false
  } catch {
    loadError.value = "Impossible d'initialiser le formulaire."
  } finally {
    loading.value = false
  }
})

</script>

<template>

  <header class="main-header">
    <div>
      <h1 class="header-title">
        {{ isEditMode ? `Édition : ${formBean?.name}` : 'Ajouter une Technologie' }}
      </h1>
      <p class="header-sub">Formulaire d'écriture d'arcade sémantique</p>
    </div>
  </header>

  <div v-if="loading && !formBean" class="loading-text">
    Initialisation du formulaire...
  </div>

  <div v-else-if="loadError" class="error-box">
    {{ loadError }}
  </div>

  <!-- Le formulaire ne s'affiche qu'une fois le FormBean initialisé par l'API 🚀 -->
  <form v-else-if="formBean" @submit.prevent="handleSave" class="form-page-container">

    <div class="form-group">
      <BaseToggle v-model="formBean.isActive" label="Disponible au tirage au sort"/>
    </div>

    <div class="form-grid">
      <!-- NAME -->
      <BaseInput
          v-model="formBean.name"
          label="Nom du Framework / Outil"
          required
          placeholder="Ex: Svelte"
          :error="fieldErrors.name"
          @clear-error="clearFieldError('name')"
      />

      <!-- LANGAGE -->
      <div class="form-group">
        <label class="form-label">Langage principal</label>
        <div v-if="!isCustomLanguage" class="flex gap-2">
          <select
              v-model="selectedLanguageDropdown"
              required
              :class="['form-select', 'flex-1', {'form-input--invalid': fieldErrors.language}]"
              @change="handleLanguageSelect(); clearFieldError('language')"
          >
            <option value="" disabled>-- Sélectionner un langage --</option>
            <option value="__NEW__" class="text-blue-600 font-extrabold">+ Ajouter un autre langage...</option>
            <option v-for="lang in uniqueLanguages" :key="lang" :value="lang">
              {{ lang }}
            </option>
          </select>
        </div>

        <div class="flex gap-2" v-else>
          <input
              v-model="formBean.language"
              type="text"
              required
              :class="['form-input', 'flex-1', {'form-input--invalid': fieldErrors.language}]"
              placeholder="Écrivez le nom..."
              @input="clearFieldError('language')"
          />
          <button type="button" @click="cancelCustomLanguage" class="cancel-btn"
                  style="margin: 0; padding: 0.625rem 1rem;">
            Annuler
          </button>
        </div>
        <p v-if="fieldErrors.language" class="form-field-error">{{ fieldErrors.language }}</p>
      </div>
    </div>

    <div class="form-grid">
      <!-- CATEGORIES -->
      <div class="form-group col-span-2">
        <label class="form-label">Catégories techniques associées (Multi-choix)</label>
        <div class="flex flex-wrap gap-2.5 mt-2">
          <label
              v-for="cat in categoryOptions"
              :key="cat"
              class="flex items-center gap-2 px-3 py-2 bg-[#f0f0f1] border border-[#c3c4c7] hover:bg-[#e0e0e0] rounded text-xs font-semibold text-[#1d2327] cursor-pointer select-none transition-colors duration-150"
          >
            <input
                type="checkbox"
                :value="cat"
                v-model="formBean.categories"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                @change="clearFieldError('categories')"
            />
            <span>{{ TECHNOLOGY_CATEGORY_LABELS[cat] }}</span>
          </label>
        </div>
        <p v-if="fieldErrors.categories" class="form-field-error">{{ fieldErrors.categories }}</p>
      </div>

      <!-- USAGE -->
      <BaseInput
          v-model="formBean.usage"
          label="Utilisation"
          required
          placeholder="Ex: Frontend Web"
          className="col-span-2"
          :error="fieldErrors.usage"
          @clear-error="clearFieldError('usage')"
      />
    </div>

    <!-- DESCRIPTION -->
    <div class="form-group col-span-2">
      <label class="form-label">Description d'introduction</label>
      <textarea
          v-model="formBean.description"
          required
          :class="['form-textarea', {'form-input--invalid': fieldErrors.description}]"
          placeholder="Entrez une courte explication..."
          @input="clearFieldError('description')"
      ></textarea>
      <p v-if="fieldErrors.description" class="form-field-error">{{ fieldErrors.description }}</p>
    </div>

    <!-- HISTORY -->
    <div class="form-group col-span-2">
      <ParagraphManager v-model="formBean.history"/>
    </div>

    <!-- 3. LES NOUVEAUX CHAMPS DU CAHIER DES CHARGES (OPTIONNELS) 🚀 -->
    <div class="form-grid">
      <!-- WEBSITE -->
      <BaseInput
          v-model="formBean.websiteUrl"
          label="Site Web officiel"
          type="url"
          placeholder="Ex: https://svelte.dev"
          :error="fieldErrors.websiteUrl"
          @clear-error="clearFieldError('websiteUrl')"
      />

      <!-- DOCUMENTATION -->
      <BaseInput
          v-model="formBean.docsUrl"
          label="Lien vers la Documentation"
          type="url"
          placeholder="Ex: https://svelte.dev/docs"
          :error="fieldErrors.docsUrl"
          @clear-error="clearFieldError('docsUrl')"
      />

    </div>

    <div class="form-grid">

      <!-- CREATOR -->
      <BaseInput
          v-model="formBean.creator"
          label="Créateur / Auteur"
          placeholder="Ex: Rich Harris"
          :error="fieldErrors.creator"
          @clear-error="clearFieldError('creator')"
      />

      <!-- YEAR -->
      <BaseInput
          v-model="formBean.foundedAt"
          label="Année de création"
          placeholder="Ex: 2016"
          :error="fieldErrors.foundedAt"
          @clear-error="clearFieldError('foundedAt')"
      />

    </div>

    <div class="form-grid">
      <!-- USERS COUNT -->
      <BaseInput
          v-model.number="formBean.userCount"
          type="number"
          label="Nombre d'utilisateurs (Étoiles GitHub/GitLab)"
          placeholder="Ex: 75000"
          :error="fieldErrors.userCount"
          @clear-error="clearFieldError('userCount')"
      />

      <!-- PROJECT COUNT -->
      <BaseInput
          v-model.number="formBean.projectCount"
          type="number"
          label="Nombre de projets recensés"
          placeholder="Ex: 120000"
          :error="fieldErrors.projectCount"
          @clear-error="clearFieldError('projectCount')"
      />

    </div>

    <div class="form-grid">
      <BaseInput v-model="formBean.versions.stable.num" label="Version Stable (Numéro)" placeholder="Ex: v4.0.0"/>
      <BaseInput v-model="formBean.versions.stable.date" label="Date de sortie (Stable)" placeholder="Ex: 15/01/2026"/>
    </div>

    <div class="form-grid">
      <BaseInput v-model="formBean.versions.latest.num" label="Dernière Version (Numéro)" placeholder="Ex: v4.1.2"/>
      <BaseInput v-model="formBean.versions.latest.date" label="Date de sortie (Dernière)"
                 placeholder="Ex: 01/02/2026"/>
    </div>

    <!-- COMPATIBILITÉS (inter-catégories uniquement) — même UX que les tags -->
    <div class="form-group col-span-2 border border-[#c3c4c7] p-4 bg-[#f6f8fa]">
      <label class="form-label">Compatibilités</label>
      <p class="text-[10px] text-slate-500 mb-3">
        Liens uniquement avec des technos d’<strong>autres catégories</strong>.
        Recherche + Entrée / Ajouter (comme les tags). Incompatibles = conflits réels uniquement.
      </p>
      <p v-if="fieldErrors.compatibilities" class="form-field-error mb-2">{{ fieldErrors.compatibilities }}</p>

      <datalist id="suggested-compat-techs">
        <option
            v-for="t in compatSuggestions"
            :key="t.id"
            :value="t.name"
        >
          {{ t.categories.map(c => TECHNOLOGY_CATEGORY_LABELS[c]).join(', ') }}
        </option>
      </datalist>

      <div class="flex flex-col gap-5">
        <div
            v-for="block in [
              {key: 'recommendedIds' as const, label: 'Recommandé'},
              {key: 'worksWithIds' as const, label: 'Compatible'},
              {key: 'incompatibleIds' as const, label: 'Incompatible (exhaustif)'}
            ]"
            :key="block.key"
        >
          <label class="form-label text-[10px]">{{ block.label }}</label>
          <div class="flex gap-2 mb-2">
            <input
                v-model="compatQueries[block.key]"
                list="suggested-compat-techs"
                type="text"
                class="form-input flex-1 text-xs"
                placeholder="Rechercher une techno…"
                @input="handleCompatInput(block.key, $event)"
                @keydown.enter="handleCompatEnter(block.key, $event)"
            />
            <button
                type="button"
                class="px-3 py-2 bg-white border border-[#c3c4c7] text-[10px] font-bold shrink-0"
                @click="addCompat(block.key)"
            >
              Ajouter
            </button>
          </div>
          <div
              v-if="formBean[block.key].length"
              class="flex flex-wrap gap-2 pt-2 border-t border-[#c3c4c7]/40"
          >
            <span
                v-for="id in formBean[block.key]"
                :key="`${block.key}-${id}`"
                class="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#c3c4c7] rounded-full text-[10px] font-black"
            >
              {{ compatChipName(id) }}
              <button
                  type="button"
                  class="text-slate-400 hover:text-red-500"
                  @click="removeCompat(block.key, id)"
              >✕</button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ZONE DE LOGO / ILLUSTRATION -->
    <div class="form-group col-span-2">
      <label class="form-label">Logo / Illustration</label>
      <div class="file-upload-zone">
        <img
            v-if="formBean.logo"
            :src="fileUrl(formBean.logo)"
            class="w-full max-h-64 object-contain mb-3 bg-white border border-[#c3c4c7] rounded shadow-sm"
            loading="lazy"
        />
        <span v-else class="text-xs text-slate-500 font-bold mb-2 block">Sélectionnez un logo :</span>
        <input type="file" accept="image/*" @change="handleLogoUpload" class="file-input w-full"/>
      </div>
    </div>

    <div class="form-actions">
      <router-link to="/dashboard" class="cancel-btn">Annuler</router-link>
      <button type="submit" class="save-btn">
        {{ isEditMode ? 'Enregistrer les modifications' : 'Créer la technologie' }}
      </button>
    </div>

  </form>

</template>