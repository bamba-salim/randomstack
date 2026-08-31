<script setup lang="ts">
const model = defineModel<string | number | null>()

defineProps<{
  label: string
  type?: 'text' | 'number' | 'url'
  placeholder?: string
  required?: boolean
  className?: string
}>()

</script>

<template>
  <div :class="['form-group', className]">
    <label class="form-label">{{ label }}</label>
    <input
        v-model="model"
        :type="type || 'text'"
        :required="required"
        :placeholder="placeholder"
        class="form-input"
    />
  </div>
</template>