<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {PostService, FileService} from '#services' // <-- IMPORT FileService 🚀
import {Sidebar, PostContentManager, BaseInput, BaseToggle} from '#components'
import type {EditPostFormBean} from '@randomstack/commons'

const route = useRoute()
const router = useRouter()
const isEditMode = ref(false)
const postId = ref<string | undefined>(undefined)
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const formBean = ref<EditPostFormBean | null>(null)
const previewUrl = ref<string | null>(null)
const imageAltText = ref<string | null>(null)

// --- UPLOAD INSTANTANÉ DE LA COUVERTURE 🚀 ---
const handleCoverUpload = async (e: Event) => {

  const file = (e.target as HTMLInputElement).files?.[0]

  if (!file || !formBean.value) return


  try {

    loading.value = true

    // On appelle l'upload générique (qui renvoie { id, url })
    const {idFile} = await FileService.uploadFile(file, 'IMAGE', 'POST')

    // On affecte directement l'ID à notre FormBean ! 🚀
    formBean.value.imageId = idFile

  } catch (err) {
    alert("Erreur lors de l'upload de l'image de couverture.")
  } finally {
    loading.value = false
  }
}

// --- SAUVEGARDE 100% JSON (Plus de FormData !) 🚀 ---
const handleSave = async (status: string) => {
  if (!formBean.value || loading.value) return
  formBean.value.status = status as any
  loading.value = true

  try {
    // FINI LE FORMDATA : On envoie directement le JSON pur 🚀
    await PostService.save(formBean.value, postId.value)
    router.push('/manage-post')
  } catch (err: any) {
    errorMsg.value = err.message || "Erreur d'enregistrement de l'article."
  } finally {
    loading.value = false
  }
}

// --- GESTION DES TAGS (MOTS-CLÉS) 🚀 ---
const currentTag = ref('')
const availableTags = ref<string[]>([]) // Stockera les suggestions de la BDD

// Fonction d'ajout d'un tag au tableau
const addTag = (value: string) => {
  const cleanTag = value.trim().toLowerCase() // On normalise le tag (minuscules, sans espaces inutiles)
  if (cleanTag && formBean.value && !formBean.value.tags.includes(cleanTag)) {
    formBean.value.tags.push(cleanTag)
  }
  currentTag.value = '' // On vide l'input
}

// Intercepte la frappe pour détecter la virgule ou un copier-coller avec virgules 🚀
const handleTagInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  if (val.includes(',')) {
    // Si l'utilisateur tape une virgule ou colle "tag1, tag2", on sépare et on ajoute !
    const newTags = val.split(',')
    newTags.forEach(t => addTag(t))
  }
}

// Intercepte la touche "Entrée" pour ajouter le tag sans soumettre le formulaire complet 🚀
const handleTagEnter = (e: KeyboardEvent) => {
  e.preventDefault()
  addTag(currentTag.value)
}

// Supprime un badge au clic sur la croix ❌
const removeTag = (index: number) => {
  if (formBean.value) {
    formBean.value.tags.splice(index, 1)
  }
}
// --- FIN GESTION DES TAGS ---


onMounted(async () => {
  loading.value = true
  try {

    try {
      availableTags.value = await PostService.fetchTags()
    } catch {
      console.warn("Impossible de charger les suggestions de tags.")
    }

    const {id} = route.params
    postId.value = id as string | undefined

    formBean.value = await PostService.fetchPostFormData(postId.value)

  } catch {
    errorMsg.value = "Erreur de chargement."
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="admin-main">
    <header class="main-header">
      <div>
        <h1 class="header-title">{{ isEditMode ? 'Édition article' : 'Nouvel article' }}</h1>
      </div>
    </header>

    <div v-if="loading && !formBean" class="text-sm text-blue-500 animate-pulse">
      Chargement...
    </div>

    <form v-else-if="formBean" @submit.prevent class="form-page-container">
      <div class="form-group mb-2">
        <BaseToggle v-model="formBean.isFeatured" label="🌟 Épingler cet article à la une" />
      </div>
        <BaseInput v-model="formBean.title" label="Titre" required />
      <div class="form-group col-span-2 flex ">
        <label class="form-label">Résumé court</label>
        <textarea
            v-model="formBean.summary"
            required
            class="form-textarea"
            placeholder="Ecrivez un court résumé..."
        ></textarea>
      </div>

      <div class="form-group col-span-2">
        <label class="form-label">Illustration principale (Optionnelle)</label>

        <!-- Structure flex-col identique au bloc IMAGE 🚀 -->
        <div class="file-upload-zone">
          <img
              v-if="formBean.imageId"
              :src="`http://localhost:4000/api/files/${formBean.imageId}`"
              class="w-full max-h-64 object-contain mb-3 bg-white border border-[#c3c4c7] rounded shadow-sm"
          />
          <span v-else class="text-xs text-slate-500 font-bold mb-2 block">Sélectionnez une image de couverture :</span>

          <input
              type="file"
              accept="image/*"
              @change="handleCoverUpload"
              class="file-input w-full"
          />
        </div>
      </div>


      <!-- Constructeur de Blocs -->

      <PostContentManager v-model="formBean.content"/>

      <!-- SYSTÈME DE TAGS AVEC AUTOCOMPLÉTION ET BADGES 🚀 -->
      <div class="form-group col-span-2 border border-[#c3c4c7] p-4 bg-[#f6f8fa] rounded-none">
        <label class="form-label">Mots-clés (Tags)</label>
        <p class="text-[10px] text-slate-500 mb-2">Séparez les tags par une virgule ou appuyez sur Entrée.</p>

        <div class="flex gap-2 mb-3">
          <input
              v-model="currentTag"
              @input="handleTagInput"
              @keydown.enter="handleTagEnter"
              list="suggested-tags"
              type="text"
              class="form-input flex-1"
              placeholder="Ex: javascript, tutoriel, news..."
          />
          <button type="button" @click="addTag(currentTag)"
                  class="px-4 py-2 bg-white border border-[#c3c4c7] hover:bg-[#e0e0e0] text-xs font-bold text-slate-600 rounded transition-colors duration-150">
            Ajouter
          </button>
        </div>

        <!-- Datalist native pour les suggestions de tags existants en BDD 🚀 -->
        <datalist id="suggested-tags">
          <option v-for="tag in availableTags" :key="tag" :value="tag"></option>
        </datalist>

        <!-- Zone d'affichage des badges de tags sélectionnés -->
        <div v-if="formBean.tags.length > 0" class="flex flex-wrap gap-2 pt-2 border-t border-[#c3c4c7]/40">
            <span
                v-for="(tag, index) in formBean.tags"
                :key="index"
                class="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#c3c4c7] rounded-full text-[10px] font-black text-slate-600 uppercase shadow-sm"
            >
              #{{ tag }}
              <button type="button" @click="removeTag(index)"
                      class="text-slate-400 hover:text-red-500 cursor-pointer font-bold text-xs ml-1 focus:outline-none">
                ✕
              </button>
            </span>
        </div>
        <div v-else class="text-xs italic text-slate-400 pt-2 border-t border-[#c3c4c7]/40">
          Aucun tag sélectionné.
        </div>
      </div>


      <div class="form-actions border-t border-[#c3c4c7] pt-6 mt-4 flex gap-3">
        <button type="button" @click="handleSave('DRAFT')"
                class="py-2.5 px-4 bg-white border border-[#c3c4c7] hover:bg-[#f6f8fa] text-xs font-bold text-slate-600 rounded cursor-pointer transition-colors duration-150">
          Enregistrer le Brouillon
        </button>
        <button type="button" @click="handleSave('PUBLISHED')"
                class="py-2.5 px-5 bg-[#2271b1] hover:bg-[#135e96] border border-[#2271b1] text-xs font-bold text-white rounded cursor-pointer transition-colors duration-150 shadow-sm">
          Publier
        </button>
      </div>
    </form>
  </main>
</template>