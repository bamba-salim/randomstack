<script setup lang="ts">
import {Sidebar} from '#components' // Sidebar externalisée unique 🚀
</script>

<template>
  <div class="dashboard-page-container">
    <!-- 1. Barre latérale responsive (Sidebar) commune -->
    <Sidebar/>

    <!-- 2. Zone de contenu principal commune -->
    <main class="admin-main">
      <!-- RouterView permet de charger dynamiquement les vues enfants (Dashboard, Form) 🚀 -->
      <router-view/>
    </main>
  </div>
</template>