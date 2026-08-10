<script setup lang="ts">
import Header from './Header.vue'
import Footer from './Footer.vue'
</script>

<template>
  <div class="app-layout-wrapper">
    <!-- Navbar globale -->
    <Header />

    <!-- Zone d'affichage des pages enfants (Lobby, Draft, Encyclopedia) -->
    <main class="app-main-content">
      <router-view />
    </main>

    <!-- Footer global -->
    <Footer />
  </div>
</template>