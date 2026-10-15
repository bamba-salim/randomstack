<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {register, ApiError} from '#services'
import {validateRegister, AuthValidatorMessages} from '@randomstack/commons'
import {toast} from '../../../lib/toast'

const router = useRouter()
const displayName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const fieldErrors = ref<Record<string, string>>({})
const formError = ref<string | null>(null)
const loading = ref(false)

const clearField = (key: string) => {
  if (fieldErrors.value[key]) {
    const next = {...fieldErrors.value}
    delete next[key]
    fieldErrors.value = next
  }
  formError.value = null
}

const handleRegister = async () => {
  if (loading.value) return
  fieldErrors.value = {}
  formError.value = null

  const local = validateRegister({
    email: email.value,
    password: password.value,
    passwordConfirm: passwordConfirm.value,
    displayName: displayName.value.trim() || undefined
  })
  if (!local.ok) {
    fieldErrors.value = local.errors || (local.field ? {[local.field]: local.error} : {})
    return
  }

  loading.value = true
  try {
    await register(local.data)
    toast.success('Compte créé.')
    await router.push('/profile')
  } catch (err: any) {
    if (err instanceof ApiError && err.errors) {
      fieldErrors.value = err.errors
      return
    }
    if (err instanceof ApiError && err.field) {
      fieldErrors.value = {[err.field]: err.message}
      return
    }
    // Collision email / erreur opaque
    formError.value = err?.message || AuthValidatorMessages.REGISTER_FAIL
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-card">
      <header class="auth-card__header">
        <p class="auth-card__eyebrow">Compte</p>
        <h1 class="auth-card__title">Créer un compte</h1>
        <p class="auth-card__lead">Rejoins RandomStack en quelques secondes.</p>
      </header>

      <form class="auth-form" @submit.prevent="handleRegister">
        <label class="auth-form__field">
          <span class="auth-form__label">Nom d’affichage</span>
          <input
              v-model="displayName"
              type="text"
              autocomplete="nickname"
              :class="['auth-form__input', {'auth-form__input--invalid': fieldErrors.displayName}]"
              placeholder="Optionnel"
              @input="clearField('displayName')"
          />
          <span v-if="fieldErrors.displayName" class="auth-form__field-error">{{ fieldErrors.displayName }}</span>
        </label>

        <label class="auth-form__field">
          <span class="auth-form__label">Email</span>
          <input
              v-model="email"
              type="email"
              autocomplete="email"
              :class="['auth-form__input', {'auth-form__input--invalid': fieldErrors.email}]"
              @input="clearField('email')"
          />
          <span v-if="fieldErrors.email" class="auth-form__field-error">{{ fieldErrors.email }}</span>
        </label>

        <label class="auth-form__field">
          <span class="auth-form__label">Mot de passe</span>
          <input
              v-model="password"
              type="password"
              autocomplete="new-password"
              :class="['auth-form__input', {'auth-form__input--invalid': fieldErrors.password}]"
              @input="clearField('password'); clearField('passwordConfirm')"
          />
          <span v-if="fieldErrors.password" class="auth-form__field-error">{{ fieldErrors.password }}</span>
          <span v-else class="auth-form__hint">8 caractères minimum.</span>
        </label>

        <label class="auth-form__field">
          <span class="auth-form__label">Confirmer le mot de passe</span>
          <input
              v-model="passwordConfirm"
              type="password"
              autocomplete="new-password"
              :class="['auth-form__input', {'auth-form__input--invalid': fieldErrors.passwordConfirm}]"
              @input="clearField('passwordConfirm')"
          />
          <span v-if="fieldErrors.passwordConfirm" class="auth-form__field-error">{{ fieldErrors.passwordConfirm }}</span>
        </label>

        <button type="submit" class="btn btn--primary auth-form__submit" :disabled="loading">
          {{ loading ? 'Création…' : 'Créer mon compte' }}
        </button>

        <p v-if="formError" class="auth-form__error" role="alert">{{ formError }}</p>
      </form>

      <p class="auth-card__switch">
        Déjà un compte ?
        <router-link to="/login">Se connecter</router-link>
      </p>
    </div>
  </main>
</template>
