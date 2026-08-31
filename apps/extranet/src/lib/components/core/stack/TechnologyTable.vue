<script setup lang="ts">
import type { Technology } from '@randomstack/commons'

defineProps<{
  technologies: Technology[]
}>()
</script>

<template>
  <div class="table-container">
    <table class="admin-table">
      <thead>
      <tr>
        <th>Logo</th>
        <th>Nom / Framework</th>
        <th>Langage</th>
        <th>Catégorie(s)</th> <!-- Modifié en pluriel 🚀 -->
        <th>Utilisation</th>
        <th class="text-right">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="tech in technologies" :key="tech.id">
        <td class="p-4">
          <div class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
            <img v-if="tech.logo" :src="`http://localhost:4000${tech.logo}`" class="w-full h-full object-cover" />
            <span v-else class="text-[9px] font-black text-slate-400 uppercase">{{ tech.name.substring(0, 2) }}</span>
          </div>
        </td>
        <td class="tech-name">{{ tech.name }}</td>
        <td class="tech-lang">{{ tech.language }}</td>
        <td class="p-4">
          <!-- Boucle pour afficher un badge pour CHAQUE catégorie de l'outil 🚀 -->
          <div class="flex flex-wrap gap-1">
              <span v-for="cat in tech.categories" :key="cat" class="category-badge">
                {{ cat }}
              </span>
          </div>
        </td>
        <td class="tech-desc">{{ tech.usage }}</td>
        <td class="text-right">
          <router-link :to="`/edit-technology/${tech.id}`" class="edit-btn">
            Éditer
          </router-link>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>