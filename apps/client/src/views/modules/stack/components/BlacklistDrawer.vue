<script setup lang="ts">
import type { ExcludeTechnologyLite } from '#services'

defineProps<{
  isOpen: boolean
  groupedTechnologies: {
    CLIENT: ExcludeTechnologyLite[]
    SERVER: ExcludeTechnologyLite[]
    DATABASE: ExcludeTechnologyLite[]
  }
  blacklist: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggle', techId: string): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" @click="emit('close')" class="sidebar-overlay"></div>
    </Transition>

    <Transition name="slide-left">
      <aside v-if="isOpen" class="blacklist-panel">
        <div class="blacklist-header">
          <span class="blacklist-title">🚫 Exclusions de technologies</span>
          <button @click="emit('close')" class="close-btn">Fermer ✕</button>
        </div>

        <div class="blacklist-content">
          <!-- CLIENTS -->
          <div class="category-section">
            <span class="category-name">CLIENTS INTERFACES</span>
            <div class="tech-checkbox-grid">
              <div
                  v-for="tech in groupedTechnologies.CLIENT"
                  :key="tech.id"
                  @click="emit('toggle', tech.id)"
                  :class="['tech-checkbox-item', { 'blacklisted': blacklist.includes(tech.id) }]"
              >
                <span>{{ blacklist.includes(tech.id) ? '🔴' : '🟢' }}</span>
                <span class="truncate">{{ tech.name }}</span>
              </div>
            </div>
          </div>

          <!-- SERVEURS -->
          <div class="category-section">
            <span class="category-name">SERVEURS LOGIQUES</span>
            <div class="tech-checkbox-grid">
              <div
                  v-for="tech in groupedTechnologies.SERVER"
                  :key="tech.id"
                  @click="emit('toggle', tech.id)"
                  :class="['tech-checkbox-item', { 'blacklisted': blacklist.includes(tech.id) }]"
              >
                <span>{{ blacklist.includes(tech.id) ? '🔴' : '🟢' }}</span>
                <span class="truncate">{{ tech.name }}</span>
              </div>
            </div>
          </div>

          <!-- BASES DE DONNÉES -->
          <div class="category-section">
            <span class="category-name">BASES DE DONNÉES</span>
            <div class="tech-checkbox-grid">
              <div
                  v-for="tech in groupedTechnologies.DATABASE"
                  :key="tech.id"
                  @click="emit('toggle', tech.id)"
                  :class="['tech-checkbox-item', { 'blacklisted': blacklist.includes(tech.id) }]"
              >
                <span>{{ blacklist.includes(tech.id) ? '🔴' : '🟢' }}</span>
                <span class="truncate">{{ tech.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>