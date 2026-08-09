<script setup lang="ts">
import type { Technology } from '@randomstack/commons'

defineProps<{
  tech: Technology
}>()
</script>

<template>
  <div class="tech-detail-card">
    <div class="tech-header">
      <div class="logo-wrap shrink-0">
        <img v-if="tech.logo" :src="`http://localhost:4000${tech.logo}`" />
        <span v-else class="text-[10px] font-black uppercase">{{ tech.name.substring(0, 2) }}</span>
      </div>
      <div class="text-wrap">
        <h3 class="name">{{ tech.name }}</h3>
        <span class="lang-badge">{{ tech.language }}</span>
      </div>
    </div>
    <p class="desc">{{ tech.description }}</p>
    <div class="meta-footer">
      <!-- Boucle pour afficher les badges multiples de l'encyclopédie claire 🚀 -->
      <div class="flex flex-wrap gap-1">
        <span v-for="cat in tech.categories" :key="cat" class="meta-badge bg-blue-50 border border-slate-200 text-slate-600">
          {{ cat }}
        </span>
      </div>
      <span class="meta-usage text-slate-400 font-bold truncate max-w-[140px]">
        {{ tech.usage }}
      </span>
    </div>
  </div>
</template>