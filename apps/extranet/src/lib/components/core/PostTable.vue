<script setup lang="ts">
import type { Post } from '@randomstack/commons'

defineProps<{
  posts: Post[]
}>()
</script>

<template>
  <div class="table-container">
    <table class="admin-table">
      <thead>
      <tr>
        <th>Illustration</th>
        <th>Titre de l'article</th>
        <th>Statut</th>
        <th>Mots-clés (Tags)</th>
        <th>Date de Publication</th>
        <th class="text-right">Actions</th>
      </tr>
      </thead>
      <tbody>
      <!-- Nous mapperons les lignes d'articles lors de l'étape suivante 🚀 -->
      <tr v-for="post in posts" :key="post.id">
        <td class="p-4">
          <div class="w-12 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
            <img v-if="post.imageUrl" :src="`http://localhost:4000${post.imageUrl}`" class="w-full h-full object-cover" />
            <span v-else class="text-[9px] font-black text-slate-400 uppercase">NEWS</span>
          </div>
        </td>
        <td class="tech-name">{{ post.title }}</td>
        <td class="p-4">
            <span class="category-badge" :class="post.status.toLowerCase()">
              {{ post.status }}
            </span>
        </td>
        <td class="p-4">
          <div class="flex flex-wrap gap-1">
              <span v-for="tag in post.tags" :key="tag" class="category-badge">
                #{{ tag }}
              </span>
          </div>
        </td>
        <td class="tech-lang">
          {{ post.publishAt ? new Date(post.publishAt).toLocaleDateString('fr-FR') : 'Immédiate' }}
        </td>
        <td class="text-right">
          <router-link :to="`/edit-post/${post.id}`" class="edit-btn">
            Éditer
          </router-link>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>