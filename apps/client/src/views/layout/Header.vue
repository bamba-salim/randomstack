<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {getMe} from '#services'
import type {SessionUserLite} from '@randomstack/commons'
import {getAdminNavLinks} from '../../lib/admin-nav'

const router = useRouter()
const route = useRoute()

const isMobileMenuOpen = ref(false)
const user = ref<SessionUserLite | null>(null)

const adminLinks = computed(() => getAdminNavLinks(user.value?.role))

watch(
  () => route.fullPath,
  async () => {
    user.value = await getMe()
  },
  {immediate: true}
)

const navigateTo = (path: string) => {
  isMobileMenuOpen.value = false
  router.push(path)
}
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
        <span class="nav-item disabled">📰 Actualités (V2)</span>
        <template v-if="adminLinks.length > 0">
          <a
              v-for="link in adminLinks"
              :key="link.href"
              class="nav-item"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
          >
            {{ link.label }}
          </a>
        </template>
        <router-link
            v-if="user"
            to="/profile"
            :class="['nav-item', { 'active': route.path === '/profile' }]"
        >
          Profil
        </router-link>
        <router-link
            v-else
            to="/login"
            :class="['nav-item', { 'active': route.path === '/login' }]"
        >
          Connexion
        </router-link>
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
        <button class="mobile-nav-item disabled" disabled>📰 Actualités (V2)</button>
        <a
            v-for="link in adminLinks"
            :key="link.href"
            class="mobile-nav-item"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            @click="isMobileMenuOpen = false"
        >
          {{ link.label }}
        </a>
        <button
            v-if="user"
            @click="navigateTo('/profile')"
            :class="['mobile-nav-item', { 'active': route.path === '/profile' }]"
        >
          Profil
        </button>
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
