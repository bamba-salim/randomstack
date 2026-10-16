<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {fetchInboxMessage, updateInboxStatus} from '#services'
import {
  INBOX_KIND,
  INBOX_KIND_LABELS,
  INBOX_STATUS_LABELS,
  type InboxMessageListed,
  type InboxStatus
} from '@randomstack/commons'
import {toast} from '../../lib/toast'

const route = useRoute()
const router = useRouter()

const message = ref<InboxMessageListed | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const busy = ref(false)

const load = async (id: string) => {
  loading.value = true
  error.value = null
  try {
    message.value = await fetchInboxMessage(id)
  } catch {
    message.value = null
    error.value = 'Message introuvable ou accès refusé.'
  } finally {
    loading.value = false
  }
}

const setStatus = async (status: InboxStatus) => {
  if (!message.value || busy.value) return
  busy.value = true
  try {
    const res = await updateInboxStatus(message.value.id, status)
    if (res.message) message.value = res.message
    toast.success(status === 'OPEN' ? 'Message marqué non lu.' : 'Statut mis à jour.')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Mise à jour impossible.')
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  const id = route.params['id'] as string
  if (id) load(id)
})

watch(() => route.params['id'], (id) => {
  if (id) load(id as string)
})
</script>

<template>
  <div v-if="loading" class="loading-text">Chargement du message…</div>
  <div v-else-if="error" class="error-box">{{ error }}</div>

  <template v-else-if="message">
    <header class="main-header !mb-4 !items-start">
      <div class="min-w-0 flex-1">
        <button
            type="button"
            class="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-[#2271b1] mb-1 bg-transparent border-0 p-0 cursor-pointer"
            @click="router.push('/inbox')"
        >
          ← Inbox
        </button>
        <h1 class="header-title truncate">{{ message.subject }}</h1>
        <p class="header-sub">
          {{ INBOX_KIND_LABELS[message.kind] }}
          · {{ message.author.displayName }}
          · {{ new Date(message.createdAt).toLocaleString('fr-FR') }}
          · {{ INBOX_STATUS_LABELS[message.status] }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2 shrink-0 justify-end">
        <button
            v-if="message.status !== 'OPEN'"
            type="button"
            class="px-3 py-2 bg-white border border-[#c3c4c7] text-xs font-bold hover:border-cyan-500"
            :disabled="busy"
            @click="setStatus('OPEN')"
        >
          Non lu
        </button>
        <button
            v-if="message.status !== 'IN_PROGRESS'"
            type="button"
            class="px-3 py-2 bg-white border border-[#c3c4c7] text-xs font-bold hover:border-[#2271b1]"
            :disabled="busy"
            @click="setStatus('IN_PROGRESS')"
        >
          En cours
        </button>
        <button
            v-if="message.status !== 'RESOLVED'"
            type="button"
            class="px-3 py-2 bg-white border border-[#c3c4c7] text-xs font-bold hover:border-emerald-600"
            :disabled="busy"
            @click="setStatus('RESOLVED')"
        >
          Traité
        </button>
        <button
            v-if="message.status !== 'DISMISSED'"
            type="button"
            class="px-3 py-2 bg-white border border-[#c3c4c7] text-xs font-bold hover:border-rose-500"
            :disabled="busy"
            @click="setStatus('DISMISSED')"
        >
          Rejeter
        </button>
      </div>
    </header>

    <div v-if="message.technologyId || message.postId" class="mb-4">
      <router-link
          v-if="message.kind === INBOX_KIND.TECH_REPORT && message.technologyId"
          :to="`/edit-technology/${message.technologyId}`"
          class="text-xs font-bold text-[#2271b1] hover:underline"
      >
        → Éditer la technologie
      </router-link>
      <router-link
          v-else-if="message.kind === INBOX_KIND.POST_REPORT && message.postId"
          :to="`/edit-post/${message.postId}`"
          class="text-xs font-bold text-[#2271b1] hover:underline"
      >
        → Éditer l’article
      </router-link>
    </div>

    <article class="max-w-3xl">
      <p class="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed m-0">
        {{ message.body }}
      </p>
      <p class="text-[11px] text-slate-400 mt-4 mb-0">
        {{ message.author.email }}
      </p>
    </article>
  </template>
</template>
