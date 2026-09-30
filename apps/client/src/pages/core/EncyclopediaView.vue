<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { StackService } from '#services'
import { TechCard } from '#components'
import { TechnologyFilter, type Technology } from '@randomstack/commons'

const technologies = ref<Technology[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Recherche et pagination (20 items par page)
const searchQuery = ref('')
const selectedFilter = ref<string>('ALL')
const currentPage = ref(1)
const itemsPerPage = ref(20)

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
    technologies.value = await StackService.fetchAllTechnologies()
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
            @click="handleFilterChange('ALL')"
            :class="['btn', selectedFilter === 'ALL' ? 'btn--primary' : 'btn--secondary']"
        >
          Tout
        </button>
        <button
            @click="handleFilterChange('FRONTEND')"
            :class="['btn', selectedFilter === 'FRONTEND' ? 'btn--primary' : 'btn--secondary']"
        >
          Web
        </button>
        <button
            @click="handleFilterChange('BACKEND')"
            :class="['btn', selectedFilter === 'BACKEND' ? 'btn--primary' : 'btn--secondary']"
        >
          Backend
        </button>
        <button
            @click="handleFilterChange('DATABASE')"
            :class="['btn', selectedFilter === 'DATABASE' ? 'btn--primary' : 'btn--secondary']"
        >
          Base de données
        </button>
        <button
            @click="handleFilterChange('MOBILE')"
            :class="['btn', selectedFilter === 'MOBILE' ? 'btn--primary' : 'btn--secondary']"
        >
          Mobile
        </button>
      </div>
    </div>

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
    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#c3c4c7] pt-4 mt-4 text-xs select-none">
      <span class="text-slate-500 font-bold">
        Page <strong>{{ currentPage }}</strong> sur {{ totalPages }} ({{ totalCount }} éléments)
      </span>
      <div class="flex gap-2">
        <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="btn btn--secondary"
        >
          Précédent
        </button>
        <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="btn btn--secondary"
        >
          Suivant
        </button>
      </div>
    </div>

  </main>
</template>