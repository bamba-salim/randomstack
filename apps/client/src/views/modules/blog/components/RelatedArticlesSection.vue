<script setup lang="ts">
import type {PublicPostListed} from '@randomstack/commons'
import PostCard from './PostCard.vue'

defineProps<{
  posts: PublicPostListed[]
}>()
</script>

<template>
  <section v-if="posts.length > 0" class="article-posts-section">
    <h2 class="section-title">À lire aussi</h2>
    <div class="grid-cards related-articles-grid">
      <PostCard v-for="item in posts" :key="item.id" :post="item"/>
    </div>
  </section>
</template>
