<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {logout, getMe, fetchInboxOpenCount} from '#services'
import {toast} from '../../../toast'
import type {Role} from '@randomstack/commons'

const router = useRouter()
const route = useRoute()

const isMobileMenuOpen = ref(false)
const role = ref<Role | null>(null)
const inboxOpenCount = ref(0)

const canManageTech = () => role.value === 'ADMIN' || role.value === 'EDITOR'
const canManageUsers = () =>
  role.value === 'ADMIN' || role.value === 'MODERATOR' || role.value === 'EDITOR'
const usersNavLabel = () => (role.value === 'EDITOR' ? '✍️ Auteurs' : '👥 Utilisateurs')
const canManagePosts = () =>
  role.value === 'ADMIN' ||
  role.value === 'EDITOR' ||
  role.value === 'AUTHOR' ||
  role.value === 'MODERATOR'

const refreshInboxBadge = async () => {
  if (!canManagePosts()) {
    inboxOpenCount.value = 0
    return
  }
  try {
    inboxOpenCount.value = await fetchInboxOpenCount()
  } catch {
    inboxOpenCount.value = 0
  }
}

onMounted(async () => {
  const me = await getMe()
  role.value = me?.role ?? null
  await refreshInboxBadge()
})

// Rafraîchir le badge en quittant / changeant de page inbox
watch(
  () => route.path,
  () => {
    refreshInboxBadge()
  }
)

const handleLogout = async () => {
  try {
    await logout()
    toast.success('Déconnexion.')
    router.push('/login')
  } catch {
    toast.error('Erreur déconnexion.')
  }
}
</script>

<template>
  <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="mobile-burger-btn">
    {{ isMobileMenuOpen ? '✕' : '☰ Menu' }}
  </button>

  <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="mobile-sidebar-overlay"></div>

  <aside :class="['admin-sidebar', { 'mobile-open': isMobileMenuOpen }]">
    <div class="sidebar-logo">
      <span class="logo-main">RANDOMSTACK</span>
      <span class="logo-sub">Extranet d'Administration</span>
    </div>

    <nav class="sidebar-nav">
      <router-link
          v-if="canManagePosts()"
          to="/inbox"
          :class="['nav-link', 'nav-link--inbox', { 'active': route.path.startsWith('/inbox') }]"
      >
        <span>📥 Inbox</span>
        <span
            v-if="inboxOpenCount > 0"
            class="inbox-badge"
            :title="`${inboxOpenCount} nouveau(x) message(s)`"
        >
          {{ inboxOpenCount > 99 ? '99+' : inboxOpenCount }}
        </span>
      </router-link>

      <router-link
          v-if="canManageTech()"
          to="/dashboard"
          :class="['nav-link', { 'active': route.path === '/dashboard' || route.path.startsWith('/edit-technology') }]"
      >
        📦 Gérer les Technologies
      </router-link>

      <router-link
          v-if="canManagePosts()"
          to="/manage-post"
          :class="['nav-link', { 'active': route.path === '/manage-post' || route.path.startsWith('/edit-post') }]"
      >
        📰 Gérer les Actualités
      </router-link>

      <router-link
          v-if="canManageUsers()"
          to="/manage-user"
          :class="['nav-link', { 'active': route.path === '/manage-user' || route.path.startsWith('/edit-user') }]"
      >
        {{ usersNavLabel() }}
      </router-link>
      <a v-if="canManageTech()" href="#" class="nav-link disabled">📊 Statistiques (V4)</a>

      <button @click="handleLogout" class="logout-btn">
        🚪 Se déconnecter
      </button>
    </nav>
  </aside>
</template>
