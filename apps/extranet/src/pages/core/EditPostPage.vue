<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {PostService} from '#services'
import {Sidebar, PostContentManager, BaseInput} from '#components'
import {FormDataUtils, type EditPostFormBean} from '@randomstack/commons'

const route = useRoute()
const router = useRouter()
const isEditMode = ref(false)
const postId = ref<string | undefined>(undefined)
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const formBean = ref<SavePostInput | null>(null)
const previewUrl = ref<string | null>(null)

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file && formBean.value) {
    formBean.value.image = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const handleSave = async (status: string) => {
  if (!formBean.value || loading.value) return
  formBean.value.status = status as any

  const formData = FormDataUtils.toFormData(formBean.value)
  // Ajout explicite du fichier image s'il existe
  if (formBean.value.image) formData.append('image', formBean.value.image)

  await PostService.save(formData, postId.value)
  router.push('/posts')
}

onMounted(async () => {
  loading.value = true
  try {
    const id = route.params['id'] as string

    formBean.value = await PostService.fetchPostFormData(id)
  } catch {
    errorMsg.value = "Erreur de chargement."
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <header class="main-header">
    <div>
      <h1 class="header-title">{{ isEditMode ? 'Édition article' : 'Nouvel article' }}</h1>
    </div>
  </header>

  <form v-if="formBean" @submit.prevent class="form-page-container">
    <BaseInput v-model="formBean.title" label="Titre" required/>

    <div class="form-group col-span-2">
      <label class="form-label">Résumé court</label>
      <textarea v-model="formBean.summary" required class="form-textarea" placeholder="Ecrivez un court résumé..."></textarea>
    </div>

    <PostContentManager v-model="formBean.content"/>

    <div class="form-group">
      <label class="form-label">Illustration principale</label>
      <input type="file" @change="handleFileChange" class="file-input"/>
      <img v-if="previewUrl" :src="previewUrl" class="w-32 mt-2"/>
    </div>

    <div class="form-actions">
      <button type="button" @click="handleSave('DRAFT')" class="cancel-btn">Brouillon</button>
      <button type="button" @click="handleSave('PUBLISHED')" class="save-btn">Publier</button>
    </div>
  </form>
</template>