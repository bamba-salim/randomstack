<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {getMe, updateProfile, logout, uploadFile, fileUrl} from '#services'
import type {SessionUserLite} from '@randomstack/commons'
import {FILE_TYPE, TABLE} from '@randomstack/commons'
import {getAdminNavLinks} from '../../../lib/admin-nav'

type LinkDraft = {label: string; url: string}

const router = useRouter()
const user = ref<SessionUserLite | null>(null)
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

const displayName = ref('')
const bio = ref('')
const photoId = ref<string | null>(null)
const links = ref<LinkDraft[]>([])

const initials = computed(() => (displayName.value || '?').substring(0, 2).toUpperCase())
const adminLinks = computed(() => getAdminNavLinks(user.value?.role))

const hydrateForm = (sessionUser: SessionUserLite) => {
  displayName.value = sessionUser.displayName || ''
  bio.value = sessionUser.bio || ''
  photoId.value = sessionUser.photoId
  links.value = (sessionUser.links || []).map(l => ({label: l.label, url: l.url}))
}

onMounted(async () => {
  loading.value = true
  try {
    user.value = await getMe(true)
    if (!user.value) {
      await router.replace({path: '/login', query: {redirect: '/profile'}})
      return
    }
    hydrateForm(user.value)
  } catch {
    errorMsg.value = 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
})

const addLink = () => {
  links.value.push({label: '', url: ''})
}

const removeLink = (index: number) => {
  links.value.splice(index, 1)
}

const handlePhotoUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploading.value = true
  errorMsg.value = null
  try {
    const {idFile} = await uploadFile(file, FILE_TYPE.IMAGE, TABLE.USER)
    photoId.value = idFile
  } catch (err: any) {
    errorMsg.value = err?.message || 'Échec de l’upload de la photo.'
  } finally {
    uploading.value = false
  }
}

const handleSave = async () => {
  if (saving.value) return
  saving.value = true
  errorMsg.value = null
  successMsg.value = null

  try {
    user.value = await updateProfile({
      displayName: displayName.value.trim(),
      bio: bio.value.trim() || null,
      photoId: photoId.value,
      links: links.value
        .map((l, i) => ({
          label: l.label.trim(),
          url: l.url.trim(),
          sortOrder: i
        }))
        .filter(l => l.label && l.url)
    })
    hydrateForm(user.value)
    successMsg.value = 'Profil mis à jour.'
  } catch (err: any) {
    errorMsg.value = err?.message || 'Impossible d’enregistrer le profil.'
  } finally {
    saving.value = false
  }
}

const handleLogout = async () => {
  await logout()
  await router.push('/login')
}
</script>

<template>
  <main class="auth-page auth-page--wide">
    <div v-if="loading" class="loading-state">Chargement du profil…</div>

    <div v-else-if="errorMsg && !user" class="error-state">{{ errorMsg }}</div>

    <form v-else-if="user" class="profile-card profile-card--edit" @submit.prevent="handleSave">
      <header class="profile-card__header">
        <p class="profile-card__eyebrow">Profil</p>
        <h1 class="profile-card__title">Mon compte</h1>
        <p class="profile-card__email">{{ user.email }}</p>
      </header>

      <div v-if="errorMsg" class="auth-card__error" role="alert">{{ errorMsg }}</div>
      <div v-if="successMsg" class="profile-card__success" role="status">{{ successMsg }}</div>

      <section v-if="adminLinks.length > 0" class="profile-card__admin">
        <h2 class="profile-card__section-title">Administration</h2>
        <p class="profile-card__admin-lead">Accès extranet selon ton rôle ({{ user.role }}).</p>
        <div class="profile-card__admin-links">
          <a
              v-for="link in adminLinks"
              :key="link.href"
              class="btn btn--primary"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
          >
            {{ link.label }}
          </a>
        </div>
      </section>

      <div class="profile-card__identity">
        <div class="profile-card__photo profile-card__photo--lg">
          <img
              v-if="photoId"
              :src="fileUrl(photoId)"
              :alt="displayName || 'Photo de profil'"
          />
          <span v-else>{{ initials }}</span>
        </div>
        <div class="profile-card__photo-actions">
          <label class="btn btn--secondary profile-card__upload">
            {{ uploading ? 'Upload…' : 'Changer la photo' }}
            <input
                type="file"
                accept="image/*"
                class="sr-only"
                :disabled="uploading"
                @change="handlePhotoUpload"
            />
          </label>
          <button
              v-if="photoId"
              type="button"
              class="btn btn--secondary"
              @click="photoId = null"
          >
            Retirer
          </button>
        </div>
      </div>

      <label class="auth-form__field">
        <span class="auth-form__label">Nom d’affichage</span>
        <input v-model="displayName" type="text" required maxlength="80" class="auth-form__input"/>
      </label>

      <label class="auth-form__field">
        <span class="auth-form__label">Bio</span>
        <textarea
            v-model="bio"
            rows="4"
            class="auth-form__input auth-form__textarea"
            placeholder="Quelques mots sur toi…"
        />
      </label>

      <section class="profile-card__links">
        <div class="profile-card__links-head">
          <h2 class="profile-card__section-title">Liens portfolio</h2>
          <button type="button" class="btn btn--secondary" @click="addLink">+ Ajouter</button>
        </div>

        <div v-if="links.length === 0" class="profile-card__empty">
          Aucun lien pour le moment.
        </div>

        <div v-for="(link, index) in links" :key="index" class="profile-card__link-row">
          <input
              v-model="link.label"
              type="text"
              class="auth-form__input"
              placeholder="Label (GitHub, Site…)"
          />
          <input
              v-model="link.url"
              type="url"
              class="auth-form__input"
              placeholder="https://…"
          />
          <button type="button" class="btn btn--secondary" @click="removeLink(index)">
            Retirer
          </button>
        </div>
      </section>

      <div class="profile-card__actions">
        <button type="submit" class="btn btn--primary" :disabled="saving || uploading">
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <button type="button" class="btn btn--secondary" @click="handleLogout">
          Se déconnecter
        </button>
      </div>
    </form>
  </main>
</template>
