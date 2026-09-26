<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PostService } from '#services'
import { FeaturedPostCard, PostCard } from '#components' // 🚀
import type { Post } from '@randomstack/commons'

const router = useRouter()

const featuredPost = ref<Post | null>(null)
const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const response = await PostService.fetchPublishedPosts()
    featuredPost.value = response.featured
    posts.value = response.posts
  } catch {
    error.value = "Impossible de récupérer les dernières actualités."
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="lobby-page-container">
    <div class="lobby-layout-grid max-w-6xl w-full mx-auto">

      <!-- COLONNE GAUCHE : LE FLUX D'ACTUALITÉS 🚀 -->
      <section class="news-main-section flex-1 min-w-0">
        <h2 class="section-title mb-4">📰 Dernières Actualités</h2>

        <div v-if="loading" class="text-xs text-blue-500 font-bold py-6 animate-pulse">
          Chargement des actualités...
        </div>

        <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 text-red-600 rounded-none text-xs">
          {{ error }}
        </div>

        <div v-else class="flex flex-col gap-8 w-full">

          <!-- 1. L'ARTICLE À LA UNE (En Haut) 🚀 -->
          <FeaturedPostCard v-if="featuredPost" :post="featuredPost" />

          <!-- 2. LA GRILLE DES AUTRES ARTICLES (2 Colonnes en dessous) 🚀 -->
          <div v-if="posts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <PostCard v-for="post in posts" :key="post.id" :post="post" />
          </div>

          <p v-if="!featuredPost && posts.length === 0" class="text-xs text-slate-500 italic text-center py-8 border border-dashed border-[#c3c4c7] bg-white">
            Aucun article n'a encore été publié.
          </p>

        </div>
      </section>

      <!-- COLONNE DROITE : LE MEUBLE ARCADE (Générateur & Encyclopédie) -->
      <aside class="lobby-control-sidebar w-full md:w-80 shrink-0">
        <div class="welcome-box">
          <h1 class="brand-title">RANDOMSTACK</h1>
          <p class="brand-description">Votre cabinet d'arcade pour concevoir des piles technologiques de pointe et explorer l'écosystème web.</p>
        </div>

        <div class="shortcuts-grid">
          <button @click="router.push('/mix')" class="arcade-shortcut-btn generator-btn">
            <span class="btn-icon">🕹️</span>
            <div class="btn-content">
              <span class="main-label">Lancer le Générateur</span>
              <span class="sub-label">Tirages, Cadenas & Blacklist</span>
            </div>
          </button>

          <button @click="router.push('/encyclopedia')" class="arcade-shortcut-btn encyclopedia-btn">
            <span class="btn-icon">📖</span>
            <div class="btn-content">
              <span class="main-label">L'Encyclopédie</span>
              <span class="sub-label">Découvrez les outils</span>
            </div>
          </button>
        </div>
      </aside>

    </div>
  </div>
</template>