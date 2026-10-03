<script setup lang="ts">
withDefaults(
    defineProps<{
      currentPage: number
      totalPages: number
      totalCount?: number
      hideInfo?: boolean
      variant?: 'default' | 'top'
    }>(),
    {
      hideInfo: false,
      variant: 'default'
    }
)

defineEmits<{
  (e: 'change-page', page: number): void
}>()
</script>

<template>
  <nav
      v-if="totalPages > 1"
      :class="['pagination-container', { 'pagination-container--top': variant === 'top' }]"
      aria-label="Pagination"
  >
    <!-- Texte de pagination (masqué si hideInfo est true) -->
    <span v-if="!hideInfo" class="pagination-info">
      Page <strong>{{ currentPage }}</strong> sur {{ totalPages }}
      <template v-if="totalCount !== undefined"> ({{ totalCount }} éléments)</template>
    </span>

    <!-- Actions (poussées automatiquement à droite) -->
    <div class="pagination-actions">
      <button
          @click="$emit('change-page', currentPage - 1)"
          :disabled="currentPage === 1"
          class="page-btn"
      >
        Précédent
      </button>

      <button
          @click="$emit('change-page', currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
      >
        Suivant
      </button>
    </div>
  </nav>
</template>