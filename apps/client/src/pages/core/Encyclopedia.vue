<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { StackService, type ClientTechnology } from '#services'

const technologies = ref<ClientTechnology[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Recherche réactive
const searchQuery = ref('')
const selectedFilter = ref<string>('ALL') // 'ALL', 'FRONTEND', 'BACKEND', 'DATABASE', 'MOBILE', 'DESKTOP'

// Filtrage cumulatif sémantique (computed) 🚀
const filteredTechnologies = computed(() => {
  let result = technologies.value

  // Filtre par catégorie d'onglet
  if (selectedFilter.value !== 'ALL') {
    result = result.filter(t => {
      // Pour une navigation propre, on regroupe desktop sous le web
      if (selectedFilter.value === 'FRONTEND') return ['FRONTEND', 'DESKTOP'].includes(t.category)
      return t.category === selectedFilter.value
    })
  }

  // Filtre par saisie de recherche (nom, langage, usage, description)
  const query = searchQuery.value.toLowerCase().trim()
  if (query) {
    result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.language.toLowerCase().includes(query) ||
        t.usage.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    )
  }

  return result
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
    <div class="encyclopedia-card max-w-4xl w-full">

      <!-- EN-TÊTE -->
      <header class="encyclopedia-header">
        <div>
          <h1 class="title">L'Encyclopédie</h1>
          <p class="description">Découvrez le catalogue de technologies de RANDOMSTACK</p>
        </div>
        <router-link to="/" class="back-home-btn">
          ← Retour au Lobby
        </router-link>
      </header>

      <!-- FILTRES ET ONGLET RÉACTIFS 🚀 -->
      <div class="filter-row">
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

      <!-- CORPS DE LA GALERIE -->
      <div v-if="loading" class="loading-state">
        Chargement de l'encyclopédie...
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <div v-else class="encyclopedia-grid">
        <div
            v-for="tech in filteredTechnologies"
            :key="tech.id"
            class="tech-detail-card"
        >
          <div class="tech-header">
            <!-- Logo avec repli textuel propre -->
            <div class="logo-wrap shrink-0">
              <img v-if="tech.logo" :src="`http://localhost:4000${tech.logo}`" />
              <span v-else class="text-[10px] font-black uppercase">{{ tech.name.substring(0, 2) }}</span>
            </div>
            <div class="text-wrap">
              <h3 class="name">{{ tech.name }}</h3>
              <span class="lang-badge">{{ tech.language }}</span>
            </div>
          </div>
          <p class="desc">{{ tech.description }}</p>
          <div class="meta-footer">
            <span class="meta-badge bg-blue-950/30 border border-blue-900 text-blue-400">
              {{ tech.category }}
            </span>
            <span class="meta-usage text-slate-500 font-semibold truncate">
              {{ tech.usage }}
            </span>
          </div>
        </div>

        <p v-if="filteredTechnologies.length === 0" class="empty-state">
          Aucun outil ne correspond à vos critères de recherche.
        </p>
      </div>

    </div>
  </div>
</template>