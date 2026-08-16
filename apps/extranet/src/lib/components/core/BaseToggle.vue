<script setup lang="ts">
const model = defineModel<boolean>()

defineProps<{
  label: string
}>()
</script>

<template>
  <div class="toggle-container-admin">
    <span class="toggle-label">{{ label }}</span>
    <div
        @click="model = !model"
        :class="['switch', { 'checked': model }]"
    >
      <span :class="['switch-thumb', { 'checked': model }]"></span>
    </div>
  </div>
</template>