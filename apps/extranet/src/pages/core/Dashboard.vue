<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService, TechnologyService } from '#services'
// Importation propre du filtre et des types depuis le module commun ! 🚀
import { TechnologyFilter, type Technology } from '@randomstack/commons'

const router = useRouter()
const technologies = ref<Technology[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// --- ÉTATS RÉACTIFS DES FILTRES ET DE LA PAGINATION ---
const searchQuery = ref('')
const selectedLanguage = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// 1. Appel du filtre partagé de @randomstack/commons 🚀
const filterResult = computed(() => {
  return TechnologyFilter.run(technologies.value, {
    searchQuery: searchQuery.value,
    selectedLanguage: selectedLanguage.value,
    selectedCategory: selectedCategory.value,
    currentPage: currentPage.value,
    itemsPerPage: itemsPerPage.value
  })
})

const paginatedTechnologies = computed(() => filterResult.value.paginatedItems)
const totalPages = computed(() => filterResult.value.totalPages)
const totalCount = computed(() => filterResult.value.totalItemsCount)

// 2. Extraction dynamique des langages via l'utilitaire partagé 🚀
const uniqueLanguages = computed(() => {
  return TechnologyFilter.getUniqueLanguages(technologies.value)
})

const handleFilterChange = () => {
  currentPage.value = 1
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const loadData = async () => {
  try {
    technologies.value = await TechnologyService.fetchAll()
  } catch (err: any) {
    error.value = "Impossible de se connecter à l'API d'administration."
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  try {
    await AuthService.logout()
    router.push('/login')
  } catch {
    alert("Erreur déconnexion.")
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <header class="main-header">
    <div>
      <h1 class="header-title">Gestion du catalogue</h1>
      <p class="header-sub">Visualisez et administrez le pool de technologies de la V1</p>
    </div>
    <router-link to="/edit-technology" class="add-btn">
      + Ajouter une Technologie
    </router-link>
  </header>

  <div v-if="loading" class="loading-text">
    Chargement de la base de données...
  </div>

  <div v-else-if="error" class="error-box">
    {{ error }}
  </div>

  <div v-else class="flex flex-col gap-4">

    <!-- BARRE DE FILTRES DYNAMIQUE -->
    <div class="filter-bar-wrap">

      <input
          v-model="searchQuery"
          @input="handleFilterChange"
          type="text"
          placeholder="🔍 Rechercher (nom, langage, usage...)"
          class="filter-input"
      />

      <select v-model="selectedLanguage" @change="handleFilterChange" class="filter-select">
        <option value="">🌐 Tous les langages</option>
        <option v-for="lang in uniqueLanguages" :key="lang" :value="lang">
          {{ lang }}
        </option>
      </select>

      <select v-model="selectedCategory" @change="handleFilterChange" class="filter-select">
        <option value="">📦 Toutes les catégories</option>
        <option value="FRONTEND">FRONTEND</option>
        <option value="BACKEND">BACKEND</option>
        <option value="DATABASE">DATABASE</option>
        <option value="MOBILE">MOBILE</option>
        <option value="DESKTOP">DESKTOP</option>
      </select>

    </div>

    <!-- TABLEAU D'ADMINISTRATION EXTRANET -->
    <div class="table-container">
      <table class="admin-table">
        <thead>
        <tr>
          <th>Logo</th>
          <th>Nom / Framework</th>
          <th>Langage</th>
          <th>Catégorie</th>
          <th>Utilisation</th>
          <th class="text-right">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="tech in paginatedTechnologies" :key="tech.id">
          <td class="p-4">
            <div class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
              <img v-if="tech.logo" :src="`http://localhost:4000${tech.logo}`" class="w-full h-full object-cover" />
              <span v-else class="text-[9px] font-black text-slate-400 uppercase">{{ tech.name.substring(0, 2) }}</span>
            </div>
          </td>
          <td class="tech-name">{{ tech.name }}</td>
          <td class="tech-lang">{{ tech.language }}</td>
          <td>
              <span class="category-badge">
                {{ tech.category }}
              </span>
          </td>
          <td class="tech-desc">{{ tech.usage }}</td>
          <td class="text-right">
            <router-link :to="`/edit-technology/${tech.id}`" class="edit-btn">
              Éditer
            </router-link>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- PAGINATION -->
    <div class="pagination-container">
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