<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TechnologyService } from '#services'
import { Sidebar } from '#components'
import { FormDataUtils, TechnologyFilter, type Technology, type Category } from '@randomstack/commons'

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const techId = ref<string | undefined>(undefined)

const loading = ref(false)
const errorMsg = ref<string | null>(null)

// Variables de formulaire
const formName = ref('')
const formLanguage = ref('') // Cette variable contiendra TOUJOURS la valeur finale envoyée à l'API 🚀
const formCategories = ref<Category[]>(['FRONTEND'])
const formUsage = ref('')
const formDescription = ref('')
const formFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

// --- GESTION DE LA LISTE DÉROULANTE INTERACTIVE DES LANGAGES 🚀 ---
const allTechnologies = ref<Technology[]>([])
const selectedLanguageDropdown = ref('') // Stocke la valeur choisie dans le select
const isCustomLanguage = ref(false)       // Détermine s'il faut afficher l'input text libre

// Extraction dynamique des langages uniques de la BDD
const uniqueLanguages = computed(() => {
  return TechnologyFilter.getUniqueLanguages(allTechnologies.value)
})

// Détecte le choix de l'utilisateur dans la liste déroulante 🚀
const handleLanguageSelect = () => {
  if (selectedLanguageDropdown.value === '__NEW__') {
    isCustomLanguage.value = true
    formLanguage.value = '' // On vide pour laisser l'utilisateur taper son nouveau langage
  } else {
    formLanguage.value = selectedLanguageDropdown.value
  }
}

// Annuler la saisie libre et revenir à la liste déroulante 🚀
const cancelCustomLanguage = () => {
  isCustomLanguage.value = false
  // On se repositionne sur le premier langage disponible ou sur vide
  selectedLanguageDropdown.value = uniqueLanguages.value[0] || ''
  formLanguage.value = selectedLanguageDropdown.value
}

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    const file = files[0]!
    formFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const handleSave = async () => {
  if (loading.value) return
  errorMsg.value = null
  loading.value = true

  try {
    const payload = {
      name: formName.value,
      language: formLanguage.value, // Envoie la valeur finale (issue de la liste ou de la saisie libre) 🚀
      categories: formCategories.value,
      usage: formUsage.value,
      description: formDescription.value,
      logo: formFile.value
    }

    const formData = FormDataUtils.toFormData(payload)
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
    console.warn("Impossible de charger la liste d'auto-complétion des langages.")
  }

  if (route.params['id']) {
    isEditMode.value = true
    techId.value = route.params['id'] as string

    loading.value = true
    try {
      const tech = await TechnologyService.fetchById(techId.value)
      formName.value = tech.name

      // On affecte la valeur chargée aux deux variables de contrôle 🚀
      formLanguage.value = tech.language
      selectedLanguageDropdown.value = tech.language
      isCustomLanguage.value = false

      formCategories.value = Array.isArray(tech.categories) ? tech.categories : []
      formUsage.value = tech.usage
      formDescription.value = tech.description
      if (tech.logo) {
        previewUrl.value = `http://localhost:4000${tech.logo}`
      }
    } catch {
      errorMsg.value = "Impossible de charger la technologie."
    } finally {
      loading.value = false
    }
  }
})
</script>

<template>
  <header class="main-header">
    <div>
      <h1 class="header-title">
        {{ isEditMode ? `Édition : ${formName}` : 'Ajouter une Technologie' }}
      </h1>
      <p class="header-sub">Formulaire d'écriture d'arcade sémantique</p>
    </div>
  </header>

  <div v-if="loading && isEditMode" class="loading-text">
    Chargement de la technologie...
  </div>

  <div v-else-if="errorMsg" class="error-box">
    {{ errorMsg }}
  </div>

  <form v-else @submit.prevent="handleSave" class="form-page-container">

    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Nom du Framework / Outil</label>
        <input v-model="formName" type="text" required class="form-input" placeholder="Ex: Svelte"/>
      </div>
      <div class="form-group">
        <label class="form-label">Langage principal</label>

        <!-- CAS A : Liste déroulante classique avec tous les langages préchargés -->
        <div v-if="!isCustomLanguage" class="flex gap-2">
          <select
              v-model="selectedLanguageDropdown"
              @change="handleLanguageSelect"
              required
              class="form-select flex-1"
          >
            <option value="" disabled>-- Sélectionner un langage --</option>

            <!-- L'option de création libre est déplacée tout en haut de la liste 🚀 -->
            <option value="__NEW__" class="text-blue-600 font-extrabold">+ Ajouter un autre langage...</option>

            <!-- Boucle sur les langages existants juste en dessous 🚀 -->
            <option v-for="lang in uniqueLanguages" :key="lang" :value="lang">
              {{ lang }}
            </option>
          </select>
        </div>

        <!-- CAS B : Champ de saisie libre s'activant si l'utilisateur choisit d'ajouter un nouveau langage -->
        <div v-else class="flex gap-2">
          <input
              v-model="formLanguage"
              type="text"
              required
              class="form-input flex-1"
              placeholder="Écrivez le nom du nouveau langage..."
          />
          <button
              type="button"
              @click="cancelCustomLanguage"
              class="cancel-btn"
              style="margin: 0; padding: 0.625rem 1rem;"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>

    <div class="form-grid">
      <!-- Remplacement du Select par des Checkboxes Multi-sélection sémantiques 🚀 -->
      <div class="form-group col-span-2">
        <label class="form-label">Catégories techniques associées (Multi-choix)</label>
        <div class="flex flex-wrap gap-2.5 mt-2">
          <label
              v-for="cat in ['FRONTEND', 'BACKEND', 'DATABASE', 'MOBILE', 'DESKTOP']"
              :key="cat"
              class="flex items-center gap-2 px-3 py-2 bg-[#f0f0f1] border border-[#c3c4c7] hover:bg-[#e0e0e0] rounded text-xs font-semibold text-[#1d2327] cursor-pointer select-none transition-colors duration-150"
          >
            <input
                type="checkbox"
                :value="cat"
                v-model="formCategories"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"

            />
            <span>{{ cat }}</span>
          </label>
        </div>
      </div>

      <div class="form-group col-span-2">
        <label class="form-label">Usage résumé (Utilisation)</label>
        <input v-model="formUsage" type="text" required class="form-input" placeholder="Ex: Frontend Web"/>
      </div>
    </div>

    <div class="form-group col-span-2">
      <label class="form-label">Description d'introduction</label>
      <textarea v-model="formDescription" required class="form-textarea"
                placeholder="Entrez une courte explication..."></textarea>
    </div>

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