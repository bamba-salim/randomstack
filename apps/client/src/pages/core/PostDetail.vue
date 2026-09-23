<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { PostService } from '#services'
import { BlockRenderer } from '#components'
import type { Post } from '@randomstack/commons'

const route = useRoute()
const post = ref<Post | null>(null)
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
    post.value = await PostService.fetchBySlug(slug, isPreview)
  } catch {
    error.value = "Impossible de charger cet article. Il a peut-être été supprimé ou n'est pas encore publié."
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="technology-detail-page-container">
    <div v-if="loading" class="loading-state">Chargement de l'article...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>

    <article v-else-if="post" class="detail-layout-card max-w-4xl mx-auto !p-8 sm:!p-12">

      <!-- BREADCRUMB (FIL D'ARIANE) CORRIGÉ 🚀 -->
      <nav class="breadcrumb-nav">
        <router-link to="/">Blog</router-link>

        <template v-if="post.tags && post.tags.length > 0">
          <span class="separator">/</span>
          <span class="current uppercase">{{ post.tags[0] }}</span>
        </template>

        <span class="separator">/</span>
        <span class="current">{{ post.title }}</span>
      </nav>

      <!-- EN-TÊTE DE L'ARTICLE -->
      <header class="post-header mb-8 border-b border-[#c3c4c7]/40 pb-8 mt-4">
        <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
          <span v-for="tag in post.tags" :key="tag" class="px-2.5 py-0.5 rounded-none text-[9px] font-extrabold uppercase border border-[#c3c4c7] text-slate-500 bg-[#f6f8fa]">
            #{{ tag }}
          </span>
        </div>

        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#1d2327] tracking-tight leading-snug mb-4" style="font-family: 'Georgia', serif;">
          {{ post.title }}
        </h1>

        <div class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span>Publié le {{ formatDate(post.publishAt || post.createdAt) }}</span>
          <span v-if="route.query['preview'] === 'true'" class="text-pink-500 border border-pink-500 px-2 py-0.5 rounded">Mode Prévisualisation</span>
        </div>
      </header>

      <!-- IMAGE DE COUVERTURE -->
      <figure v-if="post.imageId" class="w-full mb-10 bg-slate-50 border border-[#c3c4c7] overflow-hidden">
        <img :src="`http://localhost:4000/api/files/${post.imageId}`" class="w-full h-auto max-h-[500px] object-cover" />
      </figure>

      <!-- CORPS DE L'ARTICLE 🚀 -->
      <div class="post-content-body flex flex-col gap-6 w-full text-left">
        <BlockRenderer v-for="(block, index) in post.content" :key="index" :block="block" />
      </div>

    </article>
  </div>
</template>