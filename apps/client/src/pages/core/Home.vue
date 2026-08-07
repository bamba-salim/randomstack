<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="lobby-page-container">
    <div class="lobby-card">
      <h1 class="lobby-title">RANDOMSTACK</h1>
      <p class="lobby-description">Cabinet d'arcade de développement sémantique V1</p>

      <div class="lobby-nav-grid">
        <!-- Lien vers le Générateur de Tirage -->
        <button @click="router.push('/draft')" class="lobby-btn generator-btn">
          <span class="btn-icon">🕹️</span>
          <span class="btn-text">Lancer le Générateur (V1)</span>
        </button>

        <!-- Lien vers l'Encyclopédie publique -->
        <button @click="router.push('/encyclopedia')" class="lobby-btn encyclopedia-btn">
          <span class="btn-icon">📖</span>
          <span class="btn-text">Explorer l'Encyclopédie (V2)</span>
        </button>
      </div>

      <footer class="lobby-footer">
        <a href="http://localhost:5175" class="extranet-link">
          ⚙️ Accéder à l'Extranet d'Administration
        </a>
      </footer>
    </div>
  </div>
</template>