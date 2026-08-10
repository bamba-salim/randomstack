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
  const id = route.params['id'] as string
  try {
    tech.value = await StackService.get<Technology>(`/api/fetch-technology/${id}`)
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

    <!-- LE LAYOUT ÉDITORIAL UNIFIÉ INSPIRÉ DE LA MAQUETTE 🚀 -->
    <div v-else class="detail-layout-card max-w-4xl w-full">

      <!-- NIVEAU 1 : IMAGE (À GAUCHE) ET TABLEAU DE DONNÉES (À DROITE) CÔTE-À-CÔTE 🚀 -->
      <div class="detail-top-section">

        <!-- Boîte d'image à gauche -->
        <div class="detail-image-box shrink-0">
          <img v-if="tech?.logo" :src="`http://localhost:4000${tech.logo}`" />
          <span v-else class="text-3xl font-black text-slate-600 uppercase">{{ tech?.name.substring(0, 2) }}</span>
        </div>

        <!-- Tableau de métadonnées sémantiques à droite -->
        <div class="detail-meta-table">
          <h1 class="tech-title">{{ tech?.name }}</h1>

          <div class="meta-grid">
            <div class="meta-row">
              <span class="meta-label">Catégorie(s)</span>
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

      <!-- NIVEAU 2 : DESCRIPTION GLOBALE EN DESSOUS 🚀 -->
      <div class="detail-bottom-section">
        <h2 class="section-heading">Description & Caractéristiques</h2>
        <p class="tech-long-description">
          {{ tech?.description }}
        </p>
      </div>

      <!-- Actions de pied de page -->
      <footer class="detail-footer">
        <button @click="router.back()" class="back-btn">
          ← Retourner à l'Encyclopédie
        </button>
      </footer>

    </div>
  </div>
</template>