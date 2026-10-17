<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {createInboxMessage, getMe} from '#services'
import {Breadcrumbs} from '#components'
import {
  INBOX_KIND,
  TECHNOLOGY_CATEGORY,
  TECHNOLOGY_CATEGORY_LABELS,
  type Category
} from '@randomstack/commons'
import {toast} from '../../../lib/toast'

const route = useRoute()
const router = useRouter()

const sending = ref(false)
const name = ref('')
const websiteUrl = ref('')
const docsUrl = ref('')
const language = ref('')
const usage = ref('')
const categories = ref<Category[]>([])
const description = ref('')
const why = ref('')
const creator = ref('')
const foundedAt = ref('')
const similarTo = ref('')
const extra = ref('')

const categoryOptions = Object.values(TECHNOLOGY_CATEGORY) as Category[]

const detailScore = computed(() => {
  let n = 0
  if (name.value.trim()) n++
  if (websiteUrl.value.trim()) n++
  if (docsUrl.value.trim()) n++
  if (language.value.trim()) n++
  if (usage.value.trim()) n++
  if (categories.value.length) n++
  if (description.value.trim().length >= 40) n++
  if (why.value.trim().length >= 20) n++
  if (creator.value.trim() || foundedAt.value.trim()) n++
  if (similarTo.value.trim() || extra.value.trim()) n++
  return n
})

const detailHint = computed(() => {
  if (detailScore.value >= 8) return 'Excellent — l’équipe aura de quoi travailler.'
  if (detailScore.value >= 5) return 'Bien — encore un ou deux détails et c’est parfait.'
  return 'Plus tu donnes d’infos, plus vite on pourra l’ajouter.'
})

const toggleCategory = (cat: Category) => {
  const i = categories.value.indexOf(cat)
  if (i >= 0) categories.value.splice(i, 1)
  else categories.value.push(cat)
}

const buildBody = () => {
  const lines = [
    `Nom : ${name.value.trim()}`,
    websiteUrl.value.trim() ? `Site : ${websiteUrl.value.trim()}` : null,
    docsUrl.value.trim() ? `Docs : ${docsUrl.value.trim()}` : null,
    language.value.trim() ? `Langage : ${language.value.trim()}` : null,
    usage.value.trim() ? `Utilisation : ${usage.value.trim()}` : null,
    categories.value.length
      ? `Catégories : ${categories.value.map(c => TECHNOLOGY_CATEGORY_LABELS[c]).join(', ')}`
      : null,
    creator.value.trim() ? `Créateur : ${creator.value.trim()}` : null,
    foundedAt.value.trim() ? `Année : ${foundedAt.value.trim()}` : null,
    similarTo.value.trim() ? `Proche de : ${similarTo.value.trim()}` : null,
    '',
    'Description :',
    description.value.trim(),
    '',
    'Pourquoi l’ajouter :',
    why.value.trim(),
    extra.value.trim() ? `\nInfos complémentaires :\n${extra.value.trim()}` : null
  ]
  return lines.filter(l => l !== null).join('\n').trim()
}

const submit = async () => {
  if (sending.value) return

  if (!name.value.trim()) {
    toast.error('Indique le nom de la techno.')
    return
  }
  if (!websiteUrl.value.trim() && !docsUrl.value.trim()) {
    toast.error('Ajoute au moins un lien (site ou documentation).')
    return
  }
  if (description.value.trim().length < 40) {
    toast.error('Décris la techno un peu plus (40 caractères min.).')
    return
  }
  if (why.value.trim().length < 20) {
    toast.error('Explique pourquoi on devrait l’ajouter.')
    return
  }
  if (!categories.value.length) {
    toast.error('Choisis au moins une catégorie.')
    return
  }

  const me = await getMe()
  if (!me) {
    await router.push({path: '/login', query: {redirect: route.fullPath}})
    return
  }

  const body = buildBody()
  if (body.length > 4000) {
    toast.error('Suggestion trop longue — raccourcis un peu les textes.')
    return
  }

  sending.value = true
  try {
    await createInboxMessage({
      kind: INBOX_KIND.TECH_SUGGESTION,
      subject: `Suggestion techno — ${name.value.trim()}`,
      body
    })
    toast.success('Merci — ta suggestion a été envoyée.')
    await router.push('/encyclopedia')
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
  }
})
</script>

<template>
  <main class="container-catalog py-8 flex flex-col gap-6 max-w-3xl">
    <Breadcrumbs :items="[
      { label: 'Accueil', to: '/' },
      { label: 'Encyclopédie', to: '/encyclopedia' },
      { label: 'Suggérer une techno' }
    ]"/>

    <header class="page-header page-header--flush">
      <h1 class="page-title">Suggérer une technologie</h1>
      <p class="page-subtitle">
        Plus ta fiche est complète, plus vite on pourra la vérifier et l’ajouter à l’encyclopédie.
      </p>
    </header>

    <div class="border border-[#c3c4c7] bg-[#f6f8fa] p-4 text-sm text-slate-600">
      <p class="m-0 font-bold text-[#1d2327]">{{ detailHint }}</p>
      <p class="m-0 mt-1 text-xs text-slate-500">
        Richesse : {{ detailScore }}/10 — site, docs, catégories, description et motivation aident vraiment.
      </p>
    </div>

    <form class="flex flex-col gap-5" @submit.prevent="submit">
      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Nom de la techno *
        </label>
        <input
            v-model="name"
            type="text"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Ex. : Astro, Bun, Drizzle…"
            maxlength="120"
            required
        />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Site officiel *
          </label>
          <input
              v-model="websiteUrl"
              type="url"
              class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
              placeholder="https://…"
          />
          <p class="text-[10px] text-slate-400 mt-1 m-0">Ou docs ci-contre si pas de site.</p>
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Documentation
          </label>
          <input
              v-model="docsUrl"
              type="url"
              class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
              placeholder="https://…"
          />
        </div>
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Catégorie(s) *
        </label>
        <div class="flex flex-wrap gap-2">
          <button
              v-for="cat in categoryOptions"
              :key="cat"
              type="button"
              class="px-2.5 py-1.5 text-[10px] font-bold uppercase border border-[#c3c4c7] bg-white"
              :class="categories.includes(cat) ? 'border-[#2271b1] text-[#2271b1] bg-sky-50' : 'text-slate-600'"
              @click="toggleCategory(cat)"
          >
            {{ TECHNOLOGY_CATEGORY_LABELS[cat] }}
          </button>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Langage principal
          </label>
          <input
              v-model="language"
              type="text"
              class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
              placeholder="Ex. : TypeScript, Python…"
          />
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Utilisation / couche
          </label>
          <input
              v-model="usage"
              type="text"
              class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
              placeholder="Ex. : Frontend Web, Backend API…"
          />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Créateur / éditeur
          </label>
          <input
              v-model="creator"
              type="text"
              class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
              placeholder="Ex. : Vercel, Google…"
          />
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Année de création
          </label>
          <input
              v-model="foundedAt"
              type="text"
              class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
              placeholder="Ex. : 2021"
              maxlength="10"
          />
        </div>
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Description *
        </label>
        <textarea
            v-model="description"
            rows="5"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="À quoi sert cet outil ? Points forts, cas d’usage, écosystème…"
            maxlength="1500"
        />
        <p class="text-[10px] text-slate-400 mt-1 m-0">40 caractères minimum — sois concret.</p>
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Pourquoi l’ajouter à RandomStack ? *
        </label>
        <textarea
            v-model="why"
            rows="3"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Manque dans le catalogue, tendance, utile au tirage, alternative à X…"
            maxlength="800"
        />
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Proche de quelles technos déjà listées ?
        </label>
        <input
            v-model="similarTo"
            type="text"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Ex. : Next.js, Nuxt, Remix…"
        />
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Autres infos utiles
        </label>
        <textarea
            v-model="extra"
            rows="3"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Licence, maturité, liens GitHub, versions, compatibilités connues…"
            maxlength="800"
        />
      </div>

      <div class="flex flex-wrap gap-2 pt-2">
        <button type="submit" class="btn btn--primary" :disabled="sending">
          {{ sending ? 'Envoi…' : 'Envoyer la suggestion' }}
        </button>
        <router-link to="/encyclopedia" class="btn btn--secondary">Annuler</router-link>
      </div>
    </form>
  </main>
</template>
