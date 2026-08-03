<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TechnologyService } from '#services'
import { FormDataUtils } from '#utils'
import type { Technology } from '#interfaces'

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const techId = ref<string | undefined>(undefined)

const loading = ref(false)
const errorMsg = ref<string | null>(null)

// Variables de formulaire
const formName = ref('')
const formLanguage = ref('')
const formCategory = ref('FRONTEND')
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
      category: formCategory.value,
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
      formName.value = tech.name
      formLanguage.value = tech.language
      formCategory.value = tech.category
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
  <!-- Plus de Sidebar ou de container externe ici non plus ! Tout est hérité de AdminLayout 🚀 -->
  <div class="form-header-box">
    <h1 class="header-title">
      {{ isEditMode ? `Édition : ${formName}` : 'Ajouter une Technologie' }}
    </h1>
    <p class="header-sub">Formulaire unique d'administration sémantique</p>
  </div>

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
        <input v-model="formName" type="text" required class="form-input" placeholder="Ex: Svelte" />
      </div>
      <div class="form-group">
        <label class="form-label">Langage principal</label>
        <input v-model="formLanguage" type="text" required class="form-input" placeholder="Ex: TypeScript" />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Catégorie technique</label>
        <select v-model="formCategory" required class="form-select">
          <option value="FRONTEND">FRONTEND</option>
          <option value="BACKEND">BACKEND</option>
          <option value="DATABASE">DATABASE</option>
          <option value="MOBILE">MOBILE</option>
          <option value="DESKTOP">DESKTOP</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Usage résumé (Utilisation)</label>
        <input v-model="formUsage" type="text" required class="form-input" placeholder="Ex: Frontend Web" />
      </div>
    </div>

    <div class="form-group col-span-2">
      <label class="form-label">Description d'introduction</label>
      <textarea v-model="formDescription" required class="form-textarea" placeholder="Entrez une courte explication..."></textarea>
    </div>

    <div class="form-group col-span-2">
      <label class="form-label">Logo / Illustration</label>
      <div class="file-upload-zone">
        <div class="current-logo-preview">
          <img v-if="previewUrl" :src="previewUrl" />
          <span v-else class="text-slate-400 font-bold">?</span>
        </div>
        <input type="file" accept="image/*" @change="handleFileChange" class="file-input" />
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