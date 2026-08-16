<script setup lang="ts">
import { ref } from 'vue'

// Définit le contrat réactif v-model bidirectionnel de Vue 3 🚀
const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const dragIndex = ref<number | null>(null)

// Ajouter un nouveau paragraphe vide
const addParagraph = () => {
  const updated = [...props.modelValue, '']
  emit('update:modelValue', updated)
}

// Supprimer un paragraphe
const removeParagraph = (index: number) => {
  const updated = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', updated)
}

// Mettre à jour la valeur d'un paragraphe spécifique
const updateParagraph = (index: number, text: string) => {
  const updated = [...props.modelValue]
  updated[index] = text
  emit('update:modelValue', updated)
}

// --- LOGIQUE DRAG & DROP HTML5 NATIVE 🚀 ---
const handleDragStart = (index: number) => {
  dragIndex.value = index
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault() // Requis pour autoriser le drop
}

const handleDrop = (index: number) => {
  if (dragIndex.value === null || dragIndex.value === index) return

  const updated = [...props.modelValue]
  const [draggedItem] = updated.splice(dragIndex.value, 1)

  if (draggedItem !== undefined) {
    updated.splice(index, 0, draggedItem) // Insère l'élément à sa nouvelle position
    emit('update:modelValue', updated)
  }

  dragIndex.value = null
}
</script>

<template>
  <div class="paragraph-manager-container">
    <label class="form-label">Histoire</label>

    <div class="paragraphs-list">
      <div
          v-for="(para, index) in (modelValue || [])"
          :key="index"
          class="paragraph-item"
          draggable="true"
          @dragstart="handleDragStart(index)"
          @dragover="handleDragOver"
          @drop="handleDrop(index)"
          :class="{ 'dragging': dragIndex === index }"
      >
        <!-- Poignée de glissement (Drag Handle) -->
        <span class="drag-handle">☰</span>

        <div class="item-index">#{{ index + 1 }}</div>

        <!-- Zone d'écriture du paragraphe -->
        <textarea
            :value="para"
            @input="updateParagraph(index, ($event.target as HTMLTextAreaElement).value)"
            placeholder="Rédigez le contenu de ce paragraphe..."
            class="form-textarea"
        ></textarea>

        <!-- Bouton de suppression -->
        <button
            type="button"
            @click="removeParagraph(index)"
            class="delete-para-btn"
            title="Supprimer ce paragraphe"
        >
          ✕
        </button>
      </div>

      <!-- État vide -->
      <div v-if="modelValue.length === 0" class="empty-paragraphs">
        Aucun paragraphe rédigé pour le moment. Cliquez sur le bouton ci-dessous pour commencer.
      </div>
    </div>

    <!-- Bouton d'ajout sémantique style arcade -->
    <button
        type="button"
        @click="addParagraph"
        class="add-para-btn"
    >
      + Ajouter un paragraphe
    </button>
  </div>
</template>