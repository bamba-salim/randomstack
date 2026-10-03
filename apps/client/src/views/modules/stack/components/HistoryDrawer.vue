<script setup lang="ts">
import type { DrawnStack } from '#services'

defineProps<{
  isOpen: boolean
  history: DrawnStack[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" @click="emit('close')" class="sidebar-overlay"></div>
    </Transition>

    <Transition name="slide">
      <aside v-if="isOpen" class="sidebar-panel">
        <div class="sidebar-header">
          <span class="sidebar-title">📜 Historique de session</span>
          <button @click="emit('close')" class="close-btn">Fermer ✕</button>
        </div>

        <div v-if="history.length > 0" class="history-list">
          <div v-for="(stack, index) in history" :key="index" class="history-row">
            <div class="row-header">
              <span>TIRAGE #{{ history.length - index }}</span>
              <span>{{ stack.timestamp }}</span>
            </div>
            <div class="summary-wrap">
              <div class="summary-item">
                <span>CLIENT:</span> {{ stack.clientLayer?.name }}
              </div>
              <div class="summary-item">
                <span>SERVEUR:</span> {{ stack.serverLayer?.name }}
              </div>
              <div class="summary-item">
                <span>BASE DE DONNÉES:</span> {{ stack.databaseLayer?.name }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          Aucun tirage réalisé.
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>