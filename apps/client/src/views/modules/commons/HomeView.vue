<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {fetchPublishedPosts} from '#services'
import FeaturedPostCard from '../blog/components/FeaturedPostCard.vue'
import PostCard from '../blog/components/PostCard.vue'
import {AdSlot} from '#components'
import type {FeaturedPostListed, PublicPostListed} from '@randomstack/commons'

const FEED_AD_EVERY = 12

const router = useRouter()

const featuredPost = ref<FeaturedPostListed | null>(null)
const posts = ref<PublicPostListed[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

/** Au moins un article (à la une ou grille) → pubs home autorisées */
const hasArticles = computed(() => Boolean(featuredPost.value) || posts.value.length > 0)

/** Grille découpée par paquets de 12 — pub après chaque paquet complet */
const postChunks = computed(() => {
  const chunks: PublicPostListed[][] = []
  for (let i = 0; i < posts.value.length; i += FEED_AD_EVERY) {
    chunks.push(posts.value.slice(i, i + FEED_AD_EVERY))
  }
  return chunks
})

onMounted(async () => {
  try {
    const response = await fetchPublishedPosts()
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
  <main class="home-page container-catalog py-8">
    <AdSlot
        v-if="hasArticles"
        placement="home-header"
        variant="banner"
        class="home-page__banner"
    />

    <div class="lobby-layout-grid">

      <!-- Meuble RandomStack : en haut sur mobile, à droite sur desktop -->
      <aside class="lobby-control-sidebar">
        <div class="sidebar-promo-grid">
          <div class="welcome-box">
            <h1 class="brand-title">RANDOMSTACK</h1>
            <p class="brand-description">
              Votre cabinet d'arcade pour concevoir des piles technologiques de pointe et explorer l'écosystème web.
            </p>
          </div>

          <button @click="router.push('/draft')" class="arcade-shortcut-btn">
            <span class="btn-icon">🕹️</span>
            <div class="btn-content">
              <span class="main-label">Générateur</span>
              <span class="sub-label">Tirages & Blacklist</span>
            </div>
          </button>

          <button @click="router.push('/encyclopedia')" class="arcade-shortcut-btn">
            <span class="btn-icon">📖</span>
            <div class="btn-content">
              <span class="main-label">Encyclopédie</span>
              <span class="sub-label">Les outils</span>
            </div>
          </button>
        </div>

        <AdSlot
            v-if="hasArticles"
            placement="home-sidebar"
            class="mt-4 md:mt-6"
        />
      </aside>

      <!-- Flux d'actualités -->
      <section class="news-main-section">
        <h2 class="section-title">📰 Dernières Actualités</h2>

        <div v-if="loading" class="loading-state">
          Chargement des actualités...
        </div>

        <div v-else-if="error" class="error-state">
          {{ error }}
        </div>

        <div v-else class="flex flex-col gap-8 w-full">
          <FeaturedPostCard v-if="featuredPost" :post="featuredPost"/>

          <AdSlot
              v-if="featuredPost && posts.length > 0"
              placement="home-after-featured"
              variant="banner"
              class="home-page__banner"
          />

          <template v-for="(chunk, chunkIndex) in postChunks" :key="chunkIndex">
            <div class="grid-cards grid-cards--2">
              <PostCard v-for="post in chunk" :key="post.id" :post="post"/>
            </div>
            <AdSlot
                v-if="chunk.length === FEED_AD_EVERY"
                placement="home-feed"
                variant="banner"
                class="home-page__banner"
            />
          </template>

          <p v-if="!featuredPost && posts.length === 0" class="empty-state">
            Aucun article n'a encore été publié.
          </p>
        </div>
      </section>

    </div>

    <AdSlot
        v-if="hasArticles"
        placement="home-footer"
        variant="banner"
        class="home-page__banner home-page__banner--footer"
    />
  </main>
</template>
