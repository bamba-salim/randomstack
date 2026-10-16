<script setup lang="ts">
import {computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {getMe} from '#services'

const route = useRoute()
const router = useRouter()

const code = computed(() => {
  const fromMeta = route.meta['errorCode']
  const fromQuery = route.query['code']
  const raw = fromMeta ?? fromQuery ?? 404
  const n = Number(raw)
  return Number.isFinite(n) ? n : 404
})

const copy = computed(() => {
  switch (code.value) {
    case 403:
      return {
        title: 'Accès refusé',
        message: 'Ton rôle ne permet pas d’ouvrir cette page.'
      }
    case 500:
      return {
        title: 'Erreur serveur',
        message: 'Un problème est survenu. Réessaie dans un moment.'
      }
    default:
      return {
        title: 'Page introuvable',
        message: 'Cette URL n’existe pas dans l’extranet.'
      }
  }
})

const goHome = async () => {
  try {
    const user = await getMe(true)
    if (!user) {
      router.push('/login')
      return
    }
    router.push(user.role === 'ADMIN' || user.role === 'EDITOR' ? '/dashboard' : '/manage-post')
  } catch {
    router.push('/login')
  }
}
</script>

<template>
  <div class="admin-error-page">
    <p class="admin-error-page__code" aria-hidden="true">{{ code }}</p>
    <h1 class="admin-error-page__title">{{ copy.title }}</h1>
    <p class="admin-error-page__message">{{ copy.message }}</p>
    <div class="admin-error-page__actions">
      <button type="button" class="add-btn" @click="goHome">
        Retour au tableau de bord
      </button>
      <router-link to="/login" class="cancel-btn">
        Connexion
      </router-link>
    </div>
  </div>
</template>
