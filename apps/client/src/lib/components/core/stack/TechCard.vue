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

    <!-- 1. IMAGE OU INITIALES DE FOND (4/3) -->
    <div class="card-bg-image">
      <img v-if="tech.logo" :src="`http://localhost:4000${tech.logo}`" :alt="tech.name" />
      <div v-else class="initials-bg">{{ tech.name.substring(0, 2) }}</div>
    </div>

    <!-- 2. MASQUE DE TEXTE SUPERPOSÉ (FONDU AU SURVOL) -->
    <div class="card-overlay">

      <!-- État normal -->
      <div class="overlay-default-content">
        <!-- Badges universels sombres -->
        <div class="card-categories">
          <span v-for="cat in tech.categories" :key="cat" class="badge badge--dark">
            {{ cat }}
          </span>
        </div>

        <h3 class="name">{{ tech.name }}</h3>
        <span class="badge badge--dark font-mono mt-1">{{ tech.language }}</span>
      </div>

      <!-- État survolé -->
      <div class="overlay-hover-content">
        <p class="desc">{{ tech.description }}</p>
        <span class="view-more-btn">Découvrir l'outil →</span>
      </div>

    </div>

  </div>
</template>