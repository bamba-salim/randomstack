<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PostService } from '#services'
import FeaturedPostCard from '../blog/components/FeaturedPostCard.vue'
import PostCard from '../blog/components/PostCard.vue'
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
  <main class="container-catalog py-8">
    <div class="lobby-layout-grid">

      <!-- COLONNE GAUCHE : FLUX D'ACTUALITÉS ÉDITORIAL -->
      <section class="news-main-section">
        <h2 class="section-title">📰 Dernières Actualités</h2>

        <!-- États d'interface universels -->
        <div v-if="loading" class="loading-state">
          Chargement des actualités...
        </div>

        <div v-else-if="error" class="error-state">
          {{ error }}
        </div>

        <div v-else class="flex flex-col gap-8 w-full">
          <!-- 1. L'Article à la une -->
          <FeaturedPostCard v-if="featuredPost" :post="featuredPost" />

          <!-- 2. La grille universelle à 2 colonnes -->
          <div v-if="posts.length > 0" class="grid-cards grid-cards--2">
            <PostCard v-for="post in posts" :key="post.id" :post="post" />
          </div>

          <p v-if="!featuredPost && posts.length === 0" class="empty-state">
            Aucun article n'a encore été publié.
          </p>
        </div>
      </section>

      <!-- COLONNE DROITE : MEUBLE D'ACCÈS ARCADE -->
      <aside class="lobby-control-sidebar">
        <div class="welcome-box">
          <h1 class="brand-title">RANDOMSTACK</h1>
          <p class="brand-description">
            Votre cabinet d'arcade pour concevoir des piles technologiques de pointe et explorer l'écosystème web.
          </p>
        </div>

        <div class="shortcuts-grid">
          <button @click="router.push('/draft')" class="arcade-shortcut-btn">
            <span class="btn-icon">🕹️</span>
            <div class="btn-content">
              <span class="main-label">Lancer le Générateur</span>
              <span class="sub-label">Tirages, Cadenas & Blacklist</span>
            </div>
          </button>

          <button @click="router.push('/encyclopedia')" class="arcade-shortcut-btn">
            <span class="btn-icon">📖</span>
            <div class="btn-content">
              <span class="main-label">L'Encyclopédie</span>
              <span class="sub-label">Découvrez les outils</span>
            </div>
          </button>
        </div>
      </aside>

    </div>
  </main>
</template>