<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Technology } from '@randomstack/commons'

defineProps<{
  tech: Technology
}>()

const router = useRouter()
</script>

<template>
  <div @click="router.push(`/technology/${tech.slug}`)" class="tech-detail-card">

    <!-- 1. IMAGE OU INITIALES DE FOND GÉANTE (4/3) 🚀 -->
    <div class="card-bg-image">
      <img v-if="tech.logo" :src="`http://localhost:4000${tech.logo}`" class="w-full h-full object-cover" />
      <div v-else class="initials-bg">{{ tech.name.substring(0, 2) }}</div>
    </div>

    <!-- 2. MASQUE DE TEXTE SUPERPOSÉ (FONDU DE VISIBILITÉ AU SURVOL) 🚀 -->
    <div class="card-overlay">

      <!-- État Normal (Visible par défaut en bas) -->
      <div class="overlay-default-content">
        <!-- Affiche les badges multiples sur la carte sémantique 🚀 -->
        <div class="flex flex-wrap gap-1.5 mb-1.5">
          <span v-for="cat in tech.categories" :key="cat" class="meta-badge">
            {{ cat }}
          </span>
        </div>
        <h3 class="name">{{ tech.name }}</h3>
        <span class="lang-badge">{{ tech.language }}</span>
      </div>

      <!-- État Survolé (Apparaît au survol avec fondu) -->
      <div class="overlay-hover-content">
        <p class="desc">{{ tech.description }}</p>
        <span class="view-more-btn">Découvrir l'outil →</span>
      </div>

    </div>

  </div>
</template>