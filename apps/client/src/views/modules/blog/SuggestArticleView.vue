<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {createInboxMessage, getMe} from '#services'
import {Breadcrumbs} from '#components'
import {INBOX_KIND} from '@randomstack/commons'
import {toast} from '../../../lib/toast'

const route = useRoute()
const router = useRouter()

const sending = ref(false)
const title = ref('')
const angle = ref('')
const outline = ref('')
const audience = ref('')
const tags = ref('')
const relatedTechs = ref('')
const sources = ref('')
const format = ref('')
const why = ref('')
const extra = ref('')

const detailScore = computed(() => {
  let n = 0
  if (title.value.trim()) n++
  if (angle.value.trim().length >= 30) n++
  if (outline.value.trim().length >= 40) n++
  if (audience.value.trim()) n++
  if (tags.value.trim()) n++
  if (relatedTechs.value.trim()) n++
  if (sources.value.trim()) n++
  if (format.value.trim()) n++
  if (why.value.trim().length >= 20) n++
  if (extra.value.trim()) n++
  return n
})

const detailHint = computed(() => {
  if (detailScore.value >= 8) return 'Excellent — l’équipe éditoriale pourra s’en saisir vite.'
  if (detailScore.value >= 5) return 'Bien — un plan ou des sources en plus, c’est top.'
  return 'Plus tu précises l’angle et le plan, plus on peut en faire un vrai article.'
})

const buildBody = () => {
  const lines = [
    `Titre proposé : ${title.value.trim()}`,
    format.value.trim() ? `Format : ${format.value.trim()}` : null,
    audience.value.trim() ? `Public : ${audience.value.trim()}` : null,
    tags.value.trim() ? `Tags : ${tags.value.trim()}` : null,
    relatedTechs.value.trim() ? `Technos liées : ${relatedTechs.value.trim()}` : null,
    '',
    'Angle / pitch :',
    angle.value.trim(),
    '',
    'Plan / points clés :',
    outline.value.trim(),
    '',
    'Pourquoi RandomStack :',
    why.value.trim(),
    sources.value.trim() ? `\nSources / liens :\n${sources.value.trim()}` : null,
    extra.value.trim() ? `\nInfos complémentaires :\n${extra.value.trim()}` : null
  ]
  return lines.filter(l => l !== null).join('\n').trim()
}

const submit = async () => {
  if (sending.value) return

  if (!title.value.trim()) {
    toast.error('Propose un titre (même provisoire).')
    return
  }
  if (angle.value.trim().length < 30) {
    toast.error('Développe l’angle / le pitch (30 caractères min.).')
    return
  }
  if (outline.value.trim().length < 40) {
    toast.error('Donne un plan ou des points clés (40 caractères min.).')
    return
  }
  if (why.value.trim().length < 20) {
    toast.error('Explique pourquoi on devrait traiter ce sujet.')
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
      kind: INBOX_KIND.ARTICLE_SUGGESTION,
      subject: `Suggestion article — ${title.value.trim()}`,
      body
    })
    toast.success('Merci — ta suggestion d’article a été envoyée.')
    await router.push('/')
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
      { label: 'Suggérer un article' }
    ]"/>

    <header class="page-header page-header--flush">
      <h1 class="page-title">Suggérer un article</h1>
      <p class="page-subtitle">
        Plus tu précises l’angle, le plan et les sources, plus vite on pourra en faire un vrai contenu.
      </p>
    </header>

    <div class="border border-[#c3c4c7] bg-[#f6f8fa] p-4 text-sm text-slate-600">
      <p class="m-0 font-bold text-[#1d2327]">{{ detailHint }}</p>
      <p class="m-0 mt-1 text-xs text-slate-500">
        Richesse : {{ detailScore }}/10 — titre, pitch, plan et motivation aident vraiment.
      </p>
    </div>

    <form class="flex flex-col gap-5" @submit.prevent="submit">
      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Titre proposé *
        </label>
        <input
            v-model="title"
            type="text"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Ex. : Pourquoi passer de REST à tRPC en 2026…"
            maxlength="200"
            required
        />
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Angle / pitch *
        </label>
        <textarea
            v-model="angle"
            rows="4"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Quel problème tu traites ? Quelle thèse ? Qu’est-ce que le lecteur doit retenir ?"
            maxlength="1200"
        />
        <p class="text-[10px] text-slate-400 mt-1 m-0">30 caractères minimum.</p>
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Plan / points clés *
        </label>
        <textarea
            v-model="outline"
            rows="5"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="1. Contexte&#10;2. Comparaison X vs Y&#10;3. Exemple concret&#10;4. Conclusion / reco"
            maxlength="1500"
        />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Public visé
          </label>
          <input
              v-model="audience"
              type="text"
              class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
              placeholder="Ex. : juniors frontend, CTO, curieux…"
          />
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Format
          </label>
          <input
              v-model="format"
              type="text"
              class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
              placeholder="Ex. : tutoriel, analyse, liste, opinion…"
          />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Tags / thèmes
          </label>
          <input
              v-model="tags"
              type="text"
              class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
              placeholder="Ex. : javascript, architecture, devops…"
          />
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Technos liées
          </label>
          <input
              v-model="relatedTechs"
              type="text"
              class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
              placeholder="Ex. : React, NestJS, PostgreSQL…"
          />
        </div>
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Pourquoi RandomStack devrait le publier ? *
        </label>
        <textarea
            v-model="why"
            rows="3"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Sujet manquant, demande communauté, suite d’un article, actualité…"
            maxlength="800"
        />
      </div>

      <div>
        <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
          Sources / liens utiles
        </label>
        <textarea
            v-model="sources"
            rows="3"
            class="w-full border border-[#c3c4c7] px-3 py-2.5 text-sm"
            placeholder="Docs, RFCs, articles, repos GitHub…"
            maxlength="1000"
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
            placeholder="Niveau technique, longueur estimée, idée d’illustration, urgence…"
            maxlength="800"
        />
      </div>

      <div class="flex flex-wrap gap-2 pt-2">
        <button type="submit" class="btn btn--primary" :disabled="sending">
          {{ sending ? 'Envoi…' : 'Envoyer la suggestion' }}
        </button>
        <router-link to="/" class="btn btn--secondary">Annuler</router-link>
      </div>
    </form>
  </main>
</template>
