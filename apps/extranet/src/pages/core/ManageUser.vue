<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {fetchUsers, getMe} from '#services'
import {UserTable} from '#components'
import type {AdminUserListed, Role} from '@randomstack/commons'

const users = ref<AdminUserListed[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedRole = ref('')
const actorRole = ref<Role | null>(null)

const isEditor = computed(() => actorRole.value === 'EDITOR')
const isAdmin = computed(() => actorRole.value === 'ADMIN')

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return users.value.filter(u => {
    const roleOk = !selectedRole.value || u.role === selectedRole.value
    if (!roleOk) return false
    if (!q) return true
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  })
})

onMounted(async () => {
  try {
    const me = await getMe()
    actorRole.value = me?.role ?? null
    users.value = await fetchUsers()
  } catch {
    error.value = isEditor.value
      ? 'Impossible de charger les auteurs.'
      : 'Impossible de charger les utilisateurs.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <header class="main-header">
    <div>
      <h1 class="header-title">
        {{ isEditor ? 'Auteurs' : 'Gestion des utilisateurs' }}
      </h1>
      <p class="header-sub">
        {{ isEditor
          ? 'Consulte les auteurs et la liste de leurs articles'
          : 'Consultez les comptes, rôles, articles et liens portfolio' }}
      </p>
    </div>
    <router-link v-if="isAdmin" to="/create-user" class="add-btn">
      + Créer un utilisateur
    </router-link>
  </header>

  <div v-if="loading" class="loading-text">
    {{ isEditor ? 'Chargement des auteurs…' : 'Chargement des utilisateurs…' }}
  </div>
  <div v-else-if="error" class="error-box">{{ error }}</div>

  <div v-else class="flex flex-col gap-4">
    <div class="filter-bar-wrap">
      <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Rechercher (nom, email…)"
          class="filter-input"
      />
      <select
          v-if="!isEditor"
          v-model="selectedRole"
          class="filter-select"
      >
        <option value="">Tous les rôles</option>
        <option value="USER">USER</option>
        <option value="AUTHOR">AUTHOR</option>
        <option value="MODERATOR">MODERATOR</option>
        <option value="EDITOR">EDITOR</option>
        <option value="ADMIN">ADMIN</option>
      </select>
    </div>

    <p class="text-xs text-slate-500">
      {{ filteredUsers.length }}
      {{ isEditor
        ? `auteur${filteredUsers.length > 1 ? 's' : ''}`
        : `utilisateur${filteredUsers.length > 1 ? 's' : ''}` }}
    </p>

    <UserTable :users="filteredUsers"/>
  </div>
</template>
