<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {PostService, FileService} from '#services' // <-- IMPORT FileService 🚀
import {Sidebar, PostContentManager, BaseInput} from '#components'
import type {EditPostFormBean} from '@randomstack/commons'

const route = useRoute()
const router = useRouter()
const isEditMode = ref(false)
const postId = ref<string | undefined>(undefined)
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const formBean = ref<EditPostFormBean | null>(null)
const previewUrl = ref<string | null>(null)

const handleCoverUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !formBean.value) return

  try {
    loading.value = true
    // On upload immédiatement l'image de couverture via le service unifié
    const {id, url} = await FileService.uploadFile(file, 'IMAGE', 'post')

    // On sauvegarde l'ID et l'URL dans le formBean (le fichier binaire disparaît !)
    formBean.value.imageId = id
    formBean.value.imageUrl = url

    // Mise à jour de l'aperçu visuel
    previewUrl.value = `http://localhost:4000${url}`
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
    router.push('/posts')
  } catch (err: any) {
    errorMsg.value = err.message || "Erreur d'enregistrement de l'article."
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const {id} = route.params
    postId.value = id as string | undefined

    formBean.value = await PostService.fetchPostFormData(postId.value)

    // S'il y a déjà une image existante, on l'affiche
    if (formBean.value.imageUrl) {
      previewUrl.value = `http://localhost:4000${formBean.value.imageUrl}`
    }
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
      <BaseInput v-model="formBean.title" label="Titre" required/>

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

        <div class="file-upload-zone">
          <!-- On utilise formBean.imageUrl retourné par le serveur pour l'aperçu -->
          <img v-if="formBean.imageId" :src="`http://localhost:4000/api/files/${formBean.imageId}`" class="image-preview w-full max-w-sm"/>

          <input type="file" accept="image/*" @change="handleCoverUpload" class="file-input w-full"/>
        </div>
      </div>


      <!-- Constructeur de Blocs -->
      <PostContentManager v-model="formBean.content"/>


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