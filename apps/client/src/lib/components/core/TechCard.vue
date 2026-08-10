<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Technology } from '@randomstack/commons'

defineProps<{
  tech: Technology
}>()

const router = useRouter()
</script>

<template>
  <!-- Le clic sur la carte redirige vers sa page de détails sémantique 🚀 -->
  <div @click="router.push(`/technology/${tech.id}`)" class="tech-detail-card cursor-pointer">

    <!-- 1. IMAGE OU INITIALES DE FOND GÉANTE 🚀 -->
    <div class="card-bg-image">
      <img v-if="tech.logo" :src="`http://localhost:4000${tech.logo}`" class="w-full h-full object-cover" />
      <div v-else class="initials-bg">{{ tech.name.substring(0, 2) }}</div>
    </div>

    <!-- 2. MASQUE DE TEXTE ET DE SURVOL (FONDU DE VISIBILITÉ) 🚀 -->
    <div class="card-overlay">

      <!-- État Normal (Visible par défaut en bas) -->
      <div class="overlay-default-content">
        <span class="meta-badge">{{ tech.categories[0] }}</span>
        <h3 class="name">{{ tech.name }}</h3>
        <span class="lang-badge">{{ tech.language }}</span>
      </div>

      <!-- État Survolé (Apparaît en fondu au survol) -->
      <div class="overlay-hover-content">
        <p class="desc">{{ tech.description }}</p>
        <span class="view-more-btn">Découvrir l'outil →</span>
      </div>

    </div>

  </div>
</template>