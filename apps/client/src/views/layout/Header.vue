<script setup lang="ts">
import {ref, computed, watch, onMounted, onBeforeUnmount} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {getMe, logout, fileUrl} from '#services'
import {toast} from '../../lib/toast'
import type {SessionUserLite} from '@randomstack/commons'

const router = useRouter()
const route = useRoute()

const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const user = ref<SessionUserLite | null>(null)
const menuRoot = ref<HTMLElement | null>(null)

const initials = computed(() =>
  (user.value?.displayName || user.value?.email || '?').substring(0, 2).toUpperCase()
)

watch(
  () => route.fullPath,
  async () => {
    user.value = await getMe()
    isUserMenuOpen.value = false
    isMobileMenuOpen.value = false
  },
  {immediate: true}
)

const navigateTo = (path: string) => {
  isMobileMenuOpen.value = false
  isUserMenuOpen.value = false
  router.push(path)
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const handleLogout = async () => {
  isUserMenuOpen.value = false
  isMobileMenuOpen.value = false
  await logout()
  user.value = null
  toast.success('Déconnexion.')
  await router.push('/')
}

const onDocumentClick = (event: MouseEvent) => {
  if (!isUserMenuOpen.value || !menuRoot.value) return
  if (!menuRoot.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <header class="app-header">
    <div class="header-container">

      <div @click="navigateTo('/')" class="logo-area">
        <span class="logo-text">RANDOMSTACK</span>
      </div>

      <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="mobile-menu-toggle"
          aria-label="Menu de navigation"
      >
        {{ isMobileMenuOpen ? '✕' : '☰' }}
      </button>

      <nav class="desktop-navigation">
        <router-link to="/draft" :class="['nav-item', { 'active': route.path.startsWith('/draft') }]">
          🕹️ Générateur
        </router-link>
        <router-link to="/encyclopedia" :class="['nav-item', { 'active': route.path === '/encyclopedia' }]">
          📖 Encyclopédie
        </router-link>

        <div ref="menuRoot" class="user-menu">
          <router-link
              v-if="!user"
              to="/login"
              class="user-menu__trigger user-menu__trigger--guest"
              aria-label="Connexion"
              title="Connexion"
          >
            <svg class="user-menu__icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 20.25a8.25 8.25 0 0 1 15 0"/>
            </svg>
          </router-link>

          <template v-else>
            <button
                type="button"
                class="user-menu__trigger"
                :aria-expanded="isUserMenuOpen"
                aria-haspopup="menu"
                aria-label="Menu compte"
                @click.stop="toggleUserMenu"
            >
              <img
                  v-if="user.photoId"
                  :src="fileUrl(user.photoId)"
                  :alt="user.displayName || 'Profil'"
                  class="user-menu__avatar-img"
                  loading="lazy"
              />
              <span v-else class="user-menu__avatar-fallback">{{ initials }}</span>
            </button>

            <div v-if="isUserMenuOpen" class="user-menu__dropdown" role="menu">
              <button type="button" class="user-menu__item" role="menuitem" @click="navigateTo(`/u/${user.id}`)">
                Profil public
              </button>
              <button type="button" class="user-menu__item" role="menuitem" @click="navigateTo('/profile')">
                Modifier mon profil
              </button>
              <button type="button" class="user-menu__item user-menu__item--danger" role="menuitem" @click="handleLogout">
                Déconnexion
              </button>
            </div>
          </template>
        </div>
      </nav>

    </div>

    <Transition name="fade">
      <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="mobile-nav-overlay"></div>
    </Transition>

    <Transition name="slide-left">
      <nav v-if="isMobileMenuOpen" class="mobile-navigation">
        <button @click="navigateTo('/draft')" :class="['mobile-nav-item', { 'active': route.path.startsWith('/draft') }]">
          🕹️ Générateur
        </button>
        <button @click="navigateTo('/encyclopedia')" :class="['mobile-nav-item', { 'active': route.path === '/encyclopedia' }]">
          📖 Encyclopédie
        </button>

        <template v-if="user">
          <button @click="navigateTo(`/u/${user.id}`)" class="mobile-nav-item">Profil public</button>
          <button @click="navigateTo('/profile')" :class="['mobile-nav-item', { 'active': route.path === '/profile' }]">
            Modifier mon profil
          </button>
          <button @click="handleLogout" class="mobile-nav-item mobile-nav-item--danger">Déconnexion</button>
        </template>
        <button
            v-else
            @click="navigateTo('/login')"
            :class="['mobile-nav-item', { 'active': route.path === '/login' }]"
        >
          Connexion
        </button>
      </nav>
    </Transition>
  </header>
</template>
