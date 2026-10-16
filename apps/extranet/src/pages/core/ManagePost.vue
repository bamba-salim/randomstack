<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {fetchPosts, getMe} from '#services'
import {PostTable} from '#components'
import type {AdminPostListed, Role} from '@randomstack/commons'
import {PostFilter} from '#utils'

const posts = ref<AdminPostListed[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const role = ref<Role | null>(null)

const canCreatePost = computed(() =>
  role.value === 'ADMIN' || role.value === 'EDITOR' || role.value === 'AUTHOR'
)
const isReadOnly = computed(() => role.value === 'MODERATOR')

const subtitle = computed(() => {
  if (role.value === 'AUTHOR') return 'Tes articles uniquement (brouillons, publiés, programmés).'
  if (role.value === 'EDITOR') return 'Tous les articles — contenu, statut et à la une.'
  if (role.value === 'MODERATOR') return 'Tous les articles — consultation seule (signalements via Inbox).'
  return 'Rédigez, programmez et gérez les articles du blog de RANDOMSTACK'
})

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
    posts.value = await fetchPosts()
  } catch (err: any) {
    error.value = "Impossible de charger la liste d'administration des actualités."
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const me = await getMe()
  role.value = me?.role ?? null
  loadData()
})
</script>

<template>

  <header class="main-header">
    <div>
      <h1 class="header-title">Gestion des actualités</h1>
      <p class="header-sub">{{ subtitle }}</p>
    </div>
    <router-link v-if="canCreatePost" to="/edit-post" class="add-btn">
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

      <!-- Recherche client : titre, résumé, auteur, tags -->
      <input
          v-model="searchQuery"
          @input="handleFilterChange"
          type="text"
          placeholder="🔍 Rechercher (titre, résumé, auteur, tags…)"
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
    <PostTable :posts="paginatedPosts" :read-only="isReadOnly"/>

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

</template>