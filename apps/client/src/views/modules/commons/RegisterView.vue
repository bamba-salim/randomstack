<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {register} from '#services'
import {toast} from '../../../lib/toast'

const router = useRouter()
const displayName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleRegister = async () => {
  if (loading.value) return
  loading.value = true

  try {
    await register({
      email: email.value,
      password: password.value,
      displayName: displayName.value.trim() || undefined
    })
    toast.success('Compte créé.')
    await router.push('/profile')
  } catch (err: any) {
    toast.error(err.message || 'Inscription impossible.')
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
              class="auth-form__input"
              placeholder="Optionnel"
          />
        </label>

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
              minlength="8"
              autocomplete="new-password"
              class="auth-form__input"
          />
          <span class="auth-form__hint">8 caractères minimum.</span>
        </label>

        <button type="submit" class="btn btn--primary auth-form__submit" :disabled="loading">
          {{ loading ? 'Création…' : 'Créer mon compte' }}
        </button>
      </form>

      <p class="auth-card__switch">
        Déjà un compte ?
        <router-link to="/login">Se connecter</router-link>
      </p>
    </div>
  </main>
</template>
