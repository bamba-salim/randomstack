<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ListedPost } from '@randomstack/commons'

defineProps<{ post: ListedPost }>()
const router = useRouter()
</script>

<template>
  <article @click="router.push(`/${post.mainTag}/${post.slug}`)" class="card card--interactive">

    <!-- Couverture universelle -->
    <div class="card-cover">
      <img v-if="post.image" :src="`http://localhost:4000/files/${post.image}`" :alt="post.title" />
      <div v-else class="card-cover-empty">NEWS</div>
    </div>

    <!-- Corps universel -->
    <div class="card-body">
      <div class="card-header-meta">
        <span v-if="post.mainTag" class="badge badge--primary">#{{ post.mainTag }}</span>
      </div>
      <h3 class="card-title">{{ post.title }}</h3>
    </div>

  </article>
</template>