<script setup lang="ts">
import { ref } from 'vue'
import { type PostContentBlock, type BlockType } from '@randomstack/commons'
import PostContent from './PostContent.vue'

const props = defineProps<{ modelValue: PostContentBlock[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: PostContentBlock[]): void }>()

const dragIndex = ref<number | null>(null)

const addBlock = (type: BlockType) => {
  let newBlock: PostContentBlock = { type, value: '' }
  if (type === 'DOUBLE_CONTENT') {
    newBlock = { type, value: '', left: {type: 'TEXT', value: ''}, right: {type: 'TEXT', value: ''} }
  }
  emit('update:modelValue', [...props.modelValue, newBlock])
}

const removeBlock = (index: number) => emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))

const handleDrop = (index: number) => {
  if (dragIndex.value === null) return
  const updated = [...props.modelValue]
  const [moved] = updated.splice(dragIndex.value, 1)
  updated.splice(index, 0, moved!)
  emit('update:modelValue', updated)
  dragIndex.value = null
}
</script>

<template>
  <div class="block-manager-container">
    <label class="form-label text-lg border-b border-slate-300 pb-2 mb-4 w-full block">CONSTRUCTEUR D'ARTICLE</label>

    <div class="blocks-list">
      <div v-for="(block, index) in modelValue" :key="index" class="block-item-row" draggable="true" @dragstart="dragIndex = index" @drop="handleDrop(index)" @dragover.prevent>
        <span class="global-drag-handle">☰</span>

        <div class="block-content-box">
          <PostContent v-model="modelValue[index]" />
        </div>

        <button type="button" @click="removeBlock(index)" class="delete-block-btn">✕</button>
      </div>
    </div>

    <div class="add-block-palette">
      <button type="button" @click="addBlock('TEXT')" class="add-palette-btn">+ Texte</button>
      <button type="button" @click="addBlock('IMAGE')" class="add-palette-btn">+ Image</button>
      <button type="button" @click="addBlock('CODE')" class="add-palette-btn">+ Code</button>
      <!-- Titraille 🚀 -->
      <button type="button" @click="addBlock('H2')" class="add-palette-btn font-bold">+ Titre H2</button>
      <button type="button" @click="addBlock('H3')" class="add-palette-btn font-bold">+ Titre H3</button>

      <!-- Listes & Éditorial 🚀 -->
      <button type="button" @click="addBlock('LIST_UL')" class="add-palette-btn">+ Liste Puces</button>
      <button type="button" @click="addBlock('LIST_OL')" class="add-palette-btn">+ Liste Num.</button>
      <button type="button" @click="addBlock('QUOTE')" class="add-palette-btn italic">+ Citation</button>

      <!-- TODO: add restrict use -->
      <button type="button" @click="addBlock('NDLR')" class="add-palette-btn bg-amber-50 text-amber-600 border-amber-200">+ NDLR</button>
      <button type="button" @click="addBlock('DOUBLE_CONTENT')" class="add-palette-btn double-btn">+ 2 Colonne</button>

    </div>
  </div>
</template>