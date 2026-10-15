<script setup lang="ts">
const model = defineModel<string | number | null>()

defineProps<{
  label: string
  type?: 'text' | 'number' | 'url' | 'email' | 'password'
  placeholder?: string
  required?: boolean
  className?: string
  error?: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'clear-error'): void
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
        :disabled="disabled"
        :class="['form-input', {'form-input--invalid': Boolean(error)}]"
        @input="emit('clear-error')"
    />
    <p v-if="error" class="form-field-error">{{ error }}</p>
  </div>
</template>
