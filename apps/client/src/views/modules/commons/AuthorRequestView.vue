<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {createInboxMessage, getMe} from '#services'
import {Breadcrumbs} from '#components'
import {INBOX_KIND, USER_ROLE} from '@randomstack/commons'
import {toast} from '../../../lib/toast'

const route = useRoute()
const router = useRouter()

const sending = ref(false)
const motivation = ref('')
const experience = ref('')
const topics = ref('')
const portfolio = ref('')
const sample = ref('')
const availability = ref('')
const extra = ref('')

const detailScore = computed(() => {
  let n = 0
  if (motivation.value.trim().length >= 40) n++
  if (experience.value.trim().length >= 30) n++
  if (topics.value.trim()) n++
  if (portfolio.value.trim()) n++
  if (sample.value.trim().length >= 40) n++
  if (availability.value.trim()) n++
  if (extra.value.trim()) n++
  return n
})

const detailHint = computed(() => {
  if (detailScore.value >= 5) return 'Solide — l’équipe modération a de quoi décider.'
  if (detailScore.value >= 3) return 'Bien — un portfolio ou un extrait aide vraiment.'
  return 'Plus tu précises ton expérience et tes sujets, plus vite on peut répondre.'
})

const buildBody = () => {
  const lines = [
    topics.value.trim() ? `Sujets souhaités : ${topics.value.trim()}` : null,
    availability.value.trim() ? `Disponibilité : ${availability.value.trim()}` : null,
    portfolio.value.trim() ? `Portfolio / liens :\n${portfolio.value.trim()}` : null,
    '',
    'Motivation :',
    motivation.value.trim(),
    '',
    'Expérience :',
    experience.value.trim(),
    sample.value.trim() ? `\nExemple / extrait :\n${sample.value.trim()}` : null,
    extra.value.trim() ? `\nInfos complémentaires :\n${extra.value.trim()}` : null
  ]
  return lines.filter(l => l !== null).join('\n').trim()
}

const submit = async () => {
  if (sending.value) return

  if (motivation.value.trim().length < 40) {
    toast.error('Développe ta motivation (40 caractères min.).')
    return
  }
  if (experience.value.trim().length < 30) {
    toast.error('Décris ton expérience (30 caractères min.).')
    return
  }
  if (!topics.value.trim()) {
    toast.error('Indique les sujets sur lesquels tu veux écrire.')
    return
  }

  const me = await getMe()
  if (!me) {
    await router.push({path: '/login', query: {redirect: route.fullPath}})
    return
  }
  if (me.role !== USER_ROLE.USER) {
    toast.error('Tu as déjà un rôle éditorial.')
    await router.replace('/profile')
    return
  }

  const body = buildBody()
  if (body.length > 4000) {
    toast.error('Demande trop longue — raccourcis un peu.')
    return
  }

  sending.value = true
  try {
    await createInboxMessage({
      kind: INBOX_KIND.AUTHOR_REQUEST,
      subject: 'Demande statut auteur',
      body
    })
    toast.success('Merci — ta demande a été envoyée.')
    await router.push('/profile')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Envoi impossible.')
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  const me = await getMe()
  if (!me) {
    await router.replace({path: '/login', query: {redirect: route.fullPath}})
    return
  }
  if (me.role !== USER_ROLE.USER) {
    toast.error('Tu as déjà un rôle éditorial.')
    await router.replace('/profile')
  }
})
</script>

<template>
  <main class="container-catalog py-8 flex flex-col gap-6 max-w-3xl">
    <Breadcrumbs :items="[
      { label: 'Profil', to: '/profile' },
      { label: 'Devenir auteur' }
    ]"/>

    <header class="page-header page-header--flush">
      <h1 class="page-title">Demander le statut auteur</h1>
      <p class="page-subtitle">
        Explique pourquoi tu veux publier sur RandomStack — expérience, sujets, exemples.
      </p>
    </header>

    <div class="border border-[#c3c4c7] bg-[#f6f8fa] p-4 text-sm text-slate-600">
      <p class="m-0 font-bold text-[#1d2327]">{{ detailHint }}</p>
      <p class="m-0 mt-1 text-xs text-slate-500">
        Richesse : {{ detailScore }}/7 — motivation, expérience et sujets sont indispensables.
      </p>
    </div>

    <form class="flex flex-col gap-5" @submit.prevent="submit">
      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Motivation *
        </label>
        <textarea
            v-model="motivation"
            rows="4"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Pourquoi RandomStack ? Qu’est-ce que tu apportes à la communauté ?"
            maxlength="1500"
        />
        <p class="text-[10px] text-slate-400 mt-1 m-0">40 caractères minimum.</p>
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Expérience *
        </label>
        <textarea
            v-model="experience"
            rows="4"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Parcours tech, écrits déjà publiés, stack maîtrisée…"
            maxlength="1500"
        />
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Sujets que tu veux traiter *
        </label>
        <input
            v-model="topics"
            type="text"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Ex. : NestJS, DevOps, architecture front…"
            maxlength="300"
            required
        />
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Portfolio / liens
        </label>
        <textarea
            v-model="portfolio"
            rows="3"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Blog, GitHub, LinkedIn, articles existants…"
            maxlength="1000"
        />
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Exemple / extrait
        </label>
        <textarea
            v-model="sample"
            rows="4"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Pitch d’un premier article, ou un court extrait de ton style…"
            maxlength="1500"
        />
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Disponibilité
        </label>
        <input
            v-model="availability"
            type="text"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Ex. : 1 article / mois, ponctuel…"
            maxlength="200"
        />
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Autres infos
        </label>
        <textarea
            v-model="extra"
            rows="3"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Langues, contraintes, questions…"
            maxlength="800"
        />
      </div>

      <div class="flex flex-wrap gap-2 pt-2">
        <button type="submit" class="btn btn--primary" :disabled="sending">
          {{ sending ? 'Envoi…' : 'Envoyer la demande' }}
        </button>
        <router-link to="/profile" class="btn btn--secondary">Annuler</router-link>
      </div>
    </form>
  </main>
</template>
