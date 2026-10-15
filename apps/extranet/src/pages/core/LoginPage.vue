<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {login} from '#services'
import {validateLogin, AuthValidatorMessages} from '@randomstack/commons'
import {toast} from '../../lib/toast'

const router = useRouter()
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
    const user = await login(local.data)
    toast.success('Connexion réussie.')
    router.push(user.role === 'ADMIN' || user.role === 'EDITOR' ? '/dashboard' : '/manage-post')
  } catch (err: any) {
    formError.value = err?.message || AuthValidatorMessages.AUTH_FAIL
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

    <div class="login-card">
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Identifiant ou adresse e-mail</label>
          <input
              v-model="email"
              type="email"
              class="form-input"
              @input="clearFormError"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <input
              v-model="password"
              type="password"
              class="form-input"
              @input="clearFormError"
          />
        </div>

        <button
            type="submit"
            :disabled="loading"
            class="login-btn"
        >
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>

        <p v-if="formError" class="error-box mt-4 mb-0" role="alert">{{ formError }}</p>
      </form>
    </div>

    <div class="login-footer">
      <a href="http://localhost:5173" class="back-link">
        ← Aller sur le site public
      </a>
    </div>

  </div>
</template>
