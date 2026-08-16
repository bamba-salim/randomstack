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

    <!-- LE LAYOUT ÉDITORIAL UNIFIÉ ET CENTRÉ (MÊME LARGEUR QUE LA HOME) -->
    <div v-else-if="tech" class="detail-layout-card">

      <!-- FIL D'ARIANE -->
      <nav class="breadcrumb-nav">
        <router-link to="/">Lobby</router-link>
        <span class="separator">/</span>
        <router-link to="/encyclopedia">Encyclopédie</router-link>
        <span class="separator">/</span>
        <span class="current">{{ tech.name }}</span>
      </nav>

      <!-- NIVEAU 1 : IMAGE (GAUCHE) & TABLEAU (DROITE) -->
      <div class="detail-top-section">

        <!-- Boîte d'image à gauche -->
        <div class="detail-image-box shrink-0">
          <img v-if="tech.logo" :src="`http://localhost:4000${tech.logo}`" />
          <span class="text-3xl font-black text-slate-600 uppercase" v-else>{{ tech.name.substring(0, 2) }}</span>
        </div>

        <!-- Tableau de métadonnées sémantiques à droite -->
        <div class="detail-meta-table">
          <h1 class="tech-title">{{ tech.name }}</h1>

          <div class="meta-grid">
            <div class="meta-row">
              <span class="meta-label">Catégorie(s)</span>
              <div class="flex flex-wrap gap-1">
                <span v-for="cat in tech.categories" :key="cat" class="meta-badge-tag">
                  {{ cat }}
                </span>
              </div>
            </div>

            <div class="meta-row">
              <span class="meta-label">Langage principal</span>
              <span class="meta-value font-mono">{{ tech.language }}</span>
            </div>

            <div class="meta-row">
              <span class="meta-label">Utilisation globale</span>
              <span class="meta-value">{{ tech.usage }}</span>
            </div>

            <!-- Créateur (Optionnel) 🚀 -->
            <div v-if="tech.detail?.creator" class="meta-row">
              <span class="meta-label">Créateur / Auteur</span>
              <span class="meta-value">{{ tech.detail.creator }}</span>
            </div>

            <!-- Année de création (Optionnel) 🚀 -->
            <div v-if="tech.detail?.foundedAt" class="meta-row">
              <span class="meta-label">Année de création</span>
              <span class="meta-value font-mono">{{ tech.detail.foundedAt }}</span>
            </div>

            <!-- Statistiques de popularité (Optionnel) 🚀 -->
            <div v-if="tech.detail?.userCount || tech.detail?.projectCount" class="meta-row">
              <span class="meta-label">Statistiques d'usage</span>
              <span class="meta-value">
                <span v-if="tech.detail.userCount" class="mr-3">⭐ {{ tech.detail.userCount.toLocaleString() }}</span>
                <span v-if="tech.detail.projectCount">📦 {{ tech.detail.projectCount.toLocaleString() }}</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- TABLEAU DES VERSIONS (OPTIONNEL) 🚀 -->
      <div v-if="tech.detail?.versions" class="detail-versions-section">
        <h2 class="section-heading">Versions de l'écosystème</h2>
        <div class="versions-table-wrap">
          <table class="versions-table">
            <thead>
            <tr>
              <th>Type de Branche</th>
              <th>Numéro de Version</th>
              <th>Date de Sortie</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="tech.detail.versions.stable?.num">
              <td class="font-bold">Stable (Production)</td>
              <td class="font-mono text-cyan-600">{{ tech.detail.versions.stable.num }}</td>
              <td class="text-slate-500">{{ tech.detail.versions.stable.date || 'Inconnue' }}</td>
            </tr>
            <tr v-if="tech.detail.versions.latest?.num">
              <td class="font-bold">Latest (Développement)</td>
              <td class="font-mono text-pink-600">{{ tech.detail.versions.latest.num }}</td>
              <td class="text-slate-500">{{ tech.detail.versions.latest.date || 'Inconnue' }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- NIVEAU 2 : DESCRIPTION ET HISTOIRE (AVEC PARAGRAPHES UNIQUES) 🚀 -->
      <div class="detail-bottom-section">
        <h2 class="section-heading">Description</h2>
        <p class="tech-long-description">
          {{ tech.detail?.description || 'Aucune description disponible.' }}
        </p>

        <!-- Histoire sérialisée sous forme de paragraphe par le seeder ou l'admin 🚀 -->
        <div v-if="tech.detail?.history && tech.detail.history.length > 0" class="tech-history-section">
          <h2 class="section-heading mt-6">Histoire & Évolution</h2>
          <div class="history-paragraphs mt-3">
            <p v-for="(para, idx) in tech.detail.history" :key="idx" class="history-paragraph">
              {{ para }}
            </p>
          </div>
        </div>
      </div>

      <!-- BOUTONS DE LIENS EXTERNES UTILES (S'affichent uniquement si renseignés) 🚀 -->
      <div v-if="tech.detail?.websiteUrl || tech.detail?.docsUrl" class="detail-links-section">
        <h2 class="section-heading">Ressources utiles</h2>
        <div class="links-grid">
          <a v-if="tech.detail.websiteUrl" :href="tech.detail.websiteUrl" target="_blank" class="resource-link-btn">
            🌐 Visiter le Site Officiel
          </a>
          <a v-if="tech.detail.docsUrl" :href="tech.detail.docsUrl" target="_blank" class="resource-link-btn doc-btn">
            📚 Consulter la Documentation
          </a>
        </div>
      </div>

    </div>
  </div>
</template>