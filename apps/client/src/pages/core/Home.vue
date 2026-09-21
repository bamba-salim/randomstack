<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PostService } from '#services' // <-- Ton nouveau service 🚀
import type { Post } from '@randomstack/commons'

const router = useRouter()
const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Formatage propre de la date 📅
const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(async () => {
  try {
    // 1. Récupération des articles réels depuis Postgres ! 🚀
    posts.value = await PostService.fetchPublishedPosts()
  } catch {
    error.value = "Impossible de récupérer les dernières actualités."
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="lobby-page-container">
    <div class="lobby-layout-grid max-w-5xl w-full">

      <!-- COLONNE GAUCHE : LE PORTAIL DE NEWS / ACTUALITÉS (MONÉTISATION PUB) 🚀 -->
      <section class="news-main-section">
        <h2 class="section-title">📰 Dernières Actualités & Guides</h2>

        <div v-if="loading" class="text-xs text-blue-500 font-bold py-6 animate-pulse">
          Chargement des actualités en temps réel...
        </div>

        <!-- Erreur -->
        <div v-else-if="error" class="p-3 bg-red-950/10 border border-red-900/40 text-red-400 rounded-xl text-[11px] mt-4">
          {{ error }}
        </div>

        <!-- Liste des Articles -->
        <div v-else class="news-list mt-4">

          <article
              v-for="post in posts"
              :key="post.id"
              @click="router.push(`/post/${post.slug}`)"
              class="news-card cursor-pointer"
          >
            <!-- Méta-données (Date & Tags) -->
            <div class="post-meta">
              <!-- On utilise la date de publication ou de création -->
              <span class="date">{{ formatDate(post.publishAt || post.createdAt) }}</span>
              <span class="separator">•</span>
              <!-- On affiche le premier tag comme catégorie (optionnel) -->
              <span v-if="post.tags && post.tags.length > 0" class="text-[#2271b1]">#{{ post.tags[0] }}</span>
            </div>

            <!-- Image de couverture 🚀 -->
            <div v-if="post.imageId" class="w-full h-40 bg-slate-50 border border-[#c3c4c7] rounded-xl overflow-hidden mb-3">
              <img :src="`http://localhost:4000/api/files/${post.imageId}`" class="w-full h-full object-cover" />
            </div>

            <!-- Titre et Extrait -->
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt">{{ post.summary }}</p>
            <span class="read-more-link">Lire l'article →</span>
          </article>

          <!-- État vide -->
          <p v-if="posts.length === 0" class="text-xs text-slate-500 italic mt-6 text-center">
            Aucun article n'a encore été publié.
          </p>

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
              <span class="sub-label">Découvrez les outils</span>
            </div>
          </button>

        </div>

      </aside>

    </div>
  </div>
</template>