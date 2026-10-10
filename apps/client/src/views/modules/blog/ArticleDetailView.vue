<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {fetchPostBySlug} from '#services'
import {Breadcrumbs} from '#components'
import type {PublicPostDetail} from '@randomstack/commons'

import BlockRenderer from './components/BlockRenderer.vue'

const route = useRoute()
const post = ref<PublicPostDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

onMounted(async () => {
  const slug = route.params['slug'] as string
  const isPreview = route.query['preview'] === 'true'

  try {
    post.value = await fetchPostBySlug(slug, isPreview)
  } catch {
    error.value = "Impossible de charger cet article. Il a peut-être été supprimé ou n'est pas encore publié."
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="container-catalog py-8 flex flex-col items-center">

    <!-- États d'interface universels -->
    <div v-if="loading" class="loading-state">
      Chargement de l'article...
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <!-- Conteneur de lecture centré (max-w-3xl = largeur d'or pour la typographie) -->
    <article v-else-if="post" class="w-full max-w-3xl flex flex-col">

      <!-- Fil d'Ariane universel -->
      <Breadcrumbs :items="[
  { label: 'Blog', to: '/' },
  ...(post.tags?.[0] ? [{ label: post.tags[0], to: `/${post.tags[0]}`, uppercase: true }] : []),
  { label: post.title }
]"/>

      <!-- En-tête de page universel -->
      <header class="page-header mt-4">
        <h1 class="page-title">{{ post.title }}</h1>
        <div class="page-meta">
          <span>Publié le {{ formatDate(post.publishAt || post.createdAt) }}</span>
          <span v-if="route.query['preview'] === 'true'" class="badge badge--primary">
            Mode Prévisualisation
          </span>
        </div>
      </header>

      <!-- Image de couverture de l'article -->
      <figure v-if="post.imageId" class="w-full bg-[#f6f8fa] border border-[#c3c4c7] overflow-hidden mb-8">
        <img
            :src="`http://localhost:4000/files/${post.imageId}`"
            :alt="post.title"
            class="w-full h-auto max-h-[480px] object-cover"
        />
      </figure>

      <!-- Corps de l'article (géré par les blocs et components/_article-content.scss) -->
      <div class="post-content-body flex flex-col gap-6 w-full text-left">
        <BlockRenderer v-for="(block, index) in post.content" :key="index" :block="block"/>
      </div>

      <!-- Séparateur éditorial -->
      <hr class="border-0 border-t border-[#c3c4c7] my-8 w-full"/>

      <!-- Badges de Tags universels (adieu le pavé de 14 classes !) -->
      <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2">
        <router-link
            v-for="tag in post.tags"
            :key="tag"
            :to="`/${tag}`"
            class="badge badge--neutral badge--clickable"
        >
          #{{ tag }}
        </router-link>
      </div>

      <!-- Emplacement prêt pour la prochaine étape : Articles Recommandés -->
      <section class="similar-articles-placeholder mt-10">
        <!-- On branchera nos recommandations ici -->
      </section>

    </article>

  </main>
</template>