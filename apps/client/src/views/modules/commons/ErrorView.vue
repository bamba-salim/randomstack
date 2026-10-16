<script setup lang="ts">
import {computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'

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
        message: 'Tu n’as pas les droits pour voir cette page.',
        hint: 'Connecte-toi avec un compte autorisé, ou reviens à l’accueil.'
      }
    case 500:
      return {
        title: 'Erreur serveur',
        message: 'Un problème est survenu de notre côté.',
        hint: 'Réessaie dans un instant. Si ça continue, reviens plus tard.'
      }
    default:
      return {
        title: 'Page introuvable',
        message: 'Cette adresse n’existe pas, ou le contenu a été déplacé.',
        hint: 'Vérifie l’URL, ou explore le blog et le générateur.'
      }
  }
})

const goHome = () => router.push('/')
const goBack = () => {
  if (window.history.length > 1) router.back()
  else goHome()
}
</script>

<template>
  <main class="error-page container-catalog py-12">
    <p class="error-page__code" aria-hidden="true">{{ code }}</p>
    <h1 class="error-page__title">{{ copy.title }}</h1>
    <p class="error-page__message">{{ copy.message }}</p>
    <p class="error-page__hint">{{ copy.hint }}</p>

    <div class="error-page__actions">
      <button type="button" class="btn btn--primary" @click="goHome">
        Accueil
      </button>
      <button type="button" class="btn btn--secondary" @click="goBack">
        Retour
      </button>
      <router-link to="/encyclopedia" class="btn btn--secondary">
        Encyclopédie
      </router-link>
    </div>
  </main>
</template>
