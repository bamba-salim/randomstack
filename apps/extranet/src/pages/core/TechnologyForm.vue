<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {TechnologyService} from '#services'
// Importation propre de la Sidebar et du nouveau ParagraphManager ! 🚀
import {Sidebar, ParagraphManager} from '#components'
import {
  FormDataUtils,
  TechnologyFilter,
  type Technology,
  type Category,
  type SaveTechnologyInput
} from '@randomstack/commons'

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const techId = ref<string | undefined>(undefined)

const loading = ref(false)
const errorMsg = ref<string | null>(null)

// 1. LE FORMBEAN UNIQUE AVEC TOUS LES NOUVEAUX CHAMPS DU CAHIER DES CHARGES 🚀
const formBean = ref<SaveTechnologyInput | null>(null)

// Variables de contrôle d'autocomplétion des langages
const allTechnologies = ref<Technology[]>([])
const selectedLanguageDropdown = ref('')
const isCustomLanguage = ref(false)

const previewUrl = ref<string | null>(null)

const uniqueLanguages = computed(() => {
  return TechnologyFilter.getUniqueLanguages(allTechnologies.value)
})

const handleLanguageSelect = () => {
  if (!formBean.value) return
  if (selectedLanguageDropdown.value === '__NEW__') {
    isCustomLanguage.value = true
    formBean.value.language = ''
  } else {
    formBean.value.language = selectedLanguageDropdown.value
  }
}

const cancelCustomLanguage = () => {
  if (!formBean.value) return
  isCustomLanguage.value = false
  selectedLanguageDropdown.value = uniqueLanguages.value[0] || ''
  formBean.value.language = selectedLanguageDropdown.value
}

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0 && formBean.value) {
    const file = files[0]!
    formBean.value.logo = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const handleSave = async () => {
  if (!formBean.value || loading.value) return
  errorMsg.value = null
  loading.value = true

  try {

    const formData = FormDataUtils.toFormData(formBean.value)
    await TechnologyService.save(formData, techId.value)
    router.push('/dashboard')
  } catch (err: any) {
    errorMsg.value = err.message || "Erreur lors de l'enregistrement."
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    allTechnologies.value = await TechnologyService.fetchAll()
  } catch {
    console.warn("Impossible de pré-charger la liste des langages.")
  }

  loading.value = true
  try {
    if (route.params['id']) {
      isEditMode.value = true
      techId.value = route.params['id'] as string

      const flatFormBean = await TechnologyService.fetchById(techId.value)
      formBean.value = flatFormBean

      selectedLanguageDropdown.value = flatFormBean.language
      isCustomLanguage.value = false

      if (flatFormBean.logo) {
        previewUrl.value = `http://localhost:4000${flatFormBean.logo}`
      }
    } else {
      isEditMode.value = false
      const initialFormBean = await TechnologyService.fetchInitialForm()
      formBean.value = initialFormBean
    }
  } catch {
    errorMsg.value = "Impossible d'initialiser le formulaire."
  } finally {
    loading.value = false
  }
})
</script>

<template>

  <header class="main-header">
    <div>
      <h1 class="header-title">
        {{ isEditMode ? `Édition : ${formBean?.name}` : 'Ajouter une Technologie' }}
      </h1>
      <p class="header-sub">Formulaire d'écriture d'arcade sémantique</p>
    </div>
  </header>

  <div v-if="loading && !formBean" class="loading-text">
    Initialisation du formulaire...
  </div>

  <div v-else-if="errorMsg" class="error-box">
    {{ errorMsg }}
  </div>

  <!-- Le formulaire ne s'affiche qu'une fois le FormBean initialisé par l'API 🚀 -->
  <form v-else-if="formBean" @submit.prevent="handleSave" class="form-page-container">

    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Nom du Framework / Outil</label>
        <input v-model="formBean.name" type="text" required class="form-input" placeholder="Ex: Svelte"/>
      </div>

      <div class="form-group">
        <label class="form-label">Langage principal</label>
        <div v-if="!isCustomLanguage" class="flex gap-2">
          <select v-model="selectedLanguageDropdown" @change="handleLanguageSelect" required class="form-select flex-1">
            <option value="" disabled>-- Sélectionner un langage --</option>
            <option value="__NEW__" class="text-blue-600 font-extrabold">+ Ajouter un autre langage...</option>
            <option v-for="lang in uniqueLanguages" :key="lang" :value="lang">
              {{ lang }}
            </option>
          </select>
        </div>

        <div class="flex gap-2" v-else>
          <input v-model="formBean.language" type="text" required class="form-input flex-1"
                 placeholder="Écrivez le nom..."/>
          <button type="button" @click="cancelCustomLanguage" class="cancel-btn"
                  style="margin: 0; padding: 0.625rem 1rem;">
            Annuler
          </button>
        </div>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-group col-span-2">
        <label class="form-label">Catégories techniques associées (Multi-choix)</label>
        <div class="flex flex-wrap gap-2.5 mt-2">
          <label
              v-for="cat in ['FRONTEND', 'BACKEND', 'DATABASE', 'MOBILE', 'DESKTOP']"
              :key="cat"
              class="flex items-center gap-2 px-3 py-2 bg-[#f0f0f1] border border-[#c3c4c7] hover:bg-[#e0e0e0] rounded text-xs font-semibold text-[#1d2327] cursor-pointer select-none transition-colors duration-150"
          >
            <input type="checkbox" :value="cat" v-model="formBean.categories"
                   class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"/>
            <span>{{ cat }}</span>
          </label>
        </div>
      </div>

      <div class="form-group col-span-2">
        <label class="form-label">Usage résumé (Utilisation)</label>
        <input v-model="formBean.usage" type="text" required class="form-input" placeholder="Ex: Frontend Web"/>
      </div>
    </div>

    <div class="form-group col-span-2">
      <label class="form-label">Description d'introduction</label>
      <textarea v-model="formBean.description" required class="form-textarea"
                placeholder="Entrez une courte explication..."></textarea>
    </div>

    <!-- 2. INTÉGRATION DE NOTRE NOUVELLE BOÎTE DE PARAGRAPHES DRAG & DROP UNIFIÉE 🚀 -->
    <div class="form-group col-span-2">
      <ParagraphManager v-model="formBean.history"/>
    </div>

    <!-- 3. LES NOUVEAUX CHAMPS DU CAHIER DES CHARGES (OPTIONNELS) 🚀 -->
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Site Web officiel</label>
        <input v-model="formBean.websiteUrl" type="url" class="form-input" placeholder="Ex: https://svelte.dev"/>
      </div>
      <div class="form-group">
        <label class="form-label">Lien vers la Documentation</label>
        <input v-model="formBean.docsUrl" type="url" class="form-input" placeholder="Ex: https://svelte.dev/docs"/>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Créateur / Auteur</label>
        <input v-model="formBean.creator" type="text" class="form-input" placeholder="Ex: Rich Harris"/>
      </div>
      <div class="form-group">
        <label class="form-label">Année de création</label>
        <input v-model="formBean.foundedAt" type="text" class="form-input" placeholder="Ex: 2016"/>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Nombre d'utilisateurs (Étoiles GitHub/GitLab)</label>
        <input v-model.number="formBean.userCount" type="number" class="form-input" placeholder="Ex: 75000"/>
      </div>
      <div class="form-group">
        <label class="form-label">Nombre de projets recensés</label>
        <input v-model.number="formBean.projectCount" type="number" class="form-input" placeholder="Ex: 120000"/>
      </div>
    </div>

    <!-- ZONE DE LOGO / ILLUSTRATION -->
    <div class="form-group col-span-2">
      <label class="form-label">Logo / Illustration</label>
      <div class="file-upload-zone">
        <div class="current-logo-preview">
          <img v-if="previewUrl" :src="previewUrl"/>
          <span v-else class="text-slate-400 font-bold">?</span>
        </div>
        <input type="file" accept="image/*" @change="handleFileChange" class="file-input"/>
      </div>
    </div>

    <div class="form-actions">
      <router-link to="/dashboard" class="cancel-btn">Annuler</router-link>
      <button type="submit" class="save-btn">
        {{ isEditMode ? 'Enregistrer les modifications' : 'Créer la technologie' }}
      </button>
    </div>

  </form>

</template>