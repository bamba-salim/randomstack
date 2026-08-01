<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Technology {
  id: string
  name: string
  language: string
  logo?: string
  usage: string
  description: string
  category: string
}

const technologies = ref<Technology[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Requête HTTP directe vers votre API unique sur le port 4000 🚀
const fetchTechnologies = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/technologies')
    if (!response.ok) throw new Error('Erreur HTTP ' + response.status)
    technologies.value = await response.json()
  } catch (err: any) {
    error.value = "Impossible de se connecter à l'API d'administration."
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTechnologies()
})
</script>

<template>
  <div class="flex min-h-screen bg-slate-950 text-slate-100 font-sans">

    <!-- SIDEBAR DE L'EXTRANET -->
    <aside class="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6">
      <div class="flex flex-col">
        <span class="text-sm font-black tracking-widest text-blue-500 uppercase">RANDOMSTACK</span>
        <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Extranet d'Administration</span>
      </div>
      <nav class="flex flex-col gap-2 mt-4 text-xs font-semibold">
        <a href="#" class="px-4 py-3 bg-slate-950 text-blue-400 border border-slate-800 rounded-xl">📦 Gérer les Technologies</a>
        <a href="#" class="px-4 py-3 text-slate-500 hover:text-slate-300 rounded-xl cursor-not-allowed">👥 Utilisateurs (V3)</a>
        <a href="#" class="px-4 py-3 text-slate-500 hover:text-slate-300 rounded-xl cursor-not-allowed">📊 Statistiques (V4)</a>
      </nav>
    </aside>

    <!-- CONTENU PRINCIPAL -->
    <main class="flex-1 p-8 flex flex-col">
      <header class="flex items-center justify-between border-b border-slate-900 pb-6 mb-8">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight">Gestion du catalogue</h1>
          <p class="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Visualisez et administrez le pool de technologies de la V1</p>
        </div>
        <button class="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition-colors duration-200 shadow-lg shadow-blue-900/20">
          + Ajouter une Technologie (V2)
        </button>
      </header>

      <!-- Diagnostic/Loading -->
      <div v-if="loading" class="text-sm text-blue-500 font-medium my-auto mx-auto animate-pulse">
        Chargement de la base de données...
      </div>

      <div v-if="error" class="p-4 bg-red-950/20 border border-red-900 text-red-400 rounded-xl text-xs max-w-md mx-auto my-auto text-center">
        {{ error }}
      </div>

      <!-- TABLEAU D'ADMINISTRATION DES TECHNOLOGIES 🚀 -->
      <div v-if="!loading && !error" class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
          <tr class="bg-slate-950 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <th class="p-4">Nom / Framework</th>
            <th class="p-4">Langage</th>
            <th class="p-4">Catégorie</th>
            <th class="p-4">Utilisation</th>
            <th class="p-4 text-right">Actions</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-medium">
          <tr v-for="tech in technologies" :key="tech.id" class="hover:bg-slate-950/30 transition-colors">
            <td class="p-4 font-bold text-slate-200">{{ tech.name }}</td>
            <td class="p-4 text-slate-400 font-mono">{{ tech.language }}</td>
            <td class="p-4">
                <span class="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-slate-950 text-slate-400 border border-slate-800">
                  {{ tech.category }}
                </span>
            </td>
            <td class="p-4 text-slate-400 max-w-xs truncate">{{ tech.usage }}</td>
            <td class="p-4 text-right">
              <button class="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-md text-[10px] text-slate-400 hover:text-slate-200 transition-colors duration-200">
                Éditer (V2)
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </main>

  </div>
</template>