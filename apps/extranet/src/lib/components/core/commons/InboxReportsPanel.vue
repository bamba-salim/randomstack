<script setup lang="ts">
import {ref, watch} from 'vue'
import {fetchInboxTargetReports, updateInboxStatus} from '#services'
import type {InboxMessageListed, InboxStatus} from '@randomstack/commons'
import {toast} from '../../../toast'

const props = defineProps<{
  technologyId?: string
  postId?: string
}>()

const reports = ref<InboxMessageListed[]>([])
const loading = ref(false)
const busyId = ref<string | null>(null)

const load = async () => {
  if (!props.technologyId && !props.postId) {
    reports.value = []
    return
  }
  loading.value = true
  try {
    reports.value = await fetchInboxTargetReports({
      technologyId: props.technologyId,
      postId: props.postId
    })
  } catch {
    reports.value = []
  } finally {
    loading.value = false
  }
}

const resolve = async (id: string, status: Extract<InboxStatus, 'RESOLVED' | 'DISMISSED'>) => {
  busyId.value = id
  try {
    await updateInboxStatus(id, status)
    reports.value = reports.value.filter(r => r.id !== id)
    toast.success(status === 'RESOLVED' ? 'Signalement traité.' : 'Signalement rejeté.')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Action impossible.')
  } finally {
    busyId.value = null
  }
}

watch(
  () => [props.technologyId, props.postId] as const,
  () => {
    load()
  },
  {immediate: true}
)
</script>

<template>
  <div
      v-if="loading || reports.length"
      class="border border-[#c3c4c7] bg-[#f6f8fa] p-4 mb-6"
  >
    <h2 class="text-[10px] font-black uppercase tracking-wider text-slate-500 m-0 mb-3">
      Signalements
      <span v-if="reports.length" class="text-cyan-700">({{ reports.length }})</span>
    </h2>

    <p v-if="loading" class="text-xs text-slate-400 m-0">Chargement…</p>

    <ul v-else class="flex flex-col gap-3 list-none p-0 m-0">
      <li
          v-for="msg in reports"
          :key="msg.id"
          class="bg-white border border-[#c3c4c7] p-3"
      >
        <p class="text-sm text-slate-700 whitespace-pre-wrap m-0 mb-3 leading-relaxed">
          {{ msg.body }}
        </p>
        <div class="flex flex-wrap gap-2">
          <button
              type="button"
              class="px-2.5 py-1.5 bg-white border border-[#c3c4c7] text-[10px] font-bold uppercase hover:border-emerald-600"
              :disabled="busyId === msg.id"
              @click="resolve(msg.id, 'RESOLVED')"
          >
            Traité
          </button>
          <button
              type="button"
              class="px-2.5 py-1.5 bg-white border border-[#c3c4c7] text-[10px] font-bold uppercase hover:border-rose-500"
              :disabled="busyId === msg.id"
              @click="resolve(msg.id, 'DISMISSED')"
          >
            Rejeté
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
