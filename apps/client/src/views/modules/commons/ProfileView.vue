<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {
  getMe,
  updateProfile,
  logout,
  uploadFile,
  fileUrl,
  fetchFavorites,
  toggleFavorite
} from '#services'
import type {SessionUserLite, PublicPostListed} from '@randomstack/commons'
import {FILE_TYPE, TABLE} from '@randomstack/commons'
import {getAdminNavLinks} from '../../../lib/admin-nav'
import {toast} from '../../../lib/toast'
import PostCard from '../blog/components/PostCard.vue'

type LinkDraft = {label: string; url: string}

const router = useRouter()
const user = ref<SessionUserLite | null>(null)
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const loadError = ref<string | null>(null)

const displayName = ref('')
const bio = ref('')
const photoId = ref<string | null>(null)
const favoritesPublic = ref(false)
const links = ref<LinkDraft[]>([])
const favorites = ref<PublicPostListed[]>([])
const favoritesLoading = ref(false)
const removingFavoriteId = ref<string | null>(null)

const initials = computed(() => (displayName.value || '?').substring(0, 2).toUpperCase())
const adminLinks = computed(() => getAdminNavLinks(user.value?.role))

const hydrateForm = (sessionUser: SessionUserLite) => {
  displayName.value = sessionUser.displayName || ''
  bio.value = sessionUser.bio || ''
  photoId.value = sessionUser.photoId
  favoritesPublic.value = Boolean(sessionUser.favoritesPublic)
  links.value = (sessionUser.links || []).map(l => ({label: l.label, url: l.url}))
}

const loadFavorites = async () => {
  favoritesLoading.value = true
  try {
    const data = await fetchFavorites()
    favorites.value = data.favorites
  } catch {
    favorites.value = []
  } finally {
    favoritesLoading.value = false
  }
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
    await loadFavorites()
  } catch {
    loadError.value = 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
})

const handleRemoveFavorite = async (post: PublicPostListed) => {
  if (removingFavoriteId.value) return
  removingFavoriteId.value = post.id
  try {
    await toggleFavorite(post.id)
    favorites.value = favorites.value.filter(f => f.id !== post.id)
    toast.success('Retiré des favoris.')
  } catch {
    toast.error('Impossible de retirer ce favori.')
  } finally {
    removingFavoriteId.value = null
  }
}

const handleToggleFavoritesPublic = async () => {
  if (!user.value || saving.value) return
  const next = !favoritesPublic.value
  favoritesPublic.value = next
  saving.value = true
  try {
    user.value = await updateProfile({
      displayName: displayName.value.trim() || user.value.displayName || 'User',
      bio: bio.value.trim() || null,
      photoId: photoId.value,
      favoritesPublic: next,
      links: links.value
        .map((l, i) => ({
          label: l.label.trim(),
          url: l.url.trim(),
          sortOrder: i
        }))
        .filter(l => l.label && l.url)
    })
    hydrateForm(user.value)
    toast.success(
      next
        ? 'Tes favoris sont visibles sur ton profil public.'
        : 'Tes favoris sont maintenant privés.'
    )
  } catch (err: any) {
    favoritesPublic.value = !next
    toast.error(err?.message || 'Impossible de mettre à jour la visibilité.')
  } finally {
    saving.value = false
  }
}

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
  try {
    const {idFile} = await uploadFile(file, FILE_TYPE.IMAGE, TABLE.USER)
    photoId.value = idFile
    toast.success('Photo mise à jour.')
  } catch (err: any) {
    toast.error(err?.message || 'Échec de l’upload de la photo.')
  } finally {
    uploading.value = false
  }
}

const handleSave = async () => {
  if (saving.value) return
  if (!photoId.value) {
    toast.error('Une photo de profil est obligatoire.')
    return
  }
  saving.value = true

  try {
    user.value = await updateProfile({
      displayName: displayName.value.trim(),
      bio: bio.value.trim() || null,
      photoId: photoId.value,
      favoritesPublic: favoritesPublic.value,
      links: links.value
        .map((l, i) => ({
          label: l.label.trim(),
          url: l.url.trim(),
          sortOrder: i
        }))
        .filter(l => l.label && l.url)
    })
    hydrateForm(user.value)
    toast.success('Profil mis à jour.')
  } catch (err: any) {
    toast.error(err?.message || 'Impossible d’enregistrer le profil.')
  } finally {
    saving.value = false
  }
}

const handleLogout = async () => {
  await logout()
  toast.success('Déconnexion.')
  await router.push('/login')
}
</script>

<template>
  <main class="auth-page auth-page--wide profile-page">
    <div v-if="loading" class="loading-state">Chargement du profil…</div>

    <div v-else-if="loadError && !user" class="error-state">{{ loadError }}</div>

    <template v-else-if="user">
    <form class="profile-card profile-card--edit" @submit.prevent="handleSave">
      <header class="profile-card__header">
        <p class="profile-card__eyebrow">Profil</p>
        <h1 class="profile-card__title">Modifier mon profil</h1>
        <p class="profile-card__email">{{ user.email }}</p>
        <router-link v-if="user.id" :to="`/u/${user.id}`" class="profile-card__public-link">
          Voir mon profil public →
        </router-link>
      </header>

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
            {{ uploading ? 'Upload…' : (photoId ? 'Changer la photo' : 'Ajouter une photo') }}
            <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                class="sr-only"
                :disabled="uploading"
                @change="handlePhotoUpload"
            />
          </label>
          <p v-if="!photoId" class="profile-card__photo-hint">Photo obligatoire pour enregistrer le profil.</p>
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

    <section class="profile-card profile-card--favorites">
      <header class="profile-card__header profile-card__favorites-head">
        <div>
          <h2 class="profile-card__section-title">Articles favoris</h2>
          <p class="profile-card__admin-lead">
            {{ favorites.length }} marque-page{{ favorites.length > 1 ? 's' : '' }}
          </p>
        </div>
        <button
            type="button"
            class="favorites-visibility-btn"
            :class="{ 'is-active': favoritesPublic }"
            :disabled="saving"
            :title="favoritesPublic ? 'Favoris visibles sur ton profil public' : 'Favoris privés'"
            @click="handleToggleFavoritesPublic"
        >
          {{ favoritesPublic ? 'Favoris visibles' : 'Favoris privés' }}
        </button>
      </header>

      <div v-if="favoritesLoading" class="profile-card__empty">Chargement…</div>
      <div v-else-if="favorites.length === 0" class="profile-card__empty">
        Aucun article enregistré. Sur un article, clique ★ Favori.
      </div>
      <ul v-else class="profile-favorites-list">
        <li v-for="fav in favorites" :key="fav.id" class="profile-favorites-list__item">
          <PostCard :post="fav"/>
          <button
              type="button"
              class="profile-favorites-list__remove"
              :disabled="removingFavoriteId === fav.id"
              title="Retirer des favoris"
              aria-label="Retirer des favoris"
              @click.stop="handleRemoveFavorite(fav)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </li>
      </ul>
    </section>
    </template>
  </main>
</template>
