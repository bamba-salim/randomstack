<script setup lang="ts">
import type {AdminUserListed} from '@randomstack/commons'
import {fileUrl} from '#services'

defineProps<{
  users: AdminUserListed[]
}>()
</script>

<template>
  <div class="table-container">
    <table class="admin-table">
      <thead>
      <tr>
        <th>Profil</th>
        <th>Nom</th>
        <th>Email</th>
        <th>Rôle</th>
        <th>Articles</th>
        <th>Liens</th>
        <th>Inscription</th>
        <th class="text-right">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="user in users" :key="user.id">
        <td class="p-4">
          <div class="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden text-[10px] font-black text-slate-500">
            <img
                v-if="user.photoId"
                :src="fileUrl(user.photoId)"
                :alt="user.displayName"
                class="w-full h-full object-cover"
            />
            <span v-else>{{ user.displayName.substring(0, 2).toUpperCase() }}</span>
          </div>
        </td>
        <td class="tech-name">{{ user.displayName }}</td>
        <td class="tech-lang">{{ user.email }}</td>
        <td class="p-4">
          <span class="category-badge" :class="user.role.toLowerCase()">
            {{ user.role }}
          </span>
        </td>
        <td class="tech-lang">{{ user.postsCount }}</td>
        <td class="tech-lang">{{ user.linksCount }}</td>
        <td class="tech-lang">
          {{ new Date(user.createdAt).toLocaleDateString('fr-FR') }}
        </td>
        <td class="text-right">
          <router-link :to="`/edit-user/${user.id}`" class="edit-btn">
            Voir
          </router-link>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
