<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {
  fetchPostBySlug,
  fetchSimilarPosts,
  fetchPostsByAuthor,
  toggleFavorite,
  getMe,
  fileUrl
} from '#services'
import {Breadcrumbs, AdSlot} from '#components'
import type {AuthorListed, PublicPostDetail, PublicPostListed} from '@randomstack/commons'

import BlockRenderer from './components/BlockRenderer.vue'
import AuthorCard from './components/AuthorCard.vue'
import AuthorArticlesSection from './components/AuthorArticlesSection.vue'
import RelatedArticlesSection from './components/RelatedArticlesSection.vue'
import CommentsSection from './components/CommentsSection.vue'
import PostShareModal from './components/PostShareModal.vue'

const route = useRoute()
const router = useRouter()
const post = ref<PublicPostDetail | null>(null)
const relatedPosts = ref<PublicPostListed[]>([])
const authorPosts = ref<PublicPostListed[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const liveCommentsCount = ref<number | null>(null)
const favoriteBusy = ref(false)
const shareModalOpen = ref(false)

const commentsCountLabel = computed(() => {
  const n = liveCommentsCount.value ?? post.value?.commentsCount ?? 0
  return `${n} commentaire${n > 1 ? 's' : ''}`
})

const shareUrl = computed(() => {
  if (!post.value?.shareCode || typeof window === 'undefined') return ''
  return `${window.location.origin}/post/${post.value.shareCode}`
})

const onCommentsCountChange = (n: number) => {
  liveCommentsCount.value = n
}

const primaryAuthor = computed<AuthorListed | null>(() => post.value?.author ?? null)

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const handleToggleFavorite = async () => {
  if (!post.value || favoriteBusy.value) return

  const me = await getMe()
  if (!me) {
    await router.push({path: '/login', query: {redirect: route.fullPath}})
    return
  }

  favoriteBusy.value = true
  try {
    const result = await toggleFavorite(post.value.id)
    post.value = {...post.value, isFavorite: result.isFavorite}
  } catch {
    // silencieux — l'UI reste cohérente
  } finally {
    favoriteBusy.value = false
  }
}

const loadArticle = async (slug: string) => {
  loading.value = true
  error.value = null
  relatedPosts.value = []
  authorPosts.value = []
  liveCommentsCount.value = null
  shareModalOpen.value = false

  try {
    post.value = await fetchPostBySlug(slug)
    liveCommentsCount.value = post.value.commentsCount
    try {
      relatedPosts.value = await fetchSimilarPosts(slug)
    } catch {
      relatedPosts.value = []
    }

    const authorId = post.value.author?.id
    if (authorId) {
      try {
        authorPosts.value = await fetchPostsByAuthor(authorId, post.value.id)
      } catch {
        authorPosts.value = []
      }
    }
  } catch {
    post.value = null
    error.value = "Impossible de charger cet article. Il a peut-être été supprimé ou n'est pas encore publié."
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticle(route.params['slug'] as string)
})

watch(() => route.params['slug'], (slug) => {
  if (slug) loadArticle(slug as string)
})
</script>

<template>
  <main class="container-catalog py-8">

    <div v-if="loading" class="loading-state">
      Chargement de l'article...
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <div v-else-if="post" class="article-page-shell">

      <aside class="article-rail article-rail--left" aria-label="Publicité">
        <AdSlot placement="article-rail-left" variant="rail"/>
      </aside>

      <article class="article-column">

        <Breadcrumbs :items="[
          { label: 'Blog', to: '/' },
          ...(post.tags?.[0] ? [{ label: post.tags[0], to: `/${post.tags[0]}`, uppercase: true }] : []),
          { label: post.title }
        ]"/>

        <header class="page-header page-header--flush mt-4">
          <div class="page-header__row">
            <h1 class="page-title">{{ post.title }}</h1>
            <div class="page-header__actions">
              <button
                  type="button"
                  class="article-icon-btn"
                  title="Partager"
                  aria-label="Partager l’article"
                  @click="shareModalOpen = true"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <path d="M8.6 13.5l6.8 3.9M15.4 6.6l-6.8 3.9"/>
                </svg>
              </button>
              <button
                  type="button"
                  class="article-icon-btn"
                  :class="{ 'is-active': post.isFavorite }"
                  :disabled="favoriteBusy"
                  :title="post.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  :aria-label="post.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  @click="handleToggleFavorite"
              >
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    :fill="post.isFavorite ? 'currentColor' : 'none'"
                    stroke="currentColor"
                    stroke-width="2"
                >
                  <path d="M12 17.3l-6.18 3.25 1.18-6.88L2 8.97l6.91-1L12 1.5l3.09 6.47 6.91 1-5 4.7 1.18 6.88z"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="page-meta">
            <span v-if="post.publishAt">Publié le {{ formatDate(post.publishAt) }}</span>
            <span>{{ commentsCountLabel }}</span>
            <span v-if="route.query['preview'] === 'true'" class="badge badge--primary">
              Mode Prévisualisation
            </span>
          </div>
        </header>

        <AdSlot placement="article-header" variant="banner" class="article-header-ad"/>

        <p v-if="post.summary" class="article-summary">
          {{ post.summary }}
        </p>

        <figure v-if="post.imageId" class="w-full bg-[#f6f8fa] border border-[#c3c4c7] overflow-hidden mb-8">
          <img
              :src="fileUrl(post.imageId)"
              :alt="post.title"
              class="w-full h-auto max-h-[480px] object-cover"
          />
        </figure>

        <div class="post-content-body flex flex-col gap-6 w-full text-left">
          <BlockRenderer v-for="(block, index) in post.content" :key="index" :block="block"/>
        </div>

        <AdSlot placement="article-footer" variant="banner" class="my-8"/>

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

        <AuthorCard v-if="primaryAuthor" :author="primaryAuthor"/>

        <CommentsSection
            :post-id="post.id"
            @count-change="onCommentsCountChange"
        />

        <AuthorArticlesSection
            v-if="authorPosts.length > 0"
            :posts="authorPosts"
            :author-name="primaryAuthor?.displayName"
        />

        <RelatedArticlesSection :posts="relatedPosts"/>

      </article>

      <aside class="article-rail article-rail--right" aria-label="Publicité">
        <AdSlot placement="article-rail-right" variant="rail"/>
      </aside>

      <PostShareModal
          :is-open="shareModalOpen"
          :share-url="shareUrl"
          :title="post.title"
          @close="shareModalOpen = false"
      />

    </div>

  </main>
</template>
