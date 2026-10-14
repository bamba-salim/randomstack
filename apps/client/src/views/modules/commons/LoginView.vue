<script setup lang="ts">
import {ref} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {login} from '#services'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)
const loading = ref(false)

const handleLogin = async () => {
  if (loading.value) return
  errorMsg.value = null
  loading.value = true

  try {
    await login({email: email.value, password: password.value})
    // Open redirect : uniquement chemins internes (`/foo`), jamais `//evil.com`
    const raw = typeof route.query['redirect'] === 'string' ? route.query['redirect'] : '/profile'
    const redirect =
      raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')
        ? raw
        : '/profile'
    await router.push(redirect)
  } catch (err: any) {
    errorMsg.value = err.message || 'Connexion impossible.'
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

      <div v-if="errorMsg" class="auth-card__error" role="alert">
        {{ errorMsg }}
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <label class="auth-form__field">
          <span class="auth-form__label">Email</span>
          <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="auth-form__input"
          />
        </label>

        <label class="auth-form__field">
          <span class="auth-form__label">Mot de passe</span>
          <input
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="auth-form__input"
          />
        </label>

        <button type="submit" class="btn btn--primary auth-form__submit" :disabled="loading">
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>

      <p class="auth-card__switch">
        Pas encore de compte ?
        <router-link to="/register">Créer un compte</router-link>
      </p>
    </div>
  </main>
</template>
