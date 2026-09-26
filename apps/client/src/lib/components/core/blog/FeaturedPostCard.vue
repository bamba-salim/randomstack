<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Post } from '@randomstack/commons'

defineProps<{ post: Post }>()
const router = useRouter()

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <article @click="router.push(`/${post.mainTag}/${post.slug}`)" class="featured-post-card cursor-pointer">
    <div class="featured-cover">
      <img v-if="post.image" :src="`http://localhost:4000/api/files/${post.image}`" :alt="post.title" />
      <div v-else class="empty-cover">À LA UNE</div>
    </div>

    <div class="featured-content">
      <div class="meta-row">
        <span class="primary-tag">#{{ post.mainTag }}</span>
        <span class="date">{{ formatDate(post.publishAt) }}</span>
      </div>

      <h2 class="title">{{ post.title }}</h2>
      <p class="summary">{{ post.summary }}</p>

      <span class="read-more">Lire l'article →</span>
    </div>
  </article>
</template>