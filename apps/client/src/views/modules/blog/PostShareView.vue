<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {resolvePostShareCode} from '#services'

const route = useRoute()
const router = useRouter()
const error = ref<string | null>(null)

const redirect = async (shareCode: string) => {
  error.value = null
  try {
    const resolved = await resolvePostShareCode(shareCode)
    const tag = resolved.mainTag || 'post'
    await router.replace(`/${tag}/${resolved.slug}`)
  } catch {
    error.value = 'Lien de partage invalide ou article introuvable.'
  }
}

onMounted(() => {
  const code = route.params['shareCode'] as string
  if (code) void redirect(code)
})

watch(() => route.params['shareCode'], (code) => {
  if (code) void redirect(code as string)
})
</script>

<template>
  <main class="container-catalog py-8">
    <div v-if="error" class="error-state">{{ error }}</div>
    <div v-else class="loading-state">Redirection vers l’article…</div>
  </main>
</template>
