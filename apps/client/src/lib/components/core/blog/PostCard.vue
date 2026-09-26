<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ListedPost } from '@randomstack/commons'

defineProps<{ post: ListedPost }>()
const router = useRouter()
</script>

<template>
  <article @click="router.push(`/${post.mainTag}/${post.slug}`)" class="standard-post-card cursor-pointer">
    <div class="post-cover">
      <img v-if="post.image" :src="`http://localhost:4000/api/files/${post.image}`" :alt="post.title" />
      <div v-else class="empty-cover">NEWS</div>
    </div>

    <div class="post-content">
      <span v-if="post.tags && post.tags.length > 0" class="primary-tag">#{{ post.mainTag    }}</span>
      <h3 class="title">{{ post.title }}</h3>
    </div>
  </article>
</template>