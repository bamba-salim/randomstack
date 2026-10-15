<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {fetchUserById, updateUserRole, createUser, fileUrl, getMe, ApiError} from '#services'
import {BaseInput} from '#components'
import {toast} from '../../lib/toast'
import {validateCreateUser} from '@randomstack/commons'
import type {AdminUserDetail, Role} from '@randomstack/commons'

const route = useRoute()
const router = useRouter()

const userId = computed(() => {
  const id = route.params['id']
  return typeof id === 'string' && id.length > 0 ? id : undefined
})
const isCreateMode = computed(() => !userId.value)

const user = ref<AdminUserDetail | null>(null)
const selectedRole = ref<Role>('USER')
const actorRole = ref<Role | null>(null)
const loading = ref(true)
const saving = ref(false)
const loadError = ref<string | null>(null)

const createForm = ref({
  email: '',
  password: '',
  passwordConfirm: '',
  displayName: '',
  role: 'USER' as Role
})
const fieldErrors = ref<Record<string, string>>({})

const clearFieldError = (key: string) => {
  if (!fieldErrors.value[key]) return
  const next = {...fieldErrors.value}
  delete next[key]
  fieldErrors.value = next
}

const isAdmin = computed(() => actorRole.value === 'ADMIN')
const isModerator = computed(() => actorRole.value === 'MODERATOR')
const isEditor = computed(() => actorRole.value === 'EDITOR')

/** MODERATOR : USER ↔ AUTHOR ; ADMIN : tous les rôles ; EDITOR : lecture seule */
const canChangeRole = computed(() => {
  if (isCreateMode.value) return isAdmin.value
  if (!user.value) return false
  if (isAdmin.value) return true
  return isModerator.value && (user.value.role === 'USER' || user.value.role === 'AUTHOR')
})

const roles = computed<Role[]>(() => {
  if (isAdmin.value) return ['USER', 'AUTHOR', 'MODERATOR', 'EDITOR', 'ADMIN']
  if (canChangeRole.value) return ['USER', 'AUTHOR']
  return user.value ? [user.value.role] : []
})

const initials = computed(() => (user.value?.displayName || '?').substring(0, 2).toUpperCase())
const roleDirty = computed(() => user.value != null && selectedRole.value !== user.value.role)

const pageTitle = computed(() => (isCreateMode.value ? 'Nouvel utilisateur' : 'Fiche utilisateur'))
const pageSub = computed(() => {
  if (isCreateMode.value) return 'Créer un compte avec un rôle défini'
  if (isEditor.value) return 'Fiche auteur — profil et articles (lecture seule)'
  if (isModerator.value && !isAdmin.value) return 'Consultation — bascule USER ↔ AUTHOR'
  return 'Consultation du profil — seul le rôle est modifiable'
})

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

const handleCreate = async () => {
  if (!isAdmin.value || saving.value) return
  fieldErrors.value = {}

  const local = validateCreateUser(createForm.value)
  if (!local.ok) {
    fieldErrors.value = local.errors || (local.field ? {[local.field]: local.error} : {})
    return
  }

  saving.value = true
  try {
    const result = await createUser(local.data)
    toast.success('Utilisateur créé.')
    await router.replace(`/edit-user/${result.user.id}`)
    user.value = await fetchUserById(result.user.id)
    selectedRole.value = user.value.role
  } catch (err: any) {
    if (err instanceof ApiError && err.errors) {
      fieldErrors.value = err.errors
      return
    }
    if (err instanceof ApiError && err.field) {
      fieldErrors.value = {[err.field]: err.message}
      return
    }
    toast.error(err?.message || 'Impossible de créer ce compte.')
  } finally {
    saving.value = false
  }
}

const handleSaveRole = async () => {
  if (!user.value || saving.value || !canChangeRole.value) return

  if (selectedRole.value === user.value.role) {
    toast.info('Modifie le rôle avant d’enregistrer.')
    return
  }

  saving.value = true
  try {
    const result = await updateUserRole(user.value.id, selectedRole.value)
    user.value = {...user.value, role: result.user.role}
    selectedRole.value = result.user.role
    toast.success(`Rôle mis à jour : ${result.user.role}`)
  } catch (err: any) {
    toast.error(err?.message || 'Échec de la mise à jour du rôle.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  loadError.value = null

  try {
    const me = await getMe()
    actorRole.value = me?.role ?? null

    if (isCreateMode.value) {
      if (!isAdmin.value) {
        loadError.value = 'Seul un administrateur peut créer un utilisateur.'
        return
      }
      selectedRole.value = 'USER'
      return
    }

    user.value = await fetchUserById(userId.value!)
    selectedRole.value = user.value.role
  } catch {
    loadError.value = isCreateMode.value
      ? 'Impossible d’initialiser le formulaire.'
      : 'Impossible de charger cet utilisateur.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <header class="main-header">
    <div>
      <h1 class="header-title">{{ pageTitle }}</h1>
      <p class="header-sub">{{ pageSub }}</p>
    </div>
    <button type="button" class="edit-btn" @click="router.push('/manage-user')">
      ← Retour à la liste
    </button>
  </header>

  <div v-if="loading" class="loading-text">Chargement…</div>
  <div v-else-if="loadError && !user && !isCreateMode" class="error-box">{{ loadError }}</div>
  <div v-else-if="loadError && isCreateMode" class="error-box">{{ loadError }}</div>

  <!-- Création -->
  <form
      v-else-if="isCreateMode && isAdmin"
      class="form-page-container max-w-lg"
      @submit.prevent="handleCreate"
  >
    <BaseInput
        v-model="createForm.displayName"
        label="Nom d’affichage"
        :error="fieldErrors.displayName"
        @clear-error="clearFieldError('displayName')"
    />
    <BaseInput
        v-model="createForm.email"
        label="Email"
        type="email"
        :error="fieldErrors.email"
        @clear-error="clearFieldError('email')"
    />
    <BaseInput
        v-model="createForm.password"
        label="Mot de passe (min. 8 caractères)"
        type="password"
        :error="fieldErrors.password"
        @clear-error="clearFieldError('password'); clearFieldError('passwordConfirm')"
    />
    <BaseInput
        v-model="createForm.passwordConfirm"
        label="Confirmer le mot de passe"
        type="password"
        :error="fieldErrors.passwordConfirm"
        @clear-error="clearFieldError('passwordConfirm')"
    />

    <div class="form-group mb-2">
      <label class="form-label">Rôle</label>
      <select
          v-model="createForm.role"
          :class="['form-input', {'form-input--invalid': fieldErrors.role}]"
          @change="clearFieldError('role')"
      >
        <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
      </select>
      <p v-if="fieldErrors.role" class="form-field-error">{{ fieldErrors.role }}</p>
    </div>

    <div class="form-actions border-t border-[#c3c4c7] pt-6 mt-4 flex gap-3">
      <button type="submit" class="save-btn" :disabled="saving">
        {{ saving ? 'Création…' : 'Créer l’utilisateur' }}
      </button>
    </div>
  </form>

  <!-- Édition / consultation -->
  <div v-else-if="user" class="form-page-container user-detail">
    <section class="user-detail__card">
      <div class="user-detail__identity">
        <div class="user-detail__photo">
          <img
              v-if="user.photoId"
              :src="fileUrl(user.photoId)"
              :alt="user.displayName"
              loading="lazy"
          />
          <span v-else>{{ initials }}</span>
        </div>
        <div>
          <p class="user-detail__eyebrow">Profil</p>
          <h2 class="user-detail__name">{{ user.displayName }}</h2>
          <p class="user-detail__email">{{ user.email }}</p>
        </div>
      </div>

      <dl class="user-detail__meta">
        <div>
          <dt>Bio</dt>
          <dd>{{ user.bio || '—' }}</dd>
        </div>
        <div>
          <dt>Inscription</dt>
          <dd>{{ formatDate(user.createdAt) }}</dd>
        </div>
        <div>
          <dt>Dernière mise à jour</dt>
          <dd>{{ formatDate(user.updatedAt) }}</dd>
        </div>
      </dl>
    </section>

    <section class="user-detail__card">
      <h3 class="user-detail__section-title">Rôle actuel : {{ user.role }}</h3>

      <template v-if="canChangeRole">
        <div class="user-detail__role-row">
          <select v-model="selectedRole" class="form-input max-w-xs">
            <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
          </select>
          <button
              type="button"
              class="save-btn"
              :disabled="saving || !roleDirty"
              @click="handleSaveRole"
          >
            {{ saving ? 'Enregistrement…' : 'Enregistrer le rôle' }}
          </button>
        </div>
        <p v-if="roleDirty" class="user-detail__hint">
          Changement en attente : {{ user.role }} → {{ selectedRole }}
        </p>
        <p v-if="isModerator && !isAdmin" class="user-detail__empty mt-2">
          En tant que modérateur, tu peux uniquement basculer entre USER et AUTHOR.
        </p>
      </template>

      <p v-else class="user-detail__empty">
        {{ isEditor
          ? 'Rôle non modifiable — consulte les articles ci-dessous.'
          : isModerator
            ? 'Lecture seule — seuls les comptes USER et AUTHOR sont modifiables.'
            : 'Modification du rôle non disponible.' }}
      </p>
    </section>

    <section class="user-detail__card">
      <h3 class="user-detail__section-title">
        Liens portfolio ({{ user.links.length }})
      </h3>
      <ul v-if="user.links.length" class="user-detail__links">
        <li v-for="link in user.links" :key="link.id">
          <span class="user-detail__link-label">{{ link.label }}</span>
          <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.url }}</a>
        </li>
      </ul>
      <p v-else class="user-detail__empty">Aucun lien renseigné.</p>
    </section>

    <section class="user-detail__card">
      <h3 class="user-detail__section-title">
        Articles ({{ user.posts.length }})
      </h3>
      <div v-if="user.posts.length" class="table-container">
        <table class="admin-table">
          <thead>
          <tr>
            <th>Titre</th>
            <th>Statut</th>
            <th>Tags</th>
            <th>Publication</th>
            <th class="text-right">Action</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="post in user.posts" :key="post.id">
            <td class="tech-name">{{ post.title }}</td>
            <td>
              <span class="category-badge" :class="post.status.toLowerCase()">
                {{ post.status }}
              </span>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span v-for="tag in post.tags" :key="tag" class="category-badge">#{{ tag }}</span>
              </div>
            </td>
            <td class="tech-lang">
              {{ post.publishAt ? new Date(post.publishAt).toLocaleDateString('fr-FR') : '—' }}
            </td>
            <td class="text-right">
              <router-link :to="`/edit-post/${post.id}`" class="edit-btn">Éditer</router-link>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="user-detail__empty">Aucun article associé.</p>
    </section>
  </div>
</template>
