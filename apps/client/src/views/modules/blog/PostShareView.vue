<script setup lang="ts">
import {onMounted, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {resolvePostShareCode} from '#services'

const route = useRoute()
const router = useRouter()

const redirect = async (shareCode: string) => {
  try {
    const resolved = await resolvePostShareCode(shareCode)
    const tag = resolved.mainTag || 'post'
    await router.replace(`/${tag}/${resolved.slug}`)
  } catch {
    await router.replace({name: 'not-found'})
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
    <div class="loading-state">Redirection vers l’article…</div>
  </main>
</template>
