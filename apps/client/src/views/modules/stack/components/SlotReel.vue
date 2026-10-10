<script setup lang="ts">
import { fileUrl, type DrawTechnologyLite } from '#services'

const props = withDefaults(
    defineProps<{
      label: string
      items: DrawTechnologyLite[]
      isLocked: boolean
      isSpinning: boolean
      delayClass?: string
      subtitleKey?: 'usage' | 'language'
    }>(),
    {
      delayClass: '',
      subtitleKey: 'usage'
    }
)

defineEmits<{
  (e: 'toggle-lock'): void
}>()
</script>

<template>
  <div class="reel-container">
    <!-- Bouton de verrouillage (Cadenas) -->
    <button
        @click="$emit('toggle-lock')"
        :class="['lock-btn', { 'locked': isLocked }]"
    >
      {{ isLocked ? '🔒' : '🔓' }}
      <span class="lock-label">{{ isLocked ? 'Bloqué' : 'Libre' }}</span>
    </button>

    <!-- Libellé du rouleau (CLIENT, SERVEUR, DONNÉES) -->
    <span class="reel-label">{{ label }}</span>

    <!-- Fenêtre de défilement -->
    <div class="reel-window">
      <div :class="['reel-strip', delayClass, { 'spinning': isSpinning && !isLocked }]">

        <!-- Éléments du rouleau -->
        <div v-for="tech in items" :key="tech.id" class="reel-item">
          <div class="tech-logo-placeholder">
            <img v-if="tech.logo" :src="fileUrl(tech.logo)" :alt="tech.name" />
            <span v-else>{{ tech.name.substring(0, 2) }}</span>
          </div>
          <div class="tech-details">
            <span class="tech-name">{{ tech.name }}</span>
            <span class="tech-sub">{{ tech[subtitleKey] }}</span>
          </div>
        </div>

        <!-- État initial -->
        <div v-if="items.length === 0" class="reel-item">
          <span class="status-ready">PRÊT</span>
        </div>

      </div>
    </div>
  </div>
</template>