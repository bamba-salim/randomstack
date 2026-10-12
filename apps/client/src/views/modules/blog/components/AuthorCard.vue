<script setup lang="ts">
import type {AuthorListed} from '@randomstack/commons'
import {fileUrl} from '#services'

defineProps<{
  author: AuthorListed
}>()
</script>

<template>
  <aside class="author-card" aria-label="À propos de l'auteur">
    <div class="author-card__photo">
      <img
          v-if="author.photoId"
          :src="fileUrl(author.photoId)"
          :alt="author.displayName"
      />
      <span v-else class="author-card__initials">
        {{ author.displayName.substring(0, 2).toUpperCase() }}
      </span>
    </div>

    <div class="author-card__body">
      <p class="author-card__eyebrow">Auteur</p>
      <h2 class="author-card__name">{{ author.displayName }}</h2>
      <p v-if="author.bio" class="author-card__bio">{{ author.bio }}</p>
      <p v-else class="author-card__bio author-card__bio--empty">
        Biographie à venir.
      </p>
    </div>
  </aside>
</template>
