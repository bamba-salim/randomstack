<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {StackService, type DrawnStack, type ClientTechnology} from '#services'
import {DraftScript} from '#scripts' // Importation du script statique 🚀

const route = useRoute()
const router = useRouter()

// États de la machine
const currentStack = ref<DrawnStack | null>(null)
const history = ref<DrawnStack[]>([])
const loading = ref(false)
const isSpinning = ref(false)
const animateEnabled = ref(true)
const showSidebar = ref(false)

// Cadenas (Locks)
const clientLocked = ref(false)
const serverLocked = ref(false)
const databaseLocked = ref(false)

// Blacklist
const allTechnologies = ref<ClientTechnology[]>([])
const blacklist = ref<string[]>([])
const showBlacklist = ref(false)

// Type de Projet (Category FRONTEND / MOBILE / DESKTOP) 🚀
const selectedProjectType = ref<string>('FRONTEND')

// Partage de liens à durée limitée (7 jours) 🚀
const shareCodeGenerated = ref<string | null>(null)
const showShareModal = ref(false)
const copiedSuccess = ref(false)

// Crée une URL réactive sécurisée accessible dans le template 🚀
const shareLinkUrl = computed(() => {
  if (!shareCodeGenerated.value) return ''
  return `${window.location.origin}/draft/${shareCodeGenerated.value}`
})


// Tri réactif de la blacklist par catégorie
const groupedTechnologies = computed(() => {
  console.log(allTechnologies.value)

  const res = {
    CLIENT: allTechnologies.value.filter(t => Array.isArray(t.categories) && t.categories.some(cat => ['FRONTEND', 'MOBILE', 'DESKTOP'].includes(cat))),

    SERVER: allTechnologies.value.filter(t => Array.isArray(t.categories) && t.categories.includes('BACKEND')),

    DATABASE: allTechnologies.value.filter(t => Array.isArray(t.categories) && t.categories.includes('DATABASE'))
  }

  console.log(res)
  return res
})

const toggleBlacklist = (techId: string) => {
  const index = blacklist.value.indexOf(techId)
  if (index > -1) {
    blacklist.value.splice(index, 1)
  } else {
    blacklist.value.push(techId)
  }
}

// Listes d'animation de rouleaux
const clientReel = ref<ClientTechnology[]>([])
const serverReel = ref<ClientTechnology[]>([])
const databaseReel = ref<ClientTechnology[]>([])

const handleDraw = async () => {
  if (loading.value) return
  loading.value = true
  shareCodeGenerated.value = null // Réinitialise l'ancien code de partage

  try {
    const payload = {
      locks: {
        client: clientLocked.value,
        server: serverLocked.value,
        database: databaseLocked.value
      },
      currentStack: currentStack.value,
      blacklist: blacklist.value,
      projectType: selectedProjectType.value // Envoi du type de projet au serveur 🚀
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
  } catch (err) {
    alert("Erreur réseau lors de la génération.")
    loading.value = false
  }
}

// Action : Créer et enregistrer la combinaison de partage en BDD 🚀
const handleShare = async () => {
  if (!currentStack.value || loading.value) return
  loading.value = true
  copiedSuccess.value = false

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

const copyShareLink = () => {
  if (!shareCodeGenerated.value) return
  const fullUrl = `${window.location.origin}/draft/${shareCodeGenerated.value}`
  navigator.clipboard.writeText(fullUrl).then(() => {
    copiedSuccess.value = true
    setTimeout(() => {
      copiedSuccess.value = false
    }, 2000)
  })
}

onMounted(async () => {
  try {
    allTechnologies.value = await StackService.fetchAllTechnologies()


    // CHARGEMENT AUTOMATIQUE D'UN CODE DE PARTAGE DANS L'URL 🚀
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
      } catch (err: any) {
        alert("Ce lien de partage a expiré ou n'existe pas. Chargement de l'historique normal.")
        router.replace('/draft')
      }
    }

    // Chargement normal de l'historique de session
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

        <!-- EN-TÊTE DU CABINET -->
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

        <!-- SÉLECTION DU TYPE DE PROJET (BOUTONS D'ARCADE) 🚀 -->
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

        <!-- ZONE DES ROULEAUX GÉANTS -->
        <div class="slots-window">

          <!-- ROULEAU 1 : CLIENT -->
          <div class="reel-container">
            <button
                @click="clientLocked = !clientLocked"
                :class="['lock-btn', { 'locked': clientLocked }]"
            >
              {{ clientLocked ? '🔒' : '🔓' }} <span class="hidden sm:inline">{{
                clientLocked ? 'Bloqué' : 'Libre'
              }}</span>
            </button>
            <span class="reel-label">CLIENT</span>
            <div class="reel-window">
              <div :class="['reel-strip', { 'spinning': isSpinning && !clientLocked }]">
                <div v-for="tech in clientReel" :key="tech.id" class="reel-item">
                  <div class="tech-logo-placeholder">
                    <img v-if="tech.logo" :src="`http://localhost:4000${tech.logo}`"
                         class="w-full h-full object-cover"/>
                    <span v-else>{{ tech.name.substring(0, 2) }}</span>
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
            <button
                @click="serverLocked = !serverLocked"
                :class="['lock-btn', { 'locked': serverLocked }]"
            >
              {{ serverLocked ? '🔒' : '🔓' }} <span class="hidden sm:inline">{{
                serverLocked ? 'Bloqué' : 'Libre'
              }}</span>
            </button>
            <span class="reel-label">SERVEUR</span>
            <div class="reel-window">
              <div :class="['reel-strip', 'delay-server', { 'spinning': isSpinning && !serverLocked }]">
                <div v-for="tech in serverReel" :key="tech.id" class="reel-item">
                  <div class="tech-logo-placeholder">
                    <img v-if="tech.logo" :src="`http://localhost:4000${tech.logo}`"
                         class="w-full h-full object-cover"/>
                    <span v-else>{{ tech.name.substring(0, 2) }}</span>
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
            <button
                @click="databaseLocked = !databaseLocked"
                :class="['lock-btn', { 'locked': databaseLocked }]"
            >
              {{ databaseLocked ? '🔒' : '🔓' }} <span class="hidden sm:inline">{{
                databaseLocked ? 'Bloqué' : 'Libre'
              }}</span>
            </button>
            <span class="reel-label">DONNÉES</span>
            <div class="reel-window">
              <div :class="['reel-strip', 'delay-database', { 'spinning': isSpinning && !databaseLocked }]">
                <div v-for="tech in databaseReel" :key="tech.id" class="reel-item">
                  <div class="tech-logo-placeholder">
                    <img v-if="tech.logo" :src="`http://localhost:4000${tech.logo}`"
                         class="w-full h-full object-cover"/>
                    <span v-else>{{ tech.name.substring(0, 2) }}</span>
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

          <!-- BOUTON DE CRÉATION DE LIEN DE PARTAGE 🔗 🚀 -->
          <button
              @click="handleShare"
              :disabled="!currentStack || loading"
              class="share-stack-btn"
          >
            🔗 Partager cette combinaison
          </button>

          <!-- Bouton de retour au Lobby -->
          <router-link to="/" class="lobby-back-link">
            ← Quitter et retourner au Lobby
          </router-link>
        </div>

      </div>
    </div>

    <!-- DOUBLE TRANSITION VUE 3 (OVERLAYS ET TIROIRS SYMÉTRIQUES GAUCHE/DROITE) -->

    <Transition name="fade">
      <div
          v-if="showSidebar || showBlacklist"
          @click="showSidebar = false; showBlacklist = false"
          class="sidebar-overlay"
      ></div>
    </Transition>

    <!-- Tiroir Gauche (Blacklist) -->
    <Transition name="slide-left">
      <div v-if="showBlacklist" class="blacklist-panel">
        <div class="blacklist-header">
          <span class="blacklist-title">🚫 Exclusions de technologies</span>
          <button @click="showBlacklist = false" class="close-btn">Fermer ✕</button>
        </div>

        <div class="blacklist-content">
          <!-- CLIENTS -->
          <div class="category-section">
            <span class="category-name">CLIENTS INTERFACES</span>
            <div class="tech-checkbox-grid">
              <div
                  v-for="tech in groupedTechnologies.CLIENT"
                  :key="tech.id"
                  @click="toggleBlacklist(tech.id)"
                  :class="['tech-checkbox-item', { 'blacklisted': blacklist.includes(tech.id) }]"
              >
                <span>{{ blacklist.includes(tech.id) ? '🔴' : '🟢' }}</span>
                <span class="truncate">{{ tech.name }}</span>
              </div>
            </div>
          </div>

          <!-- SERVEURS -->
          <div class="category-section">
            <span class="category-name">SERVEURS LOGIQUES</span>
            <div class="tech-checkbox-grid">
              <div
                  v-for="tech in groupedTechnologies.SERVER"
                  :key="tech.id"
                  @click="toggleBlacklist(tech.id)"
                  :class="['tech-checkbox-item', { 'blacklisted': blacklist.includes(tech.id) }]"
              >
                <span>{{ blacklist.includes(tech.id) ? '🔴' : '🟢' }}</span>
                <span class="truncate">{{ tech.name }}</span>
              </div>
            </div>
          </div>

          <!-- BASES DE DONNÉES -->
          <div class="category-section">
            <span class="category-name">BASES DE DONNÉES</span>
            <div class="tech-checkbox-grid">
              <div
                  v-for="tech in groupedTechnologies.DATABASE"
                  :key="tech.id"
                  @click="toggleBlacklist(tech.id)"
                  :class="['tech-checkbox-item', { 'blacklisted': blacklist.includes(tech.id) }]"
              >
                <span>{{ blacklist.includes(tech.id) ? '🔴' : '🟢' }}</span>
                <span class="truncate">{{ tech.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Tiroir Droite (Historique) -->
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

    <!-- MODAL DE SUCCÈS DE CRÉATION DE LIEN DE PARTAGE à durée limitée 🚀 -->
    <Transition name="fade">
      <div v-if="showShareModal" @click="showShareModal = false" class="share-modal-overlay">
        <div class="share-modal-card" @click.stop>
          <span class="modal-icon">🔗</span>
          <h3 class="modal-title">Lien de partage généré !</h3>
          <p class="modal-info">Ce lien de partage restera valide pendant 7 jours avant d'être supprimé automatiquement
            par la maintenance BDD.</p>

          <div class="link-copy-box">
            <input
                readonly
                :value="shareLinkUrl"
                class="copy-input"
            />
            <button @click="copyShareLink" class="copy-btn">
              {{ copiedSuccess ? 'Copié !' : 'Copier' }}
            </button>
          </div>

          <button @click="showShareModal = false" class="close-modal-btn">Fermer</button>
        </div>
      </div>
    </Transition>

  </main>
</template>