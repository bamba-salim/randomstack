<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {createInboxMessage, fetchTechnologyBySlug, fileUrl, getMe} from '#services'
import {Breadcrumbs, AdSlot} from '#components'
import TechCompatGraph from './components/TechCompatGraph.vue'
import {
  DRAW_ELIGIBLE_CATEGORIES,
  INBOX_KIND,
  type PublicTechnologyDetail
} from '@randomstack/commons'
import {toast} from '../../../lib/toast'

const route = useRoute()
const router = useRouter()

const tech = ref<PublicTechnologyDetail | null>(null)
const loading = ref(true)

const showReportModal = ref(false)
const reportBody = ref('')
const reportSending = ref(false)

const graphNodes = computed(() =>
  (tech.value?.compatibilities || []).filter(c => c.kind !== 'INCOMPATIBLE')
)

const canDrawWithTech = computed(() =>
  (tech.value?.categories || []).some(cat =>
    (DRAW_ELIGIBLE_CATEGORIES as readonly string[]).includes(cat)
  )
)

const goDrawWithTech = () => {
  if (!tech.value) return
  router.push({path: '/draft', query: {with: tech.value.slug}})
}

const openReportModal = async () => {
  const me = await getMe()
  if (!me) {
    await router.push({path: '/login', query: {redirect: route.fullPath}})
    return
  }
  reportBody.value = ''
  showReportModal.value = true
}

const submitReport = async () => {
  if (!tech.value || reportSending.value) return
  const body = reportBody.value.trim()
  if (body.length < 10) {
    toast.error('Décris le problème (10 caractères min.).')
    return
  }
  reportSending.value = true
  try {
    await createInboxMessage({
      kind: INBOX_KIND.TECH_REPORT,
      body,
      technologyId: tech.value.id,
      subject: `Signalement — ${tech.value.name}`
    })
    toast.success('Merci — ton signalement a été envoyé.')
    showReportModal.value = false
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Envoi impossible.')
  } finally {
    reportSending.value = false
  }
}

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
  <main class="container-catalog py-8">

    <div v-if="loading" class="loading-state">
      Chargement de la fiche technique...
    </div>

    <div v-else-if="tech" class="tech-detail-page">

      <AdSlot
          placement="technology-header"
          variant="banner"
          class="tech-detail-page__banner"
      />

      <div class="lobby-layout-grid">
        <!-- Même DA / proportions que la home -->
        <aside class="lobby-control-sidebar">
          <div class="sidebar-promo-grid">
            <button
                v-if="canDrawWithTech"
                type="button"
                class="arcade-shortcut-btn"
                @click="goDrawWithTech"
            >
              <span class="btn-icon">🕹️</span>
              <div class="btn-content">
                <span class="main-label">Tirage</span>
                <span class="sub-label">Avec cette techno</span>
              </div>
            </button>
            <button
                type="button"
                class="arcade-shortcut-btn"
                @click="openReportModal"
            >
              <span class="btn-icon">⚑</span>
              <div class="btn-content">
                <span class="main-label">Signaler</span>
                <span class="sub-label">Info incorrecte</span>
              </div>
            </button>
          </div>

          <AdSlot
              placement="technology-sidebar"
              class="mt-4 md:mt-6"
          />
        </aside>

        <div class="tech-detail-layout news-main-section">
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

          <AdSlot
              placement="technology-mid"
              variant="banner"
              class="tech-detail-page__banner"
          />

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

          <section
              v-if="graphNodes.length || tech.incompatibilities?.length"
              class="tech-compat-section"
          >
            <h2 class="section-heading">Compatibilités</h2>

            <TechCompatGraph
                v-if="graphNodes.length"
                :center="{id: tech.id, name: tech.name, slug: tech.slug, logo: tech.logo}"
                :nodes="graphNodes"
            />

            <div v-if="tech.incompatibilities?.length">
              <h3 class="section-heading mt-4">Non recommandé</h3>
              <ul class="tech-compat-section__list">
                <li v-for="c in tech.incompatibilities" :key="`inc-${c.id}`">
                  <router-link
                      :to="`/technology/${c.slug}`"
                      class="tech-compat-section__chip tech-compat-section__chip--incompatible"
                  >
                    {{ c.name }}
                  </router-link>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <AdSlot
          placement="technology-footer"
          variant="banner"
          class="tech-detail-page__banner tech-detail-page__banner--footer"
      />

    </div>

    <Teleport to="body">
      <div
          v-if="showReportModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          @click.self="showReportModal = false"
      >
        <div
            class="w-full max-w-md bg-white border border-[#c3c4c7] shadow-lg p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tech-report-title"
        >
          <h2 id="tech-report-title" class="text-sm font-black uppercase tracking-wider text-[#1d2327] mb-2">
            Signaler une erreur
          </h2>
          <p class="text-xs text-slate-500 mb-3">
            Une info incorrecte sur <strong>{{ tech?.name }}</strong> ? Décris le problème — l’équipe le traitera.
          </p>
          <textarea
              v-model="reportBody"
              rows="5"
              class="w-full border border-[#c3c4c7] p-2.5 text-sm"
              placeholder="Ex. : la date de création est fausse, le site officiel a changé…"
              maxlength="4000"
          />
          <div class="flex justify-end gap-2 mt-4">
            <button type="button" class="btn btn--secondary" :disabled="reportSending" @click="showReportModal = false">
              Annuler
            </button>
            <button type="button" class="btn btn--primary" :disabled="reportSending" @click="submitReport">
              {{ reportSending ? 'Envoi…' : 'Envoyer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>
