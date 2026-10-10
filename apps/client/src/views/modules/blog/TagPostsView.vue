<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {useRoute} from 'vue-router'
import {fetchPostsByTag} from '#services'
import { Breadcrumbs} from '#components'
import type {Post} from '@randomstack/commons'

import FeaturedPostCard from './components/FeaturedPostCard.vue'
import PostCard from './components/PostCard.vue'

const route = useRoute()
const currentTag = ref('')

const featuredPost = ref<Post | null>(null)
const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const loadData = async (tag: string) => {
  loading.value = true
  error.value = null
  currentTag.value = tag

  try {
    const response = await fetchPostsByTag(tag)
    featuredPost.value = response.featured
    posts.value = response.posts
  } catch {
    error.value = "Impossible de récupérer les articles pour ce mot-clé."
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData(route.params['tag'] as string)
})

watch(() => route.params['tag'], (newTag) => {
  if (newTag) loadData(newTag as string)
})
</script>

<template>
  <!-- Conteneur universel large aligné au pixel près avec le reste du site -->
  <main class="container-catalog py-8">

    <!-- Fil d'Ariane -->
    <Breadcrumbs :items="[{ label: 'Blog', to: '/' },{ label: currentTag, uppercase: true }]"/>

    <!-- En-tête de page universel (variante centrée) -->
    <header class="page-header page-header--center">
      <h1 class="page-title">#{{ currentTag.toUpperCase() }}</h1>
      <p class="page-subtitle">Tous les articles, tutoriels et nouveautés sur {{ currentTag }}</p>
    </header>

    <!-- États d'interface universels -->
    <div v-if="loading" class="loading-state">Recherche d'articles en cours...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>

    <!-- Contenu : Article à la une + Grille universelle à 2 colonnes -->
    <div v-else class="flex flex-col gap-8 w-full">
      <FeaturedPostCard v-if="featuredPost" :post="featuredPost"/>

      <div v-if="posts.length > 0" class="grid-cards grid-cards--2">
        <PostCard v-for="post in posts" :key="post.id" :post="post"/>
      </div>

      <p v-if="!featuredPost && posts.length === 0" class="empty-state">
        Aucun article publié pour le moment avec le tag #{{ currentTag }}.
      </p>
    </div>

  </main>
</template>