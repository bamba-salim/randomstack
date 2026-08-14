<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { StackService } from '#services'
import type { Technology } from '@randomstack/commons'

const route = useRoute()
const router = useRouter()

const tech = ref<Technology | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  const slug = route.params['slug'] as string
  try {
    tech.value = await StackService.fetchTechnologyBySlug(slug)
  } catch {
    error.value = "Impossible de charger les détails de cette technologie."
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="technology-detail-page-container">
    <div v-if="loading" class="loading-state">
      Chargement de la fiche technique...
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <div v-else class="detail-layout-card">

      <!-- FIL D'ARIANE -->
      <nav class="breadcrumb-nav">
        <router-link to="/">Lobby</router-link>
        <span class="separator">/</span>
        <router-link to="/encyclopedia">Encyclopédie</router-link>
        <span class="separator">/</span>
        <span class="current">{{ tech?.name }}</span>
      </nav>

      <!-- NIVEAU 1 : IMAGE (GAUCHE) & TABLEAU (DROITE) -->
      <div class="detail-top-section">

        <div class="detail-image-box shrink-0">
          <img v-if="tech?.logo" :src="`http://localhost:4000${tech.logo}`" />
          <span class="text-3xl font-black text-slate-600 uppercase" v-else>{{ tech?.name.substring(0, 2) }}</span>
        </div>

        <div class="detail-meta-table">
          <h1 class="tech-title">{{ tech?.name }}</h1>

          <div class="meta-grid">
            <div class="meta-row">
              <span class="meta-label">Catégorie(s)</span>
              <!-- Affiche le tableau de catégories sur la page de détails 🚀 -->
              <div class="flex flex-wrap gap-1">
                <span v-for="cat in tech?.categories" :key="cat" class="meta-badge-tag">
                  {{ cat }}
                </span>
              </div>
            </div>

            <div class="meta-row">
              <span class="meta-label">Langage</span>
              <span class="meta-value font-mono">{{ tech?.language }}</span>
            </div>

            <div class="meta-row">
              <span class="meta-label">Utilisation</span>
              <span class="meta-value">{{ tech?.usage }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- NIVEAU 2 : DESCRIPTION -->
      <div class="detail-bottom-section">
        <h2 class="section-heading">Description & Caractéristiques</h2>
        <p class="tech-long-description">
          {{ tech?.detail?.description || 'Aucune description disponible.' }}
        </p>
      </div>

    </div>
  </div>
</template>