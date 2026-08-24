<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {PostService} from '#services'
import {Sidebar, BaseInput, BaseToggle, PostBlockManager} from '#components'
import {FormDataUtils, type EditPostFormBean} from '@randomstack/commons'

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const postId = ref<string | undefined>(undefined)

const loading = ref(false)
const errorMsg = ref<string | null>(null)

// 1. LE FORMBEAN SÉMANTIQUE D'ARTICLES 🚀
const formBean = ref<EditPostFormBean | null>(null)

const previewUrl = ref<string | null>(null)

// Détermine si l'article a déjà été en ligne pour masquer/bloquer la planification 🚀
const canSchedule = computed(() => {
  return !formBean.value?.hasBeenPublished
})

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0 && formBean.value) {
    const file = files[0]!
    formBean.value.image = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

// Soumission du formulaire d'un coup de manière transparente 🚀
const handleSave = async (targetStatus: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED') => {
  if (!formBean.value || loading.value) return
  errorMsg.value = null
  loading.value = true

  // On injecte dynamiquement le statut sémantique dicté par le bouton d'arcade cliqué ! 🚀
  formBean.value.status = targetStatus

  try {
    const formData = FormDataUtils.toFormData(formBean.value)

    await PostService.save(formData, postId.value)
    router.push('/dashboard')
  } catch (err: any) {
    errorMsg.value = err.message || "Erreur lors de l'enregistrement de l'article."
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    if (route.params['id']) {
      isEditMode.value = true
      postId.value = route.params['id'] as string

      // Hydratation sémantique d'une seule ligne de code réseau 🚀
      const flatFormBean = await PostService.fetchPostFormData(postId.value)
      formBean.value = flatFormBean

      if (flatFormBean.imageUrl) {
        previewUrl.value = `http://localhost:4000${flatFormBean.imageUrl}`
      }
    } else {
      isEditMode.value = false
      // Initialisation du FormBean vide directement par le serveur 🚀
      const initialFormBean = await PostService.fetchPostFormData()
      formBean.value = initialFormBean
    }
  } catch {
    errorMsg.value = "Impossible d'initialiser le formulaire d'actualités."
  } finally {
    loading.value = false
  }
})
</script>

<template>


  <main class="admin-main">
    <header class="main-header">
      <div>
        <h1 class="header-title">
          {{ isEditMode ? `Édition : ${formBean?.title}` : 'Rédiger un nouvel article' }}
        </h1>
        <p class="header-sub">Éditeur d'actualités et de fiches par blocs sémantiques</p>
      </div>
    </header>

    <div v-if="loading && !formBean" class="loading-text">
      Initialisation du formulaire...
    </div>

    <div v-else-if="errorMsg" class="error-box">
      {{ errorMsg }}
    </div>

    <!-- Le formulaire n'est rendu qu'une fois le FormBean hydraté par le serveur 🚀 -->
    <form v-else-if="formBean" @submit.prevent class="form-page-container">

      <div class="form-grid">
        <!-- Titre principal de l'article -->
        <BaseInput v-model="formBean.title" label="Titre de l'article" required
                   placeholder="Ex: SvelteKit v2 est disponible..."/>
      </div>

      <!-- Court résumé pour la page d'accueil -->
      <div class="form-group col-span-2">
        <label class="form-label">Résumé court (Extrait d'accroche pour l'accueil)</label>
        <textarea v-model="formBean.summary" required class="form-textarea"
                  placeholder="Rédigez un court extrait accrocheur..."></textarea>
      </div>

      <!-- CONSTRUCTEUR DE CONTENU PAR BLOCS (DRAG & DROP VERTICAL ET COLOUMN SWAP) -->
      <div class="form-group col-span-2">
        <PostBlockManager v-model="formBean.content"/>
      </div>

      <!-- Image principale d'illustration de l'article -->
      <div class="form-group col-span-2">
        <label class="form-label">Image d'illustration principale (Optionnelle)</label>
        <div class="file-upload-zone">
          <div class="current-logo-preview">
            <img v-if="previewUrl" :src="previewUrl"/>
            <span v-else class="text-slate-400 font-bold">?</span>
          </div>
          <input type="file" accept="image/*" @change="handleFileChange" class="file-input"/>
        </div>
      </div>

      <!-- SÉLECTEUR DE PLANIFICATION DE DATE (S'affiche uniquement si la planification est autorisée) 🚀 -->
      <div v-if="canSchedule" class="form-grid">
        <BaseInput
            v-model="formBean.publishAt"
            label="Date et heure de mise en ligne programmée (Optionnelle)"
            placeholder="Format: AAAA-MM-JJTHH:MM:SS"
        />
      </div>

      <!-- PALETTE DES BOUTONS D'ACTIONS DE SOUMISSION WP-STYLE 🚀 -->
      <div class="form-actions">
        <router-link to="/dashboard" class="cancel-btn">Annuler</router-link>

        <!-- 1. Enregistrer en Brouillon -->
        <button type="button" @click="handleSave('DRAFT')" :disabled="loading"
                class="save-btn bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300">
          Enregistrer en Brouillon
        </button>

        <!-- 2. Archiver l'article -->
        <button v-if="isEditMode" type="button" @click="handleSave('ARCHIVED')" :disabled="loading"
                class="save-btn bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300">
          Archiver
        </button>

        <!-- 3. Planifier la publication (Masqué si l'article a déjà été en ligne une fois) 🚀 -->
        <button v-if="canSchedule" type="button" @click="handleSave('SCHEDULED')" :disabled="loading"
                class="save-btn bg-purple-600 hover:bg-purple-500 border-purple-600 text-white">
          Planifier le post
        </button>

        <!-- 4. Publier immédiatement -->
        <button type="button" @click="handleSave('PUBLISHED')" :disabled="loading" class="save-btn">
          {{ isEditMode ? 'Enregistrer et Publier' : 'Publier immédiatement' }}
        </button>
      </div>

    </form>
  </main>


</template>