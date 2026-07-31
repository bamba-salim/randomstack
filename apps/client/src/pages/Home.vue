<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { StackService, type DrawnStack } from '#services'

const currentStack = ref<DrawnStack | null>(null)
const history = ref<DrawnStack[]>([])
const loading = ref(false)

const handleDraw = async () => {
  loading.value = true
  try {
    const data = await StackService.triggerDraw()
    currentStack.value = data.current
    history.value = data.history
  } catch (err) {
    alert("Impossible de réaliser le tirage.")
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const fetchedHistory = await StackService.fetchHistory()
    history.value = fetchedHistory
    if (fetchedHistory.length > 0) {
      currentStack.value = fetchedHistory[0] || null
    }
  } catch {
    console.warn("Historique de session indisponible.")
  }
})
</script>

<template>
  <main class="home-page-container">
    <div class="card-wrap">
      <h1 class="title">RANDOMSTACK</h1>
      <p class="description">Générez une stack de développement aléatoire en un clic.</p>

      <!-- Zone de tirage principal -->
      <div v-if="currentStack" class="current-stack-display">
        <h2 class="section-title">Votre Stack Actuelle</h2>
        <div class="stack-grid">

          <div class="tech-card">
            <span class="label">CLIENT (INTERFACE)</span>
            <span class="value">{{ currentStack.clientLayer?.name || 'Aucun' }}</span>
            <span class="sub">{{ currentStack.clientLayer?.usage }}</span>
          </div>

          <div class="tech-card">
            <span class="label">SERVEUR (LOGIQUE)</span>
            <span class="value">{{ currentStack.serverLayer?.name || 'Aucun' }}</span>
            <span class="sub">{{ currentStack.serverLayer?.language }}</span>
          </div>

          <div class="tech-card">
            <span class="label">BASE DE DONNÉES / STOCKAGE</span>
            <span class="value">{{ currentStack.databaseLayer?.name || 'Aucune' }}</span>
            <span class="sub">{{ currentStack.databaseLayer?.description }}</span>
          </div>

        </div>
      </div>

      <button @click="handleDraw" :disabled="loading" class="draw-btn">
        {{ loading ? 'Sélection en cours...' : 'Tirer au sort !' }}
      </button>

      <!-- Historique de la Session -->
      <div v-if="history.length > 0" class="history-container">
        <h3 class="section-title">Historique de la session (mémoire)</h3>
        <div class="history-list">
          <div v-for="(stack, index) in history" :key="index" class="history-row">
            <span class="time">{{ stack.timestamp }}</span>
            <span class="summary">
              {{ stack.clientLayer?.name }} / {{ stack.serverLayer?.name }} / {{ stack.databaseLayer?.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>