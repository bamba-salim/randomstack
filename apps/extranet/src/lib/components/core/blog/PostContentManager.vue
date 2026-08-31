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
      <button type="button" @click="addBlock('DOUBLE_CONTENT')" class="add-palette-btn double-btn">+ Double Colonne</button>
    </div>
  </div>
</template>