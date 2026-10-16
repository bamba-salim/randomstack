<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {fetchTechnologyBySlug, fileUrl} from '#services'
import {Breadcrumbs, AdSlot} from '#components'
import type {PublicTechnologyDetail} from '@randomstack/commons'

const route = useRoute()
const router = useRouter()

const tech = ref<PublicTechnologyDetail | null>(null)
const loading = ref(true)

const loadTech = async (slug: string) => {
  loading.value = true
  try {
    tech.value = await fetchTechnologyBySlug(slug)
  } catch {
    tech.value = null
    await router.replace({name: 'not-found'})
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTech(route.params['slug'] as string)
})

watch(() => route.params['slug'], (slug) => {
  if (slug) loadTech(slug as string)
})
</script>

<template>
  <main class="container-catalog py-8 flex flex-col gap-6">

    <div v-if="loading" class="loading-state">
      Chargement de la fiche technique...
    </div>

    <div v-else-if="tech" class="tech-detail-page">

      <div class="tech-detail-layout">
        <Breadcrumbs :items="[
          { label: 'Accueil', to: '/' },
          { label: 'Encyclopédie', to: '/encyclopedia' },
          { label: tech.name }
        ]"/>

        <section class="detail-top-section">
          <div class="detail-image-box">
            <img v-if="tech.logo" :src="fileUrl(tech.logo)" :alt="tech.name" fetchpriority="high"/>
            <span v-else class="initials-placeholder">{{ tech.name.substring(0, 2) }}</span>
          </div>

          <div class="detail-meta-table">
            <h1 class="tech-title">{{ tech.name }}</h1>

            <div class="meta-grid">
              <div class="meta-row">
                <span class="meta-label">Catégorie(s)</span>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="cat in tech.categories" :key="cat" class="badge badge--neutral">
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

              <div v-if="tech.creator" class="meta-row">
                <span class="meta-label">Créateur / Auteur</span>
                <span class="meta-value">{{ tech.creator }}</span>
              </div>

              <div v-if="tech.foundedAt" class="meta-row">
                <span class="meta-label">Année de création</span>
                <span class="meta-value font-mono">{{ tech.foundedAt }}</span>
              </div>

              <div v-if="tech.userCount || tech.projectCount" class="meta-row">
                <span class="meta-label">Statistiques d'usage</span>
                <span class="meta-value">
                  <span v-if="tech.userCount" class="mr-3">⭐ {{ tech.userCount.toLocaleString() }}</span>
                  <span v-if="tech.projectCount">📦 {{ tech.projectCount.toLocaleString() }}</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section v-if="tech.versions" class="detail-versions-section">
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
              <tr v-if="tech.versions.stable?.num">
                <td class="font-bold">Stable (Production)</td>
                <td class="font-mono text-cyan-600 font-bold">{{ tech.versions.stable.num }}</td>
                <td class="text-slate-500">{{ tech.versions.stable.date || 'Inconnue' }}</td>
              </tr>
              <tr v-if="tech.versions.latest?.num">
                <td class="font-bold">Latest (Développement)</td>
                <td class="font-mono text-pink-600 font-bold">{{ tech.versions.latest.num }}</td>
                <td class="text-slate-500">{{ tech.versions.latest.date || 'Inconnue' }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="detail-bottom-section">
          <h2 class="section-heading">Description</h2>
          <p class="tech-long-description">
            {{ tech.description || 'Aucune description disponible.' }}
          </p>

          <div v-if="tech.history && tech.history.length > 0" class="tech-history-section">
            <h2 class="section-heading mt-6">Histoire & Évolution</h2>
            <div class="history-paragraphs">
              <p v-for="(para, idx) in tech.history" :key="idx" class="history-paragraph">
                {{ para }}
              </p>
            </div>
          </div>
        </section>

        <section v-if="tech.websiteUrl || tech.docsUrl" class="detail-links-section">
          <h2 class="section-heading">Ressources utiles</h2>
          <div class="flex flex-col sm:flex-row gap-3 mt-2">
            <a
                v-if="tech.websiteUrl"
                :href="tech.websiteUrl"
                target="_blank"
                class="btn btn--secondary"
            >
              🌐 Visiter le Site Officiel
            </a>
            <a
                v-if="tech.docsUrl"
                :href="tech.docsUrl"
                target="_blank"
                class="btn btn--primary"
            >
              📚 Consulter la Documentation
            </a>
          </div>
        </section>
      </div>

      <aside class="tech-detail-ad" aria-label="Publicité">
        <AdSlot placement="technology-sidebar" variant="rail"/>
      </aside>

    </div>
  </main>
</template>
