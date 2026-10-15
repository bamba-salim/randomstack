<script setup lang="ts">
import {ref} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {login} from '#services'
import {validateLogin, AuthValidatorMessages} from '@randomstack/commons'
import {toast} from '../../../lib/toast'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const formError = ref<string | null>(null)
const loading = ref(false)

const clearFormError = () => {
  formError.value = null
}

const handleLogin = async () => {
  if (loading.value) return
  formError.value = null

  const local = validateLogin({email: email.value, password: password.value})
  if (!local.ok) {
    formError.value = local.error
    return
  }

  loading.value = true
  try {
    await login(local.data)
    toast.success('Connexion réussie.')
    const raw = typeof route.query['redirect'] === 'string' ? route.query['redirect'] : '/profile'
    const redirect =
      raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')
        ? raw
        : '/profile'
    await router.push(redirect)
  } catch (err: any) {
    formError.value = err?.message || AuthValidatorMessages.AUTH_FAIL
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
        <h1 class="auth-card__title">Connexion</h1>
        <p class="auth-card__lead">Accède à ton profil RandomStack.</p>
      </header>

      <form class="auth-form" @submit.prevent="handleLogin">
        <label class="auth-form__field">
          <span class="auth-form__label">Email</span>
          <input
              v-model="email"
              type="email"
              autocomplete="email"
              class="auth-form__input"
              @input="clearFormError"
          />
        </label>

        <label class="auth-form__field">
          <span class="auth-form__label">Mot de passe</span>
          <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              class="auth-form__input"
              @input="clearFormError"
          />
        </label>

        <button type="submit" class="btn btn--primary auth-form__submit" :disabled="loading">
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>

        <p v-if="formError" class="auth-form__error" role="alert">{{ formError }}</p>
      </form>

      <p class="auth-card__switch">
        Pas encore de compte ?
        <router-link to="/register">Créer un compte</router-link>
      </p>
    </div>
  </main>
</template>
