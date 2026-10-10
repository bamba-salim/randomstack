<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {
  triggerDraw,
  saveShare,
  fetchDrawTechnologies,
  fetchShare,
  fetchHistory,
  type DrawnStack,
  type ClientTechnology
} from '#services'
import {DraftScript} from '#scripts'

import SlotReel from './components/SlotReel.vue'
import BlacklistDrawer from './components/BlacklistDrawer.vue'
import HistoryDrawer from './components/HistoryDrawer.vue'
import ShareModal from './components/ShareModal.vue'

const route = useRoute()
const router = useRouter()

// ─── États globaux de la vue ───────────────────────────────────────────────
// Stack actuellement affiché dans les rouleaux (null = aucun tirage effectué)
const currentStack = ref<DrawnStack | null>(null)
// Historique des stacks tirés pendant la session
const history = ref<DrawnStack[]>([])
// Verrou global pendant un appel réseau ou une animation
const loading = ref(false)
// Vrai pendant l'animation des rouleaux (3,1 secondes)
const isSpinning = ref(false)
// Active ou désactive l'animation des rouleaux
const animateEnabled = ref(true)

// ─── Panneaux latéraux et modales ──────────────────────────────────────────
const showSidebar = ref(false)      // Tiroir historique
const showBlacklist = ref(false)    // Tiroir blacklist
const showShareModal = ref(false)   // Modale de partage

// ─── Cadenas (Locks) ───────────────────────────────────────────────────────
// Quand un cadenas est actif, la couche correspondante n'est pas retirée au prochain tirage
const clientLocked = ref(false)
const serverLocked = ref(false)
const databaseLocked = ref(false)

// ─── Données et Blacklist ──────────────────────────────────────────────────
// Liste complète des technologies chargées au montage
const allTechnologies = ref<ClientTechnology[]>([])
// IDs des technologies exclues du tirage par l'utilisateur
const blacklist = ref<string[]>([])
// Type de projet sélectionné (FRONTEND / MOBILE / DESKTOP)
const selectedProjectType = ref<string>('FRONTEND')
// Code de partage généré après un saveShare réussi
const shareCodeGenerated = ref<string | null>(null)

// ─── Groupement réactif pour le tiroir Blacklist ───────────────────────────
// Regroupe les technologies par couche pour l'affichage dans BlacklistDrawer
const groupedTechnologies = computed(() => ({
  CLIENT: allTechnologies.value.filter(t => Array.isArray(t.categories) && t.categories.some(cat => ['FRONTEND', 'MOBILE', 'DESKTOP'].includes(cat))),
  SERVER: allTechnologies.value.filter(t => Array.isArray(t.categories) && t.categories.includes('BACKEND')),
  DATABASE: allTechnologies.value.filter(t => Array.isArray(t.categories) && t.categories.includes('DATABASE'))
}))

// Ajoute ou retire une technologie de la blacklist selon son état actuel
const toggleBlacklist = (techId: string) => {
  const index = blacklist.value.indexOf(techId)
  if (index > -1) {
    blacklist.value.splice(index, 1)  // Déjà blacklistée → on la retire
  } else {
    blacklist.value.push(techId)      // Pas encore blacklistée → on l'ajoute
  }
}

// ─── Rouleaux (contenu affiché dans chaque SlotReel) ──────────────────────
// Chaque rouleau contient une liste de technologies à défiler (strip) ou la techno finale seule
const clientReel = ref<ClientTechnology[]>([])
const serverReel = ref<ClientTechnology[]>([])
const databaseReel = ref<ClientTechnology[]>([])

/**
 * Déclenche un tirage de stack.
 *
 * Étapes :
 *  1. Envoie le payload (locks, blacklist, stack courant, type de projet) au serveur
 *  2. Récupère le nouveau stack tiré
 *  3. Si l'animation est activée : génère les strips de défilement, lance l'animation,
 *     puis affiche le résultat final après 3,1 secondes
 *  4. Si l'animation est désactivée : affiche directement le résultat
 */
const handleDraw = async () => {
  if (loading.value) return
  loading.value = true
  shareCodeGenerated.value = null  // Réinitialise le code de partage précédent

  try {
    // Payload envoyé au serveur pour le tirage
    const payload = {
      locks: {
        client: clientLocked.value,
        server: serverLocked.value,
        database: databaseLocked.value
      },
      currentStack: currentStack.value,  // Nécessaire pour résoudre les cadenas côté serveur
      blacklist: blacklist.value,
      projectType: selectedProjectType.value
    }

    const data = await triggerDraw(payload)
    const finalClient = data.current.clientLayer
    const finalServer = data.current.serverLayer
    const finalDatabase = data.current.databaseLayer

    if (animateEnabled.value) {
      // Génère un strip de défilement pour chaque couche non verrouillée
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

      // Après 3,1 secondes : arrêt de l'animation et affichage du résultat final
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
      // Mode sans animation : mise à jour immédiate
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

/**
 * Sauvegarde le stack courant et génère un lien de partage.
 * Ouvre la modale ShareModal avec le code généré si la sauvegarde réussit.
 */
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

    const data = await saveShare(payload)
    if (data.success) {
      shareCodeGenerated.value = data.shareCode
      showShareModal.value = true  // Ouvre la modale avec le code de partage
    }
  } catch {
    alert("Impossible de générer le lien de partage.")
  } finally {
    loading.value = false
  }
}

/**
 * Initialisation au montage du composant.
 *
 * Étapes :
 *  1. Charge toutes les technologies disponibles (pour la blacklist)
 *  2. Si un shareCode est présent dans l'URL → charge le stack partagé et s'arrête
 *  3. Sinon → charge l'historique de session et restaure le dernier stack affiché
 */
onMounted(async () => {
  //try {
    // Étape 1 — Chargement de toutes les technologies (nécessaire pour la blacklist)
    allTechnologies.value = await fetchDrawTechnologies()

    // Étape 2 — Détection d'un lien de partage dans l'URL (ex: /draft/:shareCode)
    const shareCode = route.params['shareCode'] as string | undefined
    if (shareCode) {
      loading.value = true
      try {
        const sharedData = await fetchShare(shareCode)
        // Restaure le stack partagé dans les rouleaux
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
        return  // On s'arrête ici, pas besoin de charger l'historique
      } catch {
        // Lien expiré ou invalide → retour à la page de tirage normale
        alert("Ce lien de partage a expiré ou n'existe pas. Chargement de l'historique normal.")
        router.replace('/draft')
      }
    }

    // Étape 3 — Chargement de l'historique de session et restauration du dernier stack
    const fetchedHistory = await fetchHistory()
    history.value = fetchedHistory
    if (fetchedHistory.length > 0) {
      const last = fetchedHistory[0]  // Le plus récent est en tête de liste
      if (last) {
        currentStack.value = last
        clientReel.value = [last.clientLayer!]
        serverReel.value = [last.serverLayer!]
        databaseReel.value = [last.databaseLayer!]
      }
    }
  //} catch {
   // console.warn("Historique de session indisponible.")
 // }
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