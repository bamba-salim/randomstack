<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {createUser} from '#services'
import {BaseInput} from '#components'
import type {Role} from '@randomstack/commons'

const router = useRouter()

const form = ref({
  email: '',
  password: '',
  displayName: '',
  role: 'USER' as Role
})

const roles: Role[] = ['USER', 'AUTHOR', 'MODERATOR', 'EDITOR', 'ADMIN']
const saving = ref(false)
const errorMsg = ref<string | null>(null)

const handleSubmit = async () => {
  if (saving.value) return

  errorMsg.value = null
  saving.value = true

  try {
    const result = await createUser({
      email: form.value.email.trim(),
      password: form.value.password,
      displayName: form.value.displayName.trim(),
      role: form.value.role
    })
    await router.push(`/edit-user/${result.user.id}`)
  } catch (err: any) {
    errorMsg.value = err?.message || 'Impossible de créer l’utilisateur.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <header class="main-header">
    <div>
      <h1 class="header-title">Nouvel utilisateur</h1>
      <p class="header-sub">Créer un compte avec un rôle défini</p>
    </div>
    <button type="button" class="edit-btn" @click="router.push('/manage-user')">
      ← Retour à la liste
    </button>
  </header>

  <form class="form-page-container max-w-lg" @submit.prevent="handleSubmit">
    <div v-if="errorMsg" class="error-box mb-4">{{ errorMsg }}</div>

    <BaseInput v-model="form.displayName" label="Nom d’affichage" required />
    <BaseInput v-model="form.email" label="Email" type="email" required />
    <BaseInput
        v-model="form.password"
        label="Mot de passe (min. 8 caractères)"
        type="password"
        required
    />

    <div class="form-group mb-2">
      <label class="form-label">Rôle</label>
      <select v-model="form.role" class="form-input" required>
        <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
      </select>
    </div>

    <div class="form-actions border-t border-[#c3c4c7] pt-6 mt-4 flex gap-3">
      <button
          type="submit"
          class="save-btn"
          :disabled="saving"
      >
        {{ saving ? 'Création…' : 'Créer l’utilisateur' }}
      </button>
    </div>
  </form>
</template>
