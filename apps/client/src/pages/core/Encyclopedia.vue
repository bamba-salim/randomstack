<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {StackService} from '#services'
import {TechCard} from '#components'
import {TechnologyFilter, type Technology} from '@randomstack/commons'

const technologies = ref<Technology[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// --- ÉTATS RÉACTIFS DE LA RECHERCHE ET DE LA PAGINATION (20 ÉLÉMENTS) 🚀 ---
const searchQuery = ref('')
const selectedFilter = ref<string>('ALL')
const currentPage = ref(1)
const itemsPerPage = ref(20) // Configuré à 20 items par page 🚀

// Appel réactif de notre filtre de commons 🚀
const filterResult = computed(() => {
  return TechnologyFilter.run(technologies.value, {
    searchQuery: searchQuery.value,
    selectedLanguage: '',
    selectedCategory: selectedFilter.value,
    currentPage: currentPage.value,
    itemsPerPage: itemsPerPage.value
  })
})

// Déstructuration réactive des calculs du script de filtrage
const paginatedTechnologies = computed(() => filterResult.value.paginatedItems)
const totalPages = computed(() => filterResult.value.totalPages)
const totalCount = computed(() => filterResult.value.totalItemsCount)

// Réinitialise l'index de page lors d'un changement de filtre d'onglet 🚀
const handleFilterChange = (filter: string) => {
  selectedFilter.value = filter
  currentPage.value = 1
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

onMounted(async () => {
  try {
    technologies.value = await StackService.fetchAllTechnologies()

  } catch {
    error.value = "Impossible de récupérer l'encyclopédie."
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="encyclopedia-page-container">

    <!-- EN-TÊTE DE PAGE ÉPURÉ -->
    <header class="encyclopedia-header-top">
      <div>
        <h1 class="title">L'Encyclopédie</h1>
        <p class="description">Découvrez le catalogue de technologies de RANDOMSTACK</p>
      </div>
    </header>

    <!-- ZONE DE FILTRES HORIZONTALE EN HAUT -->
    <div class="filter-row-top">
      <input
          v-model="searchQuery"
          @input="currentPage = 1"
          type="text"
          placeholder="🔍 Rechercher une technologie (ex: React, Django, SQLite, Mobile...)"
          class="search-input"
      />

      <div class="tab-filters">
        <button @click="handleFilterChange('ALL')" :class="['tab-btn', { 'active': selectedFilter === 'ALL' }]">Tout
        </button>
        <button @click="handleFilterChange('FRONTEND')"
                :class="['tab-btn', { 'active': selectedFilter === 'FRONTEND' }]">Web
        </button>
        <button @click="handleFilterChange('BACKEND')" :class="['tab-btn', { 'active': selectedFilter === 'BACKEND' }]">
          Backend
        </button>
        <button @click="handleFilterChange('DATABASE')"
                :class="['tab-btn', { 'active': selectedFilter === 'DATABASE' }]">Base de données
        </button>
        <button @click="handleFilterChange('MOBILE')" :class="['tab-btn', { 'active': selectedFilter === 'MOBILE' }]">
          Mobile
        </button>
      </div>
    </div>

    <!-- GRILLE DE CARTES ENTIÈREMENT OUVERTE SUR TOUTE LA PAGE -->
    <div v-if="loading" class="loading-state">
      Chargement de l'encyclopédie...
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <!-- On boucle uniquement sur les technologies de la page courante (paginatedTechnologies) 🚀 -->
    <div v-else class="encyclopedia-grid-open">
      <TechCard
          v-for="tech in paginatedTechnologies"
          :key="tech.id"
          :tech="tech"
      />
    </div>

    <p v-if="!loading && !error && totalCount === 0" class="empty-state">
      Aucun outil ne correspond à vos critères de recherche.
    </p>

    <!-- SYSTÈME DE PAGINATION CLAIR RETRO-ÉDITORIAL (S'affiche uniquement s'il y a plus d'une page) 🚀 -->
    <div v-if="totalPages > 1" class="pagination-container">
      <span class="pagination-info">
        Page <strong>{{ currentPage }}</strong> sur {{ totalPages }} ({{ totalCount }} éléments)
      </span>
      <div class="pagination-actions">
        <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="page-btn"
        >
          Précédent
        </button>
        <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="page-btn"
        >
          Suivant
        </button>
      </div>
    </div>

  </div>
</template>