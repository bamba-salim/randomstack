<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {fetchInboxMessages, getMe} from '#services'
import {
  INBOX_KIND_LABELS,
  INBOX_STATUS,
  INBOX_STATUS_LABELS,
  inboxKindsForRole,
  type InboxMessageListed,
  type Role
} from '@randomstack/commons'

const router = useRouter()

const messages = ref<InboxMessageListed[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const role = ref<Role | null>(null)
const filterKind = ref('')
const filterStatus = ref('')

const visibleKinds = computed(() =>
  role.value ? inboxKindsForRole(role.value) : []
)

const filtered = computed(() => {
  return messages.value.filter(m => {
    if (filterKind.value && m.kind !== filterKind.value) return false
    if (filterStatus.value && m.status !== filterStatus.value) return false
    return true
  })
})

const load = async () => {
  loading.value = true
  error.value = null
  try {
    messages.value = await fetchInboxMessages()
  } catch {
    error.value = 'Impossible de charger l’inbox.'
  } finally {
    loading.value = false
  }
}

const openMessage = (id: string) => {
  router.push(`/inbox/${id}`)
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

onMounted(async () => {
  const me = await getMe()
  role.value = me?.role ?? null
  await load()
})
</script>

<template>
  <header class="main-header">
    <div>
      <h1 class="header-title">Inbox</h1>
      <p class="header-sub">
        Signalements, suggestions et demandes — filtrés selon ton rôle.
      </p>
    </div>
  </header>

  <div v-if="loading" class="loading-text">Chargement de l’inbox…</div>
  <div v-else-if="error" class="error-box">{{ error }}</div>

  <template v-else>
    <div class="flex flex-wrap gap-3 mb-4">
      <select v-model="filterKind" class="form-input text-xs max-w-[220px]">
        <option value="">Tous les types</option>
        <option v-for="k in visibleKinds" :key="k" :value="k">
          {{ INBOX_KIND_LABELS[k] }}
        </option>
      </select>
      <select v-model="filterStatus" class="form-input text-xs max-w-[180px]">
        <option value="">Tous les statuts</option>
        <option v-for="s in Object.values(INBOX_STATUS)" :key="s" :value="s">
          {{ INBOX_STATUS_LABELS[s] }}
        </option>
      </select>
      <button type="button" class="px-3 py-2 bg-white border border-[#c3c4c7] text-xs font-bold" @click="load">
        Actualiser
      </button>
    </div>

    <p v-if="!filtered.length" class="text-xs text-slate-500 italic">Aucun message.</p>

    <ul class="flex flex-col gap-1.5 list-none p-0 m-0">
      <li v-for="msg in filtered" :key="msg.id">
        <button
            type="button"
            class="w-full text-left border border-[#c3c4c7] bg-white px-3 py-2.5 hover:border-[#2271b1] cursor-pointer transition-colors"
            :class="{'border-l-4 border-l-cyan-500': msg.status === 'OPEN'}"
            @click="openMessage(msg.id)"
        >
          <div class="flex items-center justify-between gap-3 min-w-0">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-500 truncate">
              {{ INBOX_KIND_LABELS[msg.kind] }}
              <span class="font-bold text-slate-400 normal-case tracking-normal">
                · {{ msg.author.displayName }}
              </span>
            </span>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              {{ formatDate(msg.createdAt) }}
            </span>
          </div>
          <div class="flex items-center justify-between gap-3 min-w-0 mt-1">
            <span class="text-sm font-bold text-[#1d2327] truncate">{{ msg.subject }}</span>
            <span
                class="text-[10px] font-black uppercase px-2 py-0.5 border border-[#c3c4c7] bg-[#f6f8fa] shrink-0"
                :class="{'bg-cyan-50 border-cyan-300 text-cyan-800': msg.status === 'OPEN'}"
            >
              {{ INBOX_STATUS_LABELS[msg.status] }}
            </span>
          </div>
        </button>
      </li>
    </ul>
  </template>
</template>
