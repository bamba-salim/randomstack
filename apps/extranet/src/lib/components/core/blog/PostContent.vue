<script setup lang="ts">
import { ref } from 'vue'
import { FileService } from '#services'
import { type PostContentBlock, type BlockType } from '@randomstack/commons'

const block = defineModel<PostContentBlock>({ required: true })
const props = defineProps<{ isNested?: boolean }>()

// État local pour le Drag & Drop des colonnes 🚀
const draggedCol = ref<'left' | 'right' | null>(null)
const uniqueId = ref(Math.random().toString(36).substring(2, 9))

const update = (key: string, value: any) => {
  block.value = { ...block.value, [key]: value }
}

const updateNestedType = (col: 'left' | 'right', type: BlockType) => {
  block.value = { ...block.value, [col]: { type, value: '' } }
}

const updateNestedValue = (col: 'left' | 'right', key: string, value: any) => {
  if (block.value[col]) {
    block.value[col]![key as keyof PostContentBlock] = value
    // Force la mise à jour réactive
    block.value = { ...block.value }
  }
}

const insertTag = (start: string, end: string) => {
  const el = document.getElementById(`text-${uniqueId.value}`) as HTMLTextAreaElement
  if (!el) return
  const val = el.value
  const newVal = val.substring(0, el.selectionStart) + start + val.substring(el.selectionStart, el.selectionEnd) + end + val.substring(el.selectionEnd)
  update('value', newVal)
  setTimeout(() => el.focus(), 0)
}

const handleImageUpload = async (event: Event, col?: 'left' | 'right') => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const { url } = await FileService.uploadFile(file, 'image', 'post')
    if (col) {
      updateNestedValue(col, 'value', url)
    } else {
      update('value', url)
    }
  } catch {
    alert("Erreur lors de l'upload de l'image.")
  }
}

// --- LOGIQUE DE PERMUTATION DES COLONNES (SWAP) 🚀 ---
const handleNestedDragStart = (col: 'left' | 'right') => {
  draggedCol.value = col
}

const handleNestedDrop = (targetCol: 'left' | 'right') => {
  if (!draggedCol.value || draggedCol.value === targetCol) {
    draggedCol.value = null
    return
  }

  const sourceCol = draggedCol.value
  const newBlock = { ...block.value }

  // On permute le contenu des deux colonnes
  const temp = newBlock[sourceCol]
  newBlock[sourceCol] = newBlock[targetCol]
  newBlock[targetCol] = temp

  block.value = newBlock
  draggedCol.value = null
}
</script>

<template>
  <div class="w-full">

    <!-- 1. BLOC TEXTE -->
    <div v-if="block.type === 'TEXT'" class="w-full flex flex-col gap-2">
      <div class="formatting-toolbar w-25">
        <button type="button" @click="insertTag('<strong>', '</strong>')" class="format-btn font-bold">G</button>
        <button type="button" @click="insertTag('<u>', '</u>')" class="format-btn underline">S</button>
        <button type="button" @click="insertTag('<a href=\'URL\' target=\'_blank\'>', '</a>')" class="format-btn text-blue-600">Lien</button>
      </div>
      <textarea :id="`text-${uniqueId}`" :value="block.value" @input="update('value', ($event.target as HTMLTextAreaElement).value)" class="form-textarea" placeholder="Rédigez votre texte ici..."></textarea>
    </div>

    <!-- 2. BLOC CODE -->
    <div v-else-if="block.type === 'CODE'" class="w-full flex gap-2 flex-col">
      <input :value="block.language" @input="update('language', ($event.target as HTMLInputElement).value)" class="form-input-inline font-mono" placeholder="Langage (ex: javascript)" />
      <textarea :value="block.value" @input="update('value', ($event.target as HTMLTextAreaElement).value)" class="form-textarea font-mono bg-slate-900 text-emerald-400" placeholder="Collez votre code source..."></textarea>
    </div>

    <!-- 3. BLOC IMAGE (Full-Width) 🚀 -->
    <div v-else-if="block.type === 'IMAGE'" class="w-full">
      <div class="file-upload-zone">
        <img v-if="block.value" :src="`http://localhost:4000${block.value}`" class="image-preview" />
        <span v-else class="empty-image-text">Sélectionnez une image :</span>

        <input type="file" accept="image/*" @change="handleImageUpload($event)" class="file-input w-full" />
        <input :value="block.caption" @input="update('caption', ($event.target as HTMLInputElement).value)" class="form-input-inline w-full mt-2 !mb-0" placeholder="Légende de la photo (Optionnelle)" />
      </div>
    </div>

    <!-- 4. BLOC DOUBLE COLONNE (Avec le Drag & Drop réintégré !) 🚀 -->
    <div v-else-if="block.type === 'DOUBLE_CONTENT' && !isNested" class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">

      <!-- COLONNE GAUCHE -->
      <div
          class="nested-column-editor"
          draggable="true"
          @dragstart.stop="handleNestedDragStart('left')"
          @dragover.prevent
          @drop.stop="handleNestedDrop('left')"
          :class="{ 'nested-dragging': draggedCol === 'left' }"
      >
        <div class="column-header">
          <div class="flex items-center gap-1.5">
            <span class="column-drag-handle">☰</span>
            <span class="column-tag">GAUCHE</span>
          </div>
          <select :value="block.left?.type" @change="updateNestedType('left', ($event.target as HTMLSelectElement).value as BlockType)" class="form-select-mini">
            <option value="TEXT">TEXTE</option>
            <option value="IMAGE">IMAGE</option>
            <option value="CODE">CODE</option>
          </select>
        </div>
        <PostContent v-if="block.left" v-model="block.left" :is-nested="true" />
      </div>

      <!-- COLONNE DROITE -->
      <div
          class="nested-column-editor"
          draggable="true"
          @dragstart.stop="handleNestedDragStart('right')"
          @dragover.prevent
          @drop.stop="handleNestedDrop('right')"
          :class="{ 'nested-dragging': draggedCol === 'right' }"
      >
        <div class="column-header">
          <div class="flex items-center gap-1.5">
            <span class="column-drag-handle">☰</span>
            <span class="column-tag">DROITE</span>
          </div>
          <select :value="block.right?.type" @change="updateNestedType('right', ($event.target as HTMLSelectElement).value as BlockType)" class="form-select-mini">
            <option value="TEXT">TEXTE</option>
            <option value="IMAGE">IMAGE</option>
            <option value="CODE">CODE</option>
          </select>
        </div>
        <PostContent v-if="block.right" v-model="block.right" :is-nested="true" />
      </div>

    </div>
  </div>
</template>