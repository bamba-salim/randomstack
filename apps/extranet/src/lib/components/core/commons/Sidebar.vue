<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AuthService } from '#services'

const router = useRouter()
const route = useRoute()

// Contrôle l'ouverture du menu coulissant sur mobile 📱
const isMobileMenuOpen = ref(false)

const handleLogout = async () => {
  try {
    await AuthService.logout()
    router.push('/login')
  } catch {
    alert("Erreur déconnexion.")
  }
}
</script>

<template>
  <!-- BOUTON BURGER (Visible uniquement sur Mobile) 📱 -->
  <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="mobile-burger-btn">
    {{ isMobileMenuOpen ? '✕' : '☰ Menu' }}
  </button>

  <!-- Arrière-plan flouté d'overlay sur mobile cliquable -->
  <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="mobile-sidebar-overlay"></div>

  <!-- LE COMPOSANT SIDEBAR UNIQUE (Fixe sur Desktop, coulissant sur Mobile) 🚀 -->
  <aside :class="['admin-sidebar', { 'mobile-open': isMobileMenuOpen }]">
    <div class="sidebar-logo">
      <span class="logo-main">RANDOMSTACK</span>
      <span class="logo-sub">Extranet d'Administration</span>
    </div>

    <nav class="sidebar-nav">
      <router-link
          to="/dashboard"
          :class="['nav-link', { 'active': route.path === '/dashboard' || route.path.startsWith('/edit-technology') }]"
      >
        📦 Gérer les Technologies
      </router-link>

      <router-link
          to="/posts"
          :class="['nav-link', { 'active': route.path === '/posts' || route.path.startsWith('/edit-post') }]"
      >
        📰 Gérer les Actualités
      </router-link>
      <a href="#" class="nav-link disabled">👥 Utilisateurs (V3)</a>
      <a href="#" class="nav-link disabled">📊 Statistiques (V4)</a>

      <button @click="handleLogout" class="logout-btn">
        🚪 Se déconnecter
      </button>
    </nav>
  </aside>
</template>