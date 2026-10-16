<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {fetchPostPreview, fileUrl, ApiError} from '#services'
import {Breadcrumbs} from '#components'
import type {PublicPostDetail} from '@randomstack/commons'
import BlockRenderer from './components/BlockRenderer.vue'

const route = useRoute()
const router = useRouter()
const post = ref<PublicPostDetail | null>(null)
const loading = ref(true)

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const load = async (shareCode: string) => {
  loading.value = true
  post.value = null
  try {
    post.value = await fetchPostPreview(shareCode)
  } catch (err) {
    const status = err instanceof ApiError ? err.status : undefined
    await router.replace({name: status === 403 || status === 401 ? 'forbidden' : 'not-found'})
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const code = route.params['shareCode'] as string
  if (code) void load(code)
})

watch(() => route.params['shareCode'], (code) => {
  if (code) void load(code as string)
})
</script>

<template>
  <main class="container-catalog py-8">
    <div v-if="loading" class="loading-state">Chargement de la prévisualisation…</div>

    <article v-else-if="post" class="article-column max-w-3xl mx-auto">
      <Breadcrumbs :items="[
        { label: 'Blog', to: '/' },
        { label: 'Prévisualisation' },
        { label: post.title }
      ]"/>

      <header class="page-header page-header--flush mt-4">
        <div class="page-header__row">
          <h1 class="page-title">{{ post.title }}</h1>
          <span class="badge badge--primary">Prévisualisation</span>
        </div>
        <div class="page-meta">
          <span v-if="post.publishAt">{{ formatDate(post.publishAt) }}</span>
          <span class="uppercase tracking-wider">{{ post.mainTag || 'sans-tag' }}</span>
        </div>
      </header>

      <p v-if="post.summary" class="article-summary">{{ post.summary }}</p>

      <figure v-if="post.imageId" class="w-full bg-[#f6f8fa] border border-[#c3c4c7] overflow-hidden mb-8">
        <img :src="fileUrl(post.imageId)" :alt="post.title" class="w-full h-auto max-h-[480px] object-cover" fetchpriority="high"/>
      </figure>

      <div class="post-content-body flex flex-col gap-6 w-full text-left">
        <BlockRenderer v-for="(block, index) in post.content" :key="index" :block="block"/>
      </div>

      <div v-if="post.tags?.length" class="flex flex-wrap gap-2 mt-8">
        <span v-for="tag in post.tags" :key="tag" class="badge badge--neutral">#{{ tag }}</span>
      </div>

      <section v-if="post.sources?.length" class="mt-8 pt-6 border-t border-[#c3c4c7]">
        <h2 class="text-sm font-extrabold uppercase tracking-widest text-slate-500 mb-3">Sources</h2>
        <ul class="list-disc pl-5 text-sm text-slate-600 space-y-1">
          <li v-for="source in post.sources" :key="source">
            <a
                v-if="/^https?:\/\//i.test(source)"
                :href="source"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[#2271b1] hover:underline"
            >{{ source }}</a>
            <span v-else>{{ source }}</span>
          </li>
        </ul>
      </section>
    </article>
  </main>
</template>
