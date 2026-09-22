<script setup lang="ts">
import {ref} from 'vue'
import {FileService} from '#services'
import {type PostContentBlock, type BlockType, FILE_TYPE, TABLE, BLOCK_TYPE} from '@randomstack/commons'

const block = defineModel<PostContentBlock>({required: true})
const props = defineProps<{ isNested?: boolean }>()

// État local pour le Drag & Drop des colonnes 🚀
const draggedCol = ref<'left' | 'right' | null>(null)
const uniqueId = ref(Math.random().toString(36).substring(2, 9))

const update = (key: string, value: any) => {
  block.value = {...block.value, [key]: value}
}


const updateNestedType = (col: 'left' | 'right', type: BlockType) => {
  block.value = {...block.value, [col]: {type, value: ''}}
}

const updateNestedValue = (col: 'left' | 'right', key: string, value: any) => {
  if (block.value[col]) {
    block.value[col]![key as keyof PostContentBlock] = value
    // Force la mise à jour réactive
    block.value = {...block.value}
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

const insertList = (listType: 'ul' | 'ol') => {
  const el = document.getElementById(`text-${uniqueId.value}`) as HTMLTextAreaElement
  if (!el) return

  const val = el.value
  const start = el.selectionStart
  const end = el.selectionEnd
  const selectedText = val.substring(start, end)

  let replacement = ''

  if (selectedText.trim() === '') {
    replacement = `<${listType}>\n  <li>Élément 1</li>\n  <li>Élément 2</li>\n</${listType}>\n`
  } else {
    const lines = selectedText.split('\n').filter(line => line.trim() !== '')
    const listItems = lines.map(line => `  <li>${line}</li>`).join('\n')
    replacement = `<${listType}>\n${listItems}\n</${listType}>`
  }

  const newVal = val.substring(0, start) + replacement + val.substring(end)
  update('value', newVal)

  setTimeout(() => {
    el.focus()
    el.setSelectionRange(start, start + replacement.length)
  }, 0)
}

const handleImageUpload = async (event: Event, col?: 'left' | 'right') => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const {idFile} = await FileService.uploadFile(file, FILE_TYPE.IMAGE, TABLE.POST)

    if (col) {
      updateNestedValue(col, 'value', idFile)
    } else {
      update('value', idFile)
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
  const newBlock = {...block.value}

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
      <div class="formatting-toolbar w-auto">
        <button type="button" @click="insertTag('<strong>', '</strong>')" class="format-btn font-black" title="Gras">G</button>
        <button type="button" @click="insertTag('<u>', '</u>')" class="format-btn underline" title="Souligné">S</button>
        <button type="button" @click="insertTag('<i>', '</i>')" class="format-btn italic" title="Italique">I</button>
        <button type="button" @click="insertTag('<a href=\'URL\' target=\'_blank\'>', '</a>')" class="format-btn text-blue-600">Lien</button>

        <!-- Nouveaux boutons de listes 🚀 -->
        <span class="w-px h-4 bg-slate-300 mx-1"></span> <!-- Séparateur visuel -->
        <button type="button" @click="insertList('ul')" class="format-btn font-bold" title="Liste à puces">• Liste</button>
        <button type="button" @click="insertList('ol')" class="format-btn font-bold" title="Liste numérotée">1. Liste</button>
      </div>
      <textarea :id="`text-${uniqueId}`" :value="block.value"
                @input="update('value', ($event.target as HTMLTextAreaElement).value)" class="form-textarea"
                placeholder="Rédigez votre texte ici..."></textarea>
    </div>

    <!-- TITRES (H2 et H3) 🚀 -->
    <div v-else-if="block.type === 'H2'" class="w-full">
      <input :value="block.value" @input="update('value', ($event.target as HTMLInputElement).value)" class="form-input-inline text-xl font-black font-serif !mb-0 placeholder:font-normal" placeholder="Gros titre de section (Sera utilisé pour le Sommaire)..." />
    </div>
    <div v-else-if="block.type === 'H3'" class="w-full">
      <input :value="block.value" @input="update('value', ($event.target as HTMLInputElement).value)" class="form-input-inline text-lg font-bold !mb-0 placeholder:font-normal" placeholder="Sous-titre..." />
    </div>

    <!-- CITATION (QUOTE) 🚀 -->
    <div v-else-if="block.type === 'QUOTE'" class="w-full border-l-4 border-[#2271b1] bg-[#f0f6fc] p-2 rounded-r">
      <textarea :value="block.value" @input="update('value', ($event.target as HTMLTextAreaElement).value)" class="form-textarea bg-transparent border-none shadow-none italic font-serif text-slate-700 min-h-[80px]" placeholder="Saisissez une citation marquante..."></textarea>
    </div>

    <!-- NOTE DE LA RÉDACTION (NDLR) 🚀 -->
    <div v-else-if="block.type === 'NDLR'" class="w-full border border-amber-300 bg-amber-50 p-2 rounded">
      <div class="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1 px-2">Note de la rédaction (Invisible pour les utilisateurs standards)</div>
      <textarea :value="block.value" @input="update('value', ($event.target as HTMLTextAreaElement).value)" class="form-textarea bg-transparent border-none shadow-none text-amber-900 min-h-[80px]" placeholder="Rédigez la note de la rédaction ici..."></textarea>
    </div>

    <!-- LISTES (UL / OL) 🚀 -->
    <div v-else-if="block.type === 'LIST_UL' || block.type === 'LIST_OL'" class="w-full">
      <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Liste {{ block.type === 'LIST_UL' ? 'à puces' : 'numérotée' }} (Un élément par ligne)</div>
      <textarea :value="block.value" @input="update('value', ($event.target as HTMLTextAreaElement).value)" class="form-textarea leading-relaxed" placeholder="Élément 1&#10;Élément 2&#10;Élément 3..."></textarea>
    </div>

    <!-- 2. BLOC CODE -->
    <div v-else-if="block.type === 'CODE'" class="w-full flex gap-2 flex-col">
      <input :value="block.language" @input="update('language', ($event.target as HTMLInputElement).value)"
             class="form-input-inline font-mono" placeholder="Langage (ex: javascript)"/>
      <textarea :value="block.value" @input="update('value', ($event.target as HTMLTextAreaElement).value)"
                class="form-textarea font-mono bg-slate-900 text-emerald-400"
                placeholder="Collez votre code source..."></textarea>
    </div>

    <!-- 3. BLOC IMAGE (Full-Width) 🚀 -->
    <div v-else-if="block.type === 'IMAGE'" class="w-full">
      <div class="file-upload-zone">
        <img v-if="block.value" :src="`http://localhost:4000/api/files/${block.value}`" class="image-preview"/>
        <span v-else class="empty-image-text">Sélectionnez une image :</span>

        <input type="file" accept="image/*" @change="handleImageUpload($event)" class="file-input w-full"/>
        <input :value="block.caption" @input="update('caption', ($event.target as HTMLInputElement).value)" class="form-input-inline w-full mt-2 !mb-0" placeholder="Légende de la photo (Optionnelle)"/>
      </div>
    </div>

    <!-- 4. BLOC DOUBLE COLONNE (Avec le Drag & Drop réintégré !) 🚀 -->
    <div v-else-if="block.type === 'DOUBLE_CONTENT' && !isNested" class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">

      <!-- COLONNE GAUCHE -->
      <div class="nested-column-editor" draggable="true" @dragstart.stop="handleNestedDragStart('left')"
          @dragover.prevent
          @drop.stop="handleNestedDrop('left')"
          :class="{ 'nested-dragging': draggedCol === 'left' }"
      >
        <div class="column-header">
          <div class="flex items-center gap-1.5">
            <span class="column-drag-handle">☰</span>
            <span class="column-tag">GAUCHE</span>
          </div>
          <select :value="block.left?.type"
                  @change="updateNestedType('left', ($event.target as HTMLSelectElement).value as BlockType)"
                  class="form-select-mini">
            <option value="TEXT">TEXTE</option>
            <option value="H2">Titre H2</option>
            <option value="H3">Titre H3</option>
            <option value="LIST_UL">Liste Puces</option>
            <option value="LIST_OL">Liste Num.</option>
            <option value="QUOTE">Citation</option>
            <option value="NDLR">NDLR</option>
            <option value="IMAGE">IMAGE</option>
            <option value="CODE">CODE</option>
          </select>
        </div>
        <PostContent v-if="block.left" v-model="block.left" :is-nested="true"/>
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
          <select :value="block.right?.type"
                  @change="updateNestedType('right', ($event.target as HTMLSelectElement).value as BlockType)"
                  class="form-select-mini">
            <option value="TEXT">TEXTE</option>
            <option value="IMAGE">IMAGE</option>
            <option value="CODE">CODE</option>
          </select>
        </div>
        <PostContent v-if="block.right" v-model="block.right" :is-nested="true"/>
      </div>

    </div>
  </div>
</template>