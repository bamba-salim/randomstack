<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {StackService, type DrawnStack, type ClientTechnology} from '#services'
import {DraftScript} from '#scripts'
import {SlotReel, BlacklistDrawer, HistoryDrawer, ShareModal} from "#components"


const route = useRoute()
const router = useRouter()

// États de la machine
const currentStack = ref<DrawnStack | null>(null)
const history = ref<DrawnStack[]>([])
const loading = ref(false)
const isSpinning = ref(false)
const animateEnabled = ref(true)

// Panneaux latéraux et modales
const showSidebar = ref(false)
const showBlacklist = ref(false)
const showShareModal = ref(false)

// Cadenas (Locks)
const clientLocked = ref(false)
const serverLocked = ref(false)
const databaseLocked = ref(false)

// Données et Blacklist
const allTechnologies = ref<ClientTechnology[]>([])
const blacklist = ref<string[]>([])
const selectedProjectType = ref<string>('FRONTEND')
const shareCodeGenerated = ref<string | null>(null)

// Tri réactif de la blacklist
const groupedTechnologies = computed(() => ({
  CLIENT: allTechnologies.value.filter(t => Array.isArray(t.categories) && t.categories.some(cat => ['FRONTEND', 'MOBILE', 'DESKTOP'].includes(cat))),
  SERVER: allTechnologies.value.filter(t => Array.isArray(t.categories) && t.categories.includes('BACKEND')),
  DATABASE: allTechnologies.value.filter(t => Array.isArray(t.categories) && t.categories.includes('DATABASE'))
}))

const toggleBlacklist = (techId: string) => {
  const index = blacklist.value.indexOf(techId)
  if (index > -1) {
    blacklist.value.splice(index, 1)
  } else {
    blacklist.value.push(techId)
  }
}

// Rouleaux
const clientReel = ref<ClientTechnology[]>([])
const serverReel = ref<ClientTechnology[]>([])
const databaseReel = ref<ClientTechnology[]>([])

const handleDraw = async () => {
  if (loading.value) return
  loading.value = true
  shareCodeGenerated.value = null

  try {
    const payload = {
      locks: {
        client: clientLocked.value,
        server: serverLocked.value,
        database: databaseLocked.value
      },
      currentStack: currentStack.value,
      blacklist: blacklist.value,
      projectType: selectedProjectType.value
    }

    const data = await StackService.triggerDraw(payload)
    const finalClient = data.current.clientLayer
    const finalServer = data.current.serverLayer
    const finalDatabase = data.current.databaseLayer

    if (animateEnabled.value) {
      if (!clientLocked.value) {
        clientReel.value = DraftScript.generateReelStrip(finalClient, 'CLIENT')
      }
      if (!serverLocked.value) {
        serverReel.value = DraftScript.generateReelStrip(finalServer, 'BACKEND')
      }
      if (!databaseLocked.value) {
        databaseReel.value = DraftScript.generateReelStrip(finalDatabase, 'DATABASE')
      }

      isSpinning.value = true

      setTimeout(() => {
        currentStack.value = data.current
        clientReel.value = [finalClient!]
        serverReel.value = [finalServer!]
        databaseReel.value = [finalDatabase!]
        history.value = data.history
        isSpinning.value = false
        loading.value = false
      }, 3100)
    } else {
      currentStack.value = data.current
      clientReel.value = [finalClient!]
      serverReel.value = [finalServer!]
      databaseReel.value = [finalDatabase!]
      history.value = data.history
      loading.value = false
    }
  } catch {
    alert("Erreur réseau lors de la génération.")
    loading.value = false
  }
}

const handleShare = async () => {
  if (!currentStack.value || loading.value) return
  loading.value = true

  try {
    const payload = {
      projectType: selectedProjectType.value,
      frontendId: currentStack.value.clientLayer?.id || '',
      backendId: currentStack.value.serverLayer?.id || '',
      databaseId: currentStack.value.databaseLayer?.id || '',
      ormId: null
    }

    const data = await StackService.saveShare(payload)
    if (data.success) {
      shareCodeGenerated.value = data.shareCode
      showShareModal.value = true
    }
  } catch {
    alert("Impossible de générer le lien de partage.")
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    allTechnologies.value = await StackService.fetchAllTechnologies()

    const shareCode = route.params['shareCode'] as string | undefined
    if (shareCode) {
      loading.value = true
      try {
        const sharedData = await StackService.fetchShare(shareCode)
        selectedProjectType.value = sharedData.projectType
        currentStack.value = {
          clientLayer: sharedData.clientLayer,
          serverLayer: sharedData.serverLayer,
          databaseLayer: sharedData.databaseLayer,
          timestamp: sharedData.timestamp
        }
        clientReel.value = [sharedData.clientLayer!]
        serverReel.value = [sharedData.serverLayer!]
        databaseReel.value = [sharedData.databaseLayer!]
        loading.value = false
        return
      } catch {
        alert("Ce lien de partage a expiré ou n'existe pas. Chargement de l'historique normal.")
        router.replace('/draft')
      }
    }

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

        <!-- En-tête du Cabinet -->
        <div class="cabinet-header">
          <button @click="showBlacklist = true" class="blacklist-trigger-btn">
            🚫 Exclure
          </button>

          <div class="title-area">
            <h1 class="title">RANDOMSTACK</h1>
            <p class="description">Cabinet d'Arcade MVP V1</p>
          </div>

          <button @click="showSidebar = true" class="history-trigger-btn">
            🕒 Historique
          </button>
        </div>

        <!-- Type de Projet -->
        <div class="project-type-selector">
          <button
              @click="selectedProjectType = 'FRONTEND'"
              :class="['arcade-type-btn', { 'active': selectedProjectType === 'FRONTEND' }]"
          >
            🕹️ Web
          </button>
          <button
              @click="selectedProjectType = 'MOBILE'"
              :class="['arcade-type-btn', { 'active': selectedProjectType === 'MOBILE' }]"
          >
            📱 Mobile
          </button>
          <button
              @click="selectedProjectType = 'DESKTOP'"
              :class="['arcade-type-btn', { 'active': selectedProjectType === 'DESKTOP' }]"
          >
            💻 Desktop
          </button>
        </div>

        <!-- ZONE DES 3 ROULEAUX FACTORISÉS 🚀 -->
        <div class="slots-window">
          <SlotReel
              label="CLIENT"
              :items="clientReel"
              :is-locked="clientLocked"
              :is-spinning="isSpinning"
              subtitle-key="usage"
              @toggle-lock="clientLocked = !clientLocked"
          />

          <SlotReel
              label="SERVEUR"
              :items="serverReel"
              :is-locked="serverLocked"
              :is-spinning="isSpinning"
              delay-class="delay-server"
              subtitle-key="language"
              @toggle-lock="serverLocked = !serverLocked"
          />

          <SlotReel
              label="DONNÉES"
              :items="databaseReel"
              :is-locked="databaseLocked"
              :is-spinning="isSpinning"
              delay-class="delay-database"
              subtitle-key="usage"
              @toggle-lock="databaseLocked = !databaseLocked"
          />
        </div>

        <!-- Panneau de Contrôle -->
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

          <button
              @click="handleShare"
              :disabled="!currentStack || loading"
              class="share-stack-btn"
          >
            🔗 Partager cette combinaison
          </button>

          <router-link to="/" class="lobby-back-link">
            ← Quitter et retourner au Lobby
          </router-link>
        </div>

      </div>
    </div>

    <!-- Composants Modulaires Extraits -->
    <BlacklistDrawer
        :is-open="showBlacklist"
        :grouped-technologies="groupedTechnologies"
        :blacklist="blacklist"
        @close="showBlacklist = false"
        @toggle="toggleBlacklist"
    />

    <HistoryDrawer
        :is-open="showSidebar"
        :history="history"
        @close="showSidebar = false"
    />

    <ShareModal
        :is-open="showShareModal"
        :share-code="shareCodeGenerated"
        @close="showShareModal = false"
    />
  </main>
</template>