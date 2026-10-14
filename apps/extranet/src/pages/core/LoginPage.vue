<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {login} from '#services'
import {toast} from '../../lib/toast'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (loading.value) return
  loading.value = true

  try {
    const user = await login({email: email.value, password: password.value})
    toast.success('Connexion réussie.')
    router.push(user.role === 'ADMIN' || user.role === 'EDITOR' ? '/dashboard' : '/manage-post')
  } catch (err: any) {
    toast.error(err.message || 'Une erreur est survenue lors de la connexion.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page-container">

    <div class="login-header">
      <h2 class="logo-title">RANDOMSTACK</h2>
    </div>

    <!-- CARTE DE CONNEXION WORDPRESS STYLE -->
    <div class="login-card">

      <form @submit.prevent="handleLogin">

        <div class="form-group">
          <label class="form-label">Identifiant ou adresse e-mail</label>
          <input
              v-model="email"
              type="email"
              required
              class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <input
              v-model="password"
              type="password"
              required
              class="form-input"
          />
        </div>

        <button
            type="submit"
            :disabled="loading"
            class="login-btn"
        >
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>

      </form>
    </div>

    <div class="login-footer">
      <a href="http://localhost:5173" class="back-link">
        ← Aller sur le site public
      </a>
    </div>

  </div>
</template>