<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Contrôle de l'ouverture du menu mobile 📱
const isMobileMenuOpen = ref(false)

const navigateTo = (path: string) => {
  isMobileMenuOpen.value = false
  router.push(path)
}
</script>

<template>
  <header class="app-header">
    <div class="header-container">

      <!-- LOGO -->
      <div @click="navigateTo('/')" class="logo-area cursor-pointer">
        <span class="logo-text">RANDOMSTACK</span>
      </div>

      <!-- BOUTON BURGER (Mobile uniquement) 📱 -->
      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="mobile-menu-toggle">
        {{ isMobileMenuOpen ? '✕' : '☰' }}
      </button>

      <!-- NAVIGATION DESKTOP -->
      <nav class="desktop-navigation">
        <router-link to="/draft" :class="['nav-item', { 'active': route.path.startsWith('/draft') }]">🕹️ Générateur</router-link>
        <router-link to="/encyclopedia" :class="['nav-item', { 'active': route.path === '/encyclopedia' }]">📖 Encyclopédie</router-link>
        <span class="nav-item disabled">📰 Actualités (V2)</span>
      </nav>

    </div>

    <!-- TIROIR DE NAVIGATION MOBILE 📱 -->
    <Transition name="fade">
      <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="mobile-nav-overlay"></div>
    </Transition>

    <Transition name="slide-left">
      <nav v-if="isMobileMenuOpen" class="mobile-navigation">
        <button @click="navigateTo('/draft')" :class="['mobile-nav-item', { 'active': route.path.startsWith('/draft') }]">🕹️ Générateur</button>
        <button @click="navigateTo('/encyclopedia')" :class="['mobile-nav-item', { 'active': route.path === '/encyclopedia' }]">📖 Encyclopédie</button>
        <button class="mobile-nav-item disabled" disabled>📰 Actualités (V2)</button>
      </nav>
    </Transition>
  </header>
</template>