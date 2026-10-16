<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {fetchAllTechnologies} from '#services'
import {Pagination, AdSlot} from '#components'
import {
  TechnologyFilter,
  TECHNOLOGY_CATEGORY,
  TECHNOLOGY_CATEGORY_LABELS,
  type PublicTechnologyListed
} from '@randomstack/commons'

import TechCard from './components/TechCard.vue'

const technologies = ref<PublicTechnologyListed[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Recherche et pagination (20 items par page)
const searchQuery = ref('')
const selectedFilter = ref<string>('ALL')
const currentPage = ref(1)
const itemsPerPage = ref(20)

/** Filtres encyclopédie (libellés FR) — Web = FRONTEND */
const categoryFilters = [
  {value: 'ALL', label: 'Tout'},
  {value: TECHNOLOGY_CATEGORY.FRONTEND, label: 'Web'},
  {value: TECHNOLOGY_CATEGORY.BACKEND, label: TECHNOLOGY_CATEGORY_LABELS.BACKEND},
  {value: TECHNOLOGY_CATEGORY.DATABASE, label: TECHNOLOGY_CATEGORY_LABELS.DATABASE},
  {value: TECHNOLOGY_CATEGORY.MOBILE, label: TECHNOLOGY_CATEGORY_LABELS.MOBILE},
  {value: TECHNOLOGY_CATEGORY.DESKTOP, label: TECHNOLOGY_CATEGORY_LABELS.DESKTOP},
  {value: TECHNOLOGY_CATEGORY.API, label: TECHNOLOGY_CATEGORY_LABELS.API},
  {value: TECHNOLOGY_CATEGORY.CMS, label: TECHNOLOGY_CATEGORY_LABELS.CMS},
  {value: TECHNOLOGY_CATEGORY.AI_AGENT, label: TECHNOLOGY_CATEGORY_LABELS.AI_AGENT},
  {value: TECHNOLOGY_CATEGORY.LIBRARY, label: TECHNOLOGY_CATEGORY_LABELS.LIBRARY},
  {value: TECHNOLOGY_CATEGORY.ORM, label: TECHNOLOGY_CATEGORY_LABELS.ORM},
  {value: TECHNOLOGY_CATEGORY.BAAS, label: TECHNOLOGY_CATEGORY_LABELS.BAAS}
]

// Filtre partagé depuis commons
const filterResult = computed(() => {
  return TechnologyFilter.run(technologies.value, {
    searchQuery: searchQuery.value,
    selectedLanguage: '',
    selectedCategory: selectedFilter.value,
    currentPage: currentPage.value,
    itemsPerPage: itemsPerPage.value
  })
})

const paginatedTechnologies = computed(() => filterResult.value.paginatedItems)
const totalPages = computed(() => filterResult.value.totalPages)
const totalCount = computed(() => filterResult.value.totalItemsCount)

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
    technologies.value = await fetchAllTechnologies()
  } catch {
    error.value = "Impossible de récupérer l'encyclopédie."
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="container-catalog py-8 flex flex-col gap-6">

    <!-- En-tête de page universel -->
    <header class="page-header">
      <h1 class="page-title">L'Encyclopédie</h1>
      <p class="page-subtitle">Découvrez le catalogue des technologies de RANDOMSTACK</p>
    </header>

    <AdSlot placement="encyclopedia-banner" variant="banner"/>

    <!-- Barre d'outils universelle : Recherche + Filtres d'onglets -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-2">
      <div class="flex-1">
        <input
            v-model="searchQuery"
            @input="currentPage = 1"
            type="text"
            placeholder="🔍 Rechercher une technologie (ex: React, Django, SQLite, Mobile...)"
            class="input-search"
        />
      </div>

      <div class="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
        <button
            v-for="filter in categoryFilters"
            :key="filter.value"
            type="button"
            @click="handleFilterChange(filter.value)"
            :class="['btn', selectedFilter === filter.value ? 'btn--primary' : 'btn--secondary']"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>
    <!-- Pagination du haut (boutons seuls calés à droite) -->
    <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :hide-info="true"
        variant="top"
        @change-page="changePage"
    />

    <!-- États d'interface universels -->
    <div v-if="loading" class="loading-state">
      Chargement de l'encyclopédie...
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <!-- Grille universelle 4 colonnes -->
    <div v-else class="grid-cards grid-cards--4">
      <TechCard
          v-for="tech in paginatedTechnologies"
          :key="tech.id"
          :tech="tech"
      />
    </div>

    <p v-if="!loading && !error && totalCount === 0" class="empty-state">
      Aucun outil ne correspond à vos critères de recherche.
    </p>

    <!-- Pagination avec boutons universels .btn -->
    <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-count="totalCount"
        @change-page="changePage"
    />
  </main>
</template>