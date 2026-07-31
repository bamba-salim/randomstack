<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { StackService, type DrawnStack, type ClientTechnology } from '#services'

// États de la machine
const currentStack = ref<DrawnStack | null>(null)
const history = ref<DrawnStack[]>([])
const loading = ref(false)
const isSpinning = ref(false)
const animateEnabled = ref(true)
const showSidebar = ref(false)

// États de verrouillage
const clientLocked = ref(false)
const serverLocked = ref(false)
const databaseLocked = ref(false)

// Listes d'animation de rouleaux
const clientReel = ref<ClientTechnology[]>([])
const serverReel = ref<ClientTechnology[]>([])
const databaseReel = ref<ClientTechnology[]>([])

const placeholders: ClientTechnology[] = [
  { id: 'p1', name: 'Angular', language: 'TypeScript', usage: 'Frontend', description: '', category: 'FRONTEND' },
  { id: 'p2', name: 'Django', language: 'Python', usage: 'Backend', description: '', category: 'BACKEND' },
  { id: 'p3', name: 'MySQL', language: 'SQL', usage: 'Database', description: '', category: 'DATABASE' },
  { id: 'p4', name: 'React', language: 'JS', usage: 'Frontend', description: '', category: 'FRONTEND' },
  { id: 'p5', name: 'FastAPI', language: 'Python', usage: 'Backend', description: '', category: 'BACKEND' },
  { id: 'p6', name: 'MongoDB', language: 'NoSQL', usage: 'Database', description: '', category: 'DATABASE' },
  { id: 'p7', name: 'Svelte', language: 'JS', usage: 'Frontend', description: '', category: 'FRONTEND' },
  { id: 'p8', name: 'Spring Boot', language: 'Java', usage: 'Backend', description: '', category: 'BACKEND' },
  { id: 'p9', name: 'Redis', language: 'NoSQL', usage: 'Database', description: '', category: 'DATABASE' }
]

const generateReelStrip = (finalItem: ClientTechnology | null, category: string): ClientTechnology[] => {
  const filteredPlaceholders = placeholders.filter(p => {
    if (category === 'CLIENT') return ['FRONTEND', 'MOBILE', 'DESKTOP'].includes(p.category)
    return p.category === category
  })

  const strip: ClientTechnology[] = []
  for (let i = 0; i < 9; i++) {
    const item = filteredPlaceholders[i % filteredPlaceholders.length]
    if (item) strip.push(item)
  }

  strip.push(finalItem || { id: 'empty', name: '...', language: '', usage: '', description: '', category: '' })
  return strip
}

const handleDraw = async () => {
  if (loading.value) return
  loading.value = true

  try {
    const data = await StackService.triggerDraw()

    const finalClient = (clientLocked.value && currentStack.value) ? currentStack.value.clientLayer : data.current.clientLayer
    const finalServer = (serverLocked.value && currentStack.value) ? currentStack.value.serverLayer : data.current.serverLayer
    const finalDatabase = (databaseLocked.value && currentStack.value) ? currentStack.value.databaseLayer : data.current.databaseLayer

    if (animateEnabled.value) {
      if (!clientLocked.value) {
        clientReel.value = generateReelStrip(finalClient, 'CLIENT')
      }
      if (!serverLocked.value) {
        serverReel.value = generateReelStrip(finalServer, 'BACKEND')
      }
      if (!databaseLocked.value) {
        databaseReel.value = generateReelStrip(finalDatabase, 'DATABASE')
      }

      isSpinning.value = true

      setTimeout(() => {
        currentStack.value = {
          clientLayer: finalClient,
          serverLayer: finalServer,
          databaseLayer: finalDatabase,
          timestamp: data.current.timestamp
        }

        // --- LA CORRECTION EST ICI 🚀 ---
        // Dès que l'animation se fige, on nettoie les rouleaux pour ne garder que l'élément final unique
        clientReel.value = [finalClient!]
        serverReel.value = [finalServer!]
        databaseReel.value = [finalDatabase!]

        history.value = data.history
        isSpinning.value = false
        loading.value = false
      }, 3100)
    } else {
      currentStack.value = {
        clientLayer: finalClient,
        serverLayer: finalServer,
        databaseLayer: finalDatabase,
        timestamp: data.current.timestamp
      }
      clientReel.value = [finalClient!]
      serverReel.value = [finalServer!]
      databaseReel.value = [finalDatabase!]
      loading.value = false
    }
  } catch (err) {
    alert("Erreur réseau.")
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const fetchedHistory = await StackService.fetchHistory()
    history.value = fetchedHistory
    if (fetchedHistory.length > 0) {
      const last = fetchedHistory[0]
      if (last) {
        currentStack.value = last
        clientReel.value = [last.clientLayer!]
        serverReel.value = [last.serverLayer!]
        databaseReel.value = [last.databaseLayer!]
      }
    }
  } catch {
    console.warn("Historique de session indisponible.")
  }
})
</script>

<template>
  <main class="home-page-container">
    <div class="cabinet-wrap">
      <div class="cabinet-inner">

        <!-- EN-TÊTE DU CABINET OPTIMISÉ MOBILE -->
        <div class="cabinet-header">
          <div class="title-area">
            <h1 class="title">RANDOMSTACK</h1>
            <p class="description">Cabinet d'Arcade MVP V1</p>
          </div>
          <button @click="showSidebar = true" class="history-trigger-btn">
            🕒 Historique
          </button>
        </div>

        <!-- ZONE DES ROULEAUX GÉANTS RESPONSIVE -->
        <div class="slots-window">

          <!-- ROULEAU 1 : CLIENT -->
          <div class="reel-container">
            <!-- Cadenas compact sur mobile (uniquement l'émoji) 🚀 -->
            <button
                @click="clientLocked = !clientLocked"
                :class="['lock-btn', { 'locked': clientLocked }]"
            >
              {{ clientLocked ? '🔒' : '🔓' }} <span class="hidden sm:inline">{{ clientLocked ? 'Bloqué' : 'Libre' }}</span>
            </button>
            <span class="reel-label">CLIENT <span class="hidden sm:inline">(INTERFACE)</span></span>
            <div class="reel-window">
              <div :class="['reel-strip', { 'spinning': isSpinning && !clientLocked }]">
                <div v-for="tech in clientReel" :key="tech.id" class="reel-item">
                  <div class="tech-logo-placeholder">
                    {{ tech.name.substring(0, 2) }}
                  </div>
                  <div class="tech-details">
                    <span class="tech-name">{{ tech.name }}</span>
                    <span class="tech-sub">{{ tech.usage }}</span>
                  </div>
                </div>
                <div v-if="clientReel.length === 0" class="reel-item">
                  <span class="text-slate-600 font-black text-xs">PRÊT</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ROULEAU 2 : SERVEUR -->
          <div class="reel-container">
            <!-- Cadenas compact sur mobile 🚀 -->
            <button
                @click="serverLocked = !serverLocked"
                :class="['lock-btn', { 'locked': serverLocked }]"
            >
              {{ serverLocked ? '🔒' : '🔓' }} <span class="hidden sm:inline">{{ serverLocked ? 'Bloqué' : 'Libre' }}</span>
            </button>
            <span class="reel-label">SERVEUR <span class="hidden sm:inline">(LOGIQUE)</span></span>
            <div class="reel-window">
              <div :class="['reel-strip', 'delay-server', { 'spinning': isSpinning && !serverLocked }]">
                <div v-for="tech in serverReel" :key="tech.id" class="reel-item">
                  <div class="tech-logo-placeholder">
                    {{ tech.name.substring(0, 2) }}
                  </div>
                  <div class="tech-details">
                    <span class="tech-name">{{ tech.name }}</span>
                    <span class="tech-sub">{{ tech.language }}</span>
                  </div>
                </div>
                <div v-if="serverReel.length === 0" class="reel-item">
                  <span class="text-slate-600 font-black text-xs">PRÊT</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ROULEAU 3 : BASE DE DONNÉES -->
          <div class="reel-container">
            <!-- Cadenas compact sur mobile 🚀 -->
            <button
                @click="databaseLocked = !databaseLocked"
                :class="['lock-btn', { 'locked': databaseLocked }]"
            >
              {{ databaseLocked ? '🔒' : '🔓' }} <span class="hidden sm:inline">{{ databaseLocked ? 'Bloqué' : 'Libre' }}</span>
            </button>
            <span class="reel-label">DONNÉES <span class="hidden sm:inline">(BDD)</span></span>
            <div class="reel-window">
              <div :class="['reel-strip', 'delay-database', { 'spinning': isSpinning && !databaseLocked }]">
                <div v-for="tech in databaseReel" :key="tech.id" class="reel-item">
                  <div class="tech-logo-placeholder">
                    {{ tech.name.substring(0, 2) }}
                  </div>
                  <div class="tech-details">
                    <span class="tech-name">{{ tech.name }}</span>
                    <span class="tech-sub">{{ tech.usage }}</span>
                  </div>
                </div>
                <div v-if="databaseReel.length === 0" class="reel-item">
                  <span class="text-slate-600 font-black text-xs">PRÊT</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- ZONE DE CONTRÔLE -->
        <div class="controls-panel">
          <button @click="handleDraw" :disabled="loading" class="draw-btn">
            {{ loading ? 'SÉLECTION...' : 'TIRER AU SORT !' }}
          </button>

          <div class="toggle-container">
            <span>Activer l'animation</span>
            <div
                @click="animateEnabled = !animateEnabled"
                :class="['switch', { 'checked': animateEnabled }]"
            >
              <span :class="['switch-thumb', { 'checked': animateEnabled }]"></span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- DOUBLE TRANSITION VUE 3 (OVERLAY & SIDEBAR) -->
    <Transition name="fade">
      <div
          v-if="showSidebar"
          @click="showSidebar = false"
          class="sidebar-overlay"
      ></div>
    </Transition>

    <Transition name="slide">
      <div v-if="showSidebar" class="sidebar-panel">
        <div class="sidebar-header">
          <span class="sidebar-title">📜 Historique de session</span>
          <button @click="showSidebar = false" class="close-btn">Fermer ✕</button>
        </div>

        <div v-if="history.length > 0" class="history-list">
          <div v-for="(stack, index) in history" :key="index" class="history-row">
            <div class="row-header">
              <span>TIRAGE #{{ history.length - index }}</span>
              <span>{{ stack.timestamp }}</span>
            </div>
            <div class="summary-wrap">
              <div class="summary-item">
                <span>CLIENT:</span> {{ stack.clientLayer?.name }}
              </div>
              <div class="summary-item">
                <span>SERVEUR:</span> {{ stack.serverLayer?.name }}
              </div>
              <div class="summary-item">
                <span>BASE DE DONNÉES:</span> {{ stack.databaseLayer?.name }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          Aucun tirage réalisé.
        </div>
      </div>
    </Transition>

  </main>
</template>