<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {useRoute} from 'vue-router'
import {fetchPublicProfile, fileUrl} from '#services'
import {AdSlot} from '#components'
import type {PublicProfileListed} from '@randomstack/commons'
import PostCard from '../blog/components/PostCard.vue'

const route = useRoute()
const profile = ref<PublicProfileListed | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const initials = computed(() =>
  (profile.value?.displayName || '?').substring(0, 2).toUpperCase()
)

const load = async (id: string) => {
  loading.value = true
  error.value = null
  profile.value = null
  try {
    profile.value = await fetchPublicProfile(id)
  } catch {
    error.value = 'Profil introuvable.'
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params['id'],
  (id) => {
    if (id) load(id as string)
  },
  {immediate: true}
)
</script>

<template>
  <main class="container-catalog py-8">
    <div v-if="loading" class="loading-state">Chargement du profil…</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>

    <div v-else-if="profile" class="article-page-shell">
      <aside class="article-rail article-rail--left" aria-label="Publicité">
        <AdSlot placement="profile-rail-left" variant="rail"/>
      </aside>

      <div class="article-column public-profile">
        <AdSlot placement="profile-header" variant="banner" class="article-header-ad"/>

        <article class="profile-card profile-card--public-page">
          <header class="profile-card__header profile-card__header--public">
            <div class="profile-card__photo profile-card__photo--lg">
              <img
                  v-if="profile.photoId"
                  :src="fileUrl(profile.photoId)"
                  :alt="profile.displayName"
                  fetchpriority="high"
              />
              <span v-else>{{ initials }}</span>
            </div>
            <div>
              <p class="profile-card__eyebrow">Profil public</p>
              <h1 class="profile-card__title">{{ profile.displayName }}</h1>
            </div>
          </header>

          <p v-if="profile.bio" class="profile-card__bio">{{ profile.bio }}</p>
          <p v-else class="profile-card__empty">Aucune bio renseignée.</p>

          <section v-if="profile.links.length" class="profile-card__links">
            <h2 class="profile-card__section-title">Liens</h2>
            <ul class="profile-card__public-links">
              <li v-for="link in profile.links" :key="link.id">
                <a :href="link.url" target="_blank" rel="noopener noreferrer">
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </section>
        </article>

        <section
            v-if="profile.posts.length > 0"
            class="profile-card profile-card--public-page"
        >
          <header class="profile-card__header">
            <h2 class="profile-card__section-title">Articles écrits</h2>
            <p class="profile-card__admin-lead">
              {{ profile.posts.length }} article{{ profile.posts.length > 1 ? 's' : '' }}
            </p>
          </header>
          <div class="public-profile__favorites-grid">
            <PostCard v-for="post in profile.posts" :key="post.id" :post="post"/>
          </div>
        </section>

        <section
            v-if="profile.favoritesPublic"
            class="profile-card profile-card--public-page profile-card--favorites"
        >
          <header class="profile-card__header">
            <h2 class="profile-card__section-title">Articles favoris</h2>
            <p class="profile-card__admin-lead">
              {{ profile.favorites.length }} article{{ profile.favorites.length > 1 ? 's' : '' }}
            </p>
          </header>

          <div v-if="profile.favorites.length === 0" class="profile-card__empty">
            Aucun favori pour le moment.
          </div>
          <div v-else class="public-profile__favorites-grid">
            <PostCard v-for="fav in profile.favorites" :key="fav.id" :post="fav"/>
          </div>
        </section>

        <AdSlot placement="profile-footer" variant="banner" class="my-4"/>
      </div>

      <aside class="article-rail article-rail--right" aria-label="Publicité">
        <AdSlot placement="profile-rail-right" variant="rail"/>
      </aside>
    </div>
  </main>
</template>
