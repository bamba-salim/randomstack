<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// Simulation d'articles de blog (Actualités V2) pour l'affichage publicitaire initial 🚀
const mockPosts = [
  {
    id: 'n1',
    title: 'Vite v6 est officiellement disponible : performances et nouveautés',
    excerpt: 'Découvrez comment le compilateur de RANDOMSTACK accélère vos builds de développement de manière spectaculaire.',
    date: '10 Août 2026',
    readTime: '3 min de lecture'
  },
  {
    id: 'n2',
    title: 'Pourquoi Svelte prend d\'assaut le monde du développement frontend',
    excerpt: 'Une analyse complète des performances comparées avec React et Vue, et pourquoi il figure dans notre machine à sous.',
    date: '08 Août 2026',
    readTime: '5 min de lecture'
  },
  {
    id: 'n3',
    title: 'PostgreSQL vs NoSQL : Comment choisir sa base de données en 2026',
    excerpt: 'Nos recommandations d\'architectures sémantiques pour concevoir des applications web stables et hautement scalables.',
    date: '04 Août 2026',
    readTime: '6 min de lecture'
  }
]
</script>

<template>
  <div class="lobby-page-container">
    <div class="lobby-layout-grid max-w-5xl w-full">

      <!-- COLONNE GAUCHE : LE PORTAIL DE NEWS / ACTUALITÉS (MONÉTISATION PUB) 🚀 -->
      <section class="news-main-section">
        <h2 class="section-title">📰 Dernières Actualités & Guides</h2>

        <div class="news-list mt-4">
          <article v-for="post in mockPosts" :key="post.id" class="news-card">
            <div class="post-meta">
              <span class="date">{{ post.date }}</span>
              <span class="separator">•</span>
              <span class="read-time">{{ post.readTime }}</span>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt">{{ post.excerpt }}</p>
            <span class="read-more-link">Lire l'article →</span>
          </article>
        </div>
      </section>

      <!-- COLONNE DROITE : LE MEUBLE DE CONTRÔLE (ENTRÉES DE TIROIRS) 🚀 -->
      <aside class="lobby-control-sidebar">

        <!-- Boîte de bienvenue de RANDOMSTACK -->
        <div class="welcome-box">
          <h1 class="brand-title">RANDOMSTACK</h1>
          <p class="brand-description">Votre cabinet d'arcade pour concevoir des piles technologiques aléatoires et explorer l'écosystème web.</p>
        </div>

        <!-- Raccourcis d'action néons -->
        <div class="shortcuts-grid">

          <!-- Raccourci vers le Générateur -->
          <button @click="router.push('/draft')" class="arcade-shortcut-btn generator-btn">
            <span class="btn-icon">🕹️</span>
            <div class="btn-content">
              <span class="main-label">Lancer le Générateur</span>
              <span class="sub-label">Tirages, Cadenas & Blacklist</span>
            </div>
          </button>

          <!-- Raccourci vers l'Encyclopédie -->
          <button @click="router.push('/encyclopedia')" class="arcade-shortcut-btn encyclopedia-btn">
            <span class="btn-icon">📖</span>
            <div class="btn-content">
              <span class="main-label">Consulter l'Encyclopédie</span>
              <span class="sub-label">Découvrez 67 technologies</span>
            </div>
          </button>

        </div>

      </aside>

    </div>
  </div>
</template>