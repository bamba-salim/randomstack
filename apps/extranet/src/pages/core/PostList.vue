<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {PostService} from '#services'
import {Sidebar, PostTable} from '#components' // Importation sémantique 🚀
import {type Post} from '@randomstack/commons'
import {PostFilter} from '#utils'// Import de l'ordonnanceur commun 🚀

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// --- ÉTATS RÉACTIFS DES FILTRES ET DE LA PAGINATION ---
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedTag = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// 1. Appel du filtrage cumulatif sémantique de @randomstack/commons 🚀
const filterResult = computed(() => {
  return PostFilter.run(posts.value, {
    searchQuery: searchQuery.value,
    selectedStatus: selectedStatus.value,
    selectedTag: selectedTag.value,
    currentPage: currentPage.value,
    itemsPerPage: itemsPerPage.value
  })
})

const paginatedPosts = computed(() => filterResult.value.paginatedItems)
const totalPages = computed(() => filterResult.value.totalPages)
const totalCount = computed(() => filterResult.value.totalItemsCount)

// 2. Extraction dynamique de l'intégralité des tags uniques de la BDD 🚀
const uniqueTags = computed(() => {
  return PostFilter.getUniqueTags(posts.value)
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
    posts.value = await PostService.fetchAll()
  } catch (err: any) {
    error.value = "Impossible de charger la liste d'administration des actualités."
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>

  <main class="admin-main">
    <header class="main-header">
      <div>
        <h1 class="header-title">Gestion des actualités</h1>
        <p class="header-sub">Rédigez, programmez et gérez les articles du blog de RANDOMSTACK</p>
      </div>
      <!-- Bouton sémantique de création d'un article 🚀 -->
      <router-link to="/edit-post" class="add-btn">
        + Rédiger un Article
      </router-link>
    </header>

    <div v-if="loading" class="loading-text">
      Chargement des articles en cours...
    </div>

    <div v-else-if="error" class="error-box">
      {{ error }}
    </div>

    <div v-else class="flex flex-col gap-4">

      <!-- BARRE DE FILTRES DÉCOUPLÉE MULTI-CRITÈRES 🚀 -->
      <div class="filter-bar-wrap">

        <!-- Recherche textuelle croisée (Auteurs, Titre, Contenu) -->
        <input
            v-model="searchQuery"
            @input="handleFilterChange"
            type="text"
            placeholder="🔍 Rechercher (titre, contenu, auteur...)"
            class="filter-input"
        />

        <!-- Sélecteur de statut sémantique -->
        <select v-model="selectedStatus" @change="handleFilterChange" class="filter-select">
          <option value="">📰 Tous les statuts</option>
          <option value="DRAFT">DRAFT (Brouillon)</option>
          <option value="PUBLISHED">PUBLISHED (En ligne)</option>
          <option value="SCHEDULED">SCHEDULED (Planifié)</option>
          <option value="ARCHIVED">ARCHIVED (Archivé)</option>
          <option value="DELETED">DELETED (Corbeille)</option>
        </select>

        <!-- Sélecteur de Tag dynamique -->
        <select v-model="selectedTag" @change="handleFilterChange" class="filter-select">
          <option value="">🏷️ Tous les tags</option>
          <option v-for="tag in uniqueTags" :key="tag" :value="tag">
            #{{ tag }}
          </option>
        </select>

      </div>

      <!-- TABLEAU D'ADMINISTRATION DES ARTICLES 🚀 -->
      <PostTable :posts="paginatedPosts"/>

      <!-- PAGINATION D'ARCADE WP-STYLE -->
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
  </main>

</template>