<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService, TechnologyService } from '#services' // Imports épurés par alias 🚀
import type { Technology } from '#interfaces'

const router = useRouter()
const technologies = ref<Technology[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

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
    alert("Erreur lors de la déconnexion.")
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="dashboard-page-container">

    <!-- SIDEBAR DE L'EXTRANET -->
    <aside class="admin-sidebar">
      <div class="sidebar-logo">
        <span class="logo-main">RANDOMSTACK</span>
        <span class="logo-sub">Extranet d'Administration</span>
      </div>

      <nav class="sidebar-nav">
        <a href="#" class="nav-link active">📦 Gérer les Technologies</a>
        <a href="#" class="nav-link disabled">👥 Utilisateurs (V3)</a>
        <a href="#" class="nav-link disabled">📊 Statistiques (V4)</a>

        <button @click="handleLogout" class="logout-btn">
          🚪 Se déconnecter
        </button>
      </nav>
    </aside>

    <!-- CONTENU PRINCIPAL -->
    <main class="admin-main">
      <header class="main-header">
        <div>
          <h1 class="header-title">Gestion du catalogue</h1>
          <p class="header-sub">Visualisez et administrez le pool de technologies de la V1</p>
        </div>
        <button class="add-btn">
          + Ajouter une Technologie (V2)
        </button>
      </header>

      <div v-if="loading" class="loading-text">
        Chargement de la base de données...
      </div>

      <div v-else-if="error" class="error-box">
        {{ error }}
      </div>

      <!-- TABLEAU D'ADMINISTRATION EXTRANET -->
      <div v-else class="table-container">
        <table class="admin-table">
          <thead>
          <tr>
            <th>Nom / Framework</th>
            <th>Langage</th>
            <th>Catégorie</th>
            <th>Utilisation</th>
            <th class="text-right">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="tech in technologies" :key="tech.id">
            <td class="tech-name">{{ tech.name }}</td>
            <td class="tech-lang">{{ tech.language }}</td>
            <td>
                <span class="category-badge">
                  {{ tech.category }}
                </span>
            </td>
            <td class="tech-desc">{{ tech.usage }}</td>
            <td class="text-right">
              <button class="edit-btn">
                Éditer (V2)
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </main>

  </div>
</template>