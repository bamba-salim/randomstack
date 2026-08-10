<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { StackService } from '#services'
import { TechCard } from '#components'
import { TechnologyFilter, type Technology } from '@randomstack/commons'

const technologies = ref<Technology[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// États de recherche et de filtrage réactifs
const searchQuery = ref('')
const selectedFilter = ref<string>('ALL')

const filteredTechnologies = computed(() => {
  return TechnologyFilter.run(technologies.value, {
    searchQuery: searchQuery.value,
    selectedLanguage: '',
    selectedCategory: selectedFilter.value,
    currentPage: 1,
    itemsPerPage: 100
  }).paginatedItems
})

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

    <!-- 1. EN-TÊTE DE PAGE ÉPURÉ 🚀 -->
    <header class="encyclopedia-header-top">
      <div>
        <h1 class="title">L'Encyclopédie</h1>
        <p class="description">Découvrez le catalogue de technologies de RANDOMSTACK</p>
      </div>
    </header>

    <!-- 2. ZONE DE FILTRES MULTI-CRITÈRES PLACÉE EN HAUT 🚀 -->
    <div class="filter-row-top">
      <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Rechercher une technologie (ex: React, Django, SQLite, Mobile...)"
          class="search-input"
      />

      <div class="tab-filters">
        <button @click="selectedFilter = 'ALL'" :class="['tab-btn', { 'active': selectedFilter === 'ALL' }]">Tout</button>
        <button @click="selectedFilter = 'FRONTEND'" :class="['tab-btn', { 'active': selectedFilter === 'FRONTEND' }]">Web</button>
        <button @click="selectedFilter = 'BACKEND'" :class="['tab-btn', { 'active': selectedFilter === 'BACKEND' }]">Backend</button>
        <button @click="selectedFilter = 'DATABASE'" :class="['tab-btn', { 'active': selectedFilter === 'DATABASE' }]">Base de données</button>
        <button @click="selectedFilter = 'MOBILE'" :class="['tab-btn', { 'active': selectedFilter === 'MOBILE' }]">Mobile</button>
      </div>
    </div>

    <!-- 3. GRILLE DE CARTES ENTIÈREMENT OUVERTE SUR TOUTE LA PAGE 🚀 -->
    <div v-if="loading" class="loading-state">
      Chargement de l'encyclopédie...
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <div v-else class="encyclopedia-grid-open">
      <TechCard
          v-for="tech in filteredTechnologies"
          :key="tech.id"
          :tech="tech"
      />
    </div>

    <p v-if="!loading && !error && filteredTechnologies.length === 0" class="empty-state">
      Aucun outil ne correspond à vos critères de recherche.
    </p>

  </div>
</template>