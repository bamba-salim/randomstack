<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  to?: string
  uppercase?: boolean
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav class="breadcrumb-nav" aria-label="Fil d'Ariane">
    <template v-for="(item, index) in items" :key="index">

      <!-- Lien cliquable pour les étapes intermédiaires -->
      <router-link
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          :class="{ uppercase: item.uppercase }"
      >
        {{ item.label }}
      </router-link>

      <!-- Étape courante (dernière étape, non cliquable) -->
      <span
          v-else
          class="current"
          :class="{ uppercase: item.uppercase }"
      >
        {{ item.label }}
      </span>

      <!-- Séparateur (sauf après le dernier élément) -->
      <span v-if="index < items.length - 1" class="separator">/</span>

    </template>
  </nav>
</template>