<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {TechnologyService} from '#services'
import {Sidebar} from '#components'
import {FormDataUtils, type Technology, type Category} from '@randomstack/commons' // Import de type Category 🚀

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const techId = ref<string | undefined>(undefined)

const loading = ref(false)
const errorMsg = ref<string | null>(null)

// Variables de formulaire
const formName = ref('')
const formLanguage = ref('')
const formCategories = ref<Category[]>(['FRONTEND'])
const formUsage = ref('')
const formDescription = ref('')
const formFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

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
      language: formLanguage.value,
      categories: formCategories.value, // Transmet directement le tableau d'enums 🚀
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
  if (route.params['id']) {
    isEditMode.value = true
    techId.value = route.params['id'] as string

    loading.value = true
    try {
      const tech = await TechnologyService.fetchById(techId.value)
      console.log(tech)
      formName.value = tech.name
      formLanguage.value = tech.language
      formCategories.value = Array.isArray(tech.categories) ? tech.categories : []
      formUsage.value = tech.usage
      formDescription.value = tech.description
      if (tech.logo) {
        previewUrl.value = `http://localhost:4000${tech.logo}`
      }
    } catch {
      errorMsg.value = "Impossible de charger la technologie à modifier."
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
        <input v-model="formLanguage" type="text" required class="form-input" placeholder="Ex: TypeScript"/>
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