<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {AuthService} from '#services'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)
const loading = ref(false)

const handleLogin = async () => {
  if (loading.value) return
  errorMsg.value = null
  loading.value = true

  try {
    await AuthService.login({email: email.value, password: password.value})
    router.push('/dashboard') // Redirection automatique 🚀
  } catch (err: any) {
    // Affiche l'erreur précise (ex: "Ce compte n'existe pas." ou "Mot de passe incorrect")
    errorMsg.value = err.message || "Une erreur est survenue lors de la connexion."
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

      <div v-if="errorMsg" class="error-box">
        <strong>Erreur :</strong> {{ errorMsg }}
      </div>

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