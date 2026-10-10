<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { FeaturedPostListed } from '@randomstack/commons'
import { fileUrl } from '#services'

defineProps<{ post: FeaturedPostListed }>()
const router = useRouter()

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}
</script>

<template>
  <article @click="router.push(`/${post.mainTag}/${post.slug}`)" class="card card--interactive card--horizontal">

    <!-- Couverture universelle avec fallback -->
    <div class="card-cover">
      <img v-if="post.image" :src="fileUrl(post.image)" :alt="post.title" />
      <div v-else class="card-cover-empty">À LA UNE</div>
    </div>

    <!-- Corps universel -->
    <div class="card-body">
      <div class="card-header-meta">
        <span class="badge badge--primary">#{{ post.mainTag }}</span>
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {{ formatDate(post.publishAt) }}
        </span>
      </div>

      <h2 class="card-title">{{ post.title }}</h2>
      <p class="card-text">{{ post.summary }}</p>

      <div class="card-footer">
        <span class="text-[11px] font-black uppercase tracking-widest text-[#2271b1]">
          Lire l'article →
        </span>
      </div>
    </div>

  </article>
</template>