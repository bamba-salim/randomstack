<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'

import {Sidebar, ParagraphManager, BaseInput, BaseToggle} from '#components'

import {saveTechnology, fetchTechnologies, fetchTechnologyFormData, uploadFile, fileUrl, ApiError} from '#services'
import {TechnologyFilter, validateSaveTechnology, FILE_TYPE, TABLE} from '@randomstack/commons'
import {toast} from '../../lib/toast'

import type {AdminTechnologyListed, EditTechnologyFormBean} from '@randomstack/commons'

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const techId = ref<string | undefined>(undefined)

const loading = ref(false)
const loadError = ref<string | null>(null)

const formBean = ref<EditTechnologyFormBean | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const allTechnologies = ref<AdminTechnologyListed[]>([])
const selectedLanguageDropdown = ref('')
const isCustomLanguage = ref(false)

const clearFieldError = (key: string) => {
  if (!fieldErrors.value[key]) return
  const next = {...fieldErrors.value}
  delete next[key]
  fieldErrors.value = next
}

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

// Upload instantané du logo (comme la couverture des posts)
const handleLogoUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !formBean.value) return

  try {
    loading.value = true
    const {idFile} = await uploadFile(file, FILE_TYPE.IMAGE, TABLE.TECHNOLOGY)
    formBean.value.logo = idFile
  } catch {
    toast.error("Erreur lors de l'upload du logo.")
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!formBean.value || loading.value) return

  fieldErrors.value = {}
  const local = validateSaveTechnology(formBean.value)
  if (!local.ok) {
    fieldErrors.value = local.errors || (local.field ? {[local.field]: local.error} : {})
    return
  }

  loading.value = true
  try {
    await saveTechnology(local.data, techId.value)
    toast.success('Technologie enregistrée.')
    router.push('/dashboard')
  } catch (err: unknown) {
    if (err instanceof ApiError && err.errors) {
      fieldErrors.value = err.errors
      return
    }
    if (err instanceof ApiError && err.field) {
      fieldErrors.value = {[err.field]: err.message}
      return
    }
    toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.")
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    try {
      allTechnologies.value = await fetchTechnologies()
    } catch {
      console.warn("Impossible de pré-charger la liste des langages.")
    }

    const {id} = route.params
    techId.value = id as string | undefined
    isEditMode.value = Boolean(techId.value)

    const flatFormBean = await fetchTechnologyFormData(techId.value)
    formBean.value = flatFormBean

    selectedLanguageDropdown.value = flatFormBean.language || ''
    isCustomLanguage.value = false
  } catch {
    loadError.value = "Impossible d'initialiser le formulaire."
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

  <div v-else-if="loadError" class="error-box">
    {{ loadError }}
  </div>

  <!-- Le formulaire ne s'affiche qu'une fois le FormBean initialisé par l'API 🚀 -->
  <form v-else-if="formBean" @submit.prevent="handleSave" class="form-page-container">

    <div class="form-group">
      <BaseToggle v-model="formBean.isActive" label="Disponible au tirage au sort"/>
    </div>

    <div class="form-grid">
      <!-- NAME -->
      <BaseInput
          v-model="formBean.name"
          label="Nom du Framework / Outil"
          required
          placeholder="Ex: Svelte"
          :error="fieldErrors.name"
          @clear-error="clearFieldError('name')"
      />

      <!-- LANGAGE -->
      <div class="form-group">
        <label class="form-label">Langage principal</label>
        <div v-if="!isCustomLanguage" class="flex gap-2">
          <select
              v-model="selectedLanguageDropdown"
              required
              :class="['form-select', 'flex-1', {'form-input--invalid': fieldErrors.language}]"
              @change="handleLanguageSelect(); clearFieldError('language')"
          >
            <option value="" disabled>-- Sélectionner un langage --</option>
            <option value="__NEW__" class="text-blue-600 font-extrabold">+ Ajouter un autre langage...</option>
            <option v-for="lang in uniqueLanguages" :key="lang" :value="lang">
              {{ lang }}
            </option>
          </select>
        </div>

        <div class="flex gap-2" v-else>
          <input
              v-model="formBean.language"
              type="text"
              required
              :class="['form-input', 'flex-1', {'form-input--invalid': fieldErrors.language}]"
              placeholder="Écrivez le nom..."
              @input="clearFieldError('language')"
          />
          <button type="button" @click="cancelCustomLanguage" class="cancel-btn"
                  style="margin: 0; padding: 0.625rem 1rem;">
            Annuler
          </button>
        </div>
        <p v-if="fieldErrors.language" class="form-field-error">{{ fieldErrors.language }}</p>
      </div>
    </div>

    <div class="form-grid">
      <!-- CATEGORIES -->
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
                v-model="formBean.categories"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                @change="clearFieldError('categories')"
            />
            <span>{{ cat }}</span>
          </label>
        </div>
        <p v-if="fieldErrors.categories" class="form-field-error">{{ fieldErrors.categories }}</p>
      </div>

      <!-- USAGE -->
      <BaseInput
          v-model="formBean.usage"
          label="Utilisation"
          required
          placeholder="Ex: Frontend Web"
          className="col-span-2"
          :error="fieldErrors.usage"
          @clear-error="clearFieldError('usage')"
      />
    </div>

    <!-- DESCRIPTION -->
    <div class="form-group col-span-2">
      <label class="form-label">Description d'introduction</label>
      <textarea
          v-model="formBean.description"
          required
          :class="['form-textarea', {'form-input--invalid': fieldErrors.description}]"
          placeholder="Entrez une courte explication..."
          @input="clearFieldError('description')"
      ></textarea>
      <p v-if="fieldErrors.description" class="form-field-error">{{ fieldErrors.description }}</p>
    </div>

    <!-- HISTORY -->
    <div class="form-group col-span-2">
      <ParagraphManager v-model="formBean.history"/>
    </div>

    <!-- 3. LES NOUVEAUX CHAMPS DU CAHIER DES CHARGES (OPTIONNELS) 🚀 -->
    <div class="form-grid">
      <!-- WEBSITE -->
      <BaseInput
          v-model="formBean.websiteUrl"
          label="Site Web officiel"
          type="url"
          placeholder="Ex: https://svelte.dev"
          :error="fieldErrors.websiteUrl"
          @clear-error="clearFieldError('websiteUrl')"
      />

      <!-- DOCUMENTATION -->
      <BaseInput
          v-model="formBean.docsUrl"
          label="Lien vers la Documentation"
          type="url"
          placeholder="Ex: https://svelte.dev/docs"
          :error="fieldErrors.docsUrl"
          @clear-error="clearFieldError('docsUrl')"
      />

    </div>

    <div class="form-grid">

      <!-- CREATOR -->
      <BaseInput
          v-model="formBean.creator"
          label="Créateur / Auteur"
          placeholder="Ex: Rich Harris"
          :error="fieldErrors.creator"
          @clear-error="clearFieldError('creator')"
      />

      <!-- YEAR -->
      <BaseInput
          v-model="formBean.foundedAt"
          label="Année de création"
          placeholder="Ex: 2016"
          :error="fieldErrors.foundedAt"
          @clear-error="clearFieldError('foundedAt')"
      />

    </div>

    <div class="form-grid">
      <!-- USERS COUNT -->
      <BaseInput
          v-model.number="formBean.userCount"
          type="number"
          label="Nombre d'utilisateurs (Étoiles GitHub/GitLab)"
          placeholder="Ex: 75000"
          :error="fieldErrors.userCount"
          @clear-error="clearFieldError('userCount')"
      />

      <!-- PROJECT COUNT -->
      <BaseInput
          v-model.number="formBean.projectCount"
          type="number"
          label="Nombre de projets recensés"
          placeholder="Ex: 120000"
          :error="fieldErrors.projectCount"
          @clear-error="clearFieldError('projectCount')"
      />

    </div>

    <div class="form-grid">
      <BaseInput v-model="formBean.versions.stable.num" label="Version Stable (Numéro)" placeholder="Ex: v4.0.0"/>
      <BaseInput v-model="formBean.versions.stable.date" label="Date de sortie (Stable)" placeholder="Ex: 15/01/2026"/>
    </div>

    <div class="form-grid">
      <BaseInput v-model="formBean.versions.latest.num" label="Dernière Version (Numéro)" placeholder="Ex: v4.1.2"/>
      <BaseInput v-model="formBean.versions.latest.date" label="Date de sortie (Dernière)"
                 placeholder="Ex: 01/02/2026"/>
    </div>

    <!-- ZONE DE LOGO / ILLUSTRATION -->
    <div class="form-group col-span-2">
      <label class="form-label">Logo / Illustration</label>
      <div class="file-upload-zone">
        <img
            v-if="formBean.logo"
            :src="fileUrl(formBean.logo)"
            class="w-full max-h-64 object-contain mb-3 bg-white border border-[#c3c4c7] rounded shadow-sm"
            loading="lazy"
        />
        <span v-else class="text-xs text-slate-500 font-bold mb-2 block">Sélectionnez un logo :</span>
        <input type="file" accept="image/*" @change="handleLogoUpload" class="file-input w-full"/>
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