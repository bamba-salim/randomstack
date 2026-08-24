<script setup lang="ts">
import { ref } from 'vue'
import { type PostContentBlock, type BlockType } from '@randomstack/commons'

const props = defineProps<{
  modelValue: PostContentBlock[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: PostContentBlock[]): void
}>()

const dragIndex = ref<number | null>(null)
const nestedDragSource = ref<{ index: number; column: 'left' | 'right' } | null>(null)

// Ajouter un bloc à l'article
const addBlock = (type: BlockType) => {
  let newBlock: PostContentBlock = { type, value: '' }

  if (type === 'DOUBLE_CONTENT') {
    newBlock = {
      type,
      value: '',
      left: { type: 'TEXT', value: '' },
      right: { type: 'TEXT', value: '' }
    }
  }

  const updated = [...props.modelValue, newBlock]
  emit('update:modelValue', updated)
}

// Supprimer un bloc principal
const removeBlock = (index: number) => {
  const updated = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', updated)
}

// Mettre à jour un bloc
const updateBlockValue = (index: number, value: string) => {
  const updated = [...props.modelValue]
  if (updated[index]) {
    updated[index].value = value
    emit('update:modelValue', updated)
  }
}

// Mettre à jour les options spécifiques d'un bloc (ex: langage d'un bloc code ou légende de photo)
const updateBlockMeta = (index: number, key: string, value: string) => {
  const updated = [...props.modelValue]
  if (updated[index]) {
    (updated[index] as any)[key] = value
    emit('update:modelValue', updated)
  }
}

// Mettre à jour les sous-blocs d'un DOUBLE_CONTENT
const updateNestedBlock = (index: number, column: 'left' | 'right', text: string) => {
  const updated = [...props.modelValue]
  if (updated[index] && updated[index][column]) {
    updated[index][column].value = text
    emit('update:modelValue', updated)
  }
}

const updateNestedType = (index: number, column: 'left' | 'right', type: string) => {
  const updated = [...props.modelValue]
  if (updated[index] && updated[index][column]) {
    updated[index][column].type = type
    emit('update:modelValue', updated)
  }
}

// --- LOGIQUE D'INJECTION DE FORMATAGE (GRAS, SOULIGNÉ, LIEN) PAR CURSEUR 🚀 ---
const insertTag = (idElement: string, indexBlock: number, startTag: string, endTag: string, column?: 'left' | 'right') => {
  const el = document.getElementById(idElement) as HTMLTextAreaElement
  if (!el) return

  const start = el.selectionStart
  const end = el.selectionEnd
  const text = el.value

  const selectedText = text.substring(start, end)
  const replacement = startTag + selectedText + endTag
  const updatedValue = text.substring(0, start) + replacement + text.substring(end)

  // On injecte la valeur formatée selon la position (colonne ou bloc principal)
  if (column) {
    updateNestedBlock(indexBlock, column, updatedValue)
  } else {
    updateBlockValue(indexBlock, updatedValue)
  }

  // Repositionnement du focus et de la sélection du curseur dans le textarea
  setTimeout(() => {
    el.focus()
    el.setSelectionRange(start + startTag.length, start + startTag.length + selectedText.length)
  }, 0)
}

// --- DRAG & DROP GLOBAL (RÉORDONNER LES BLOCS PRINCIPAUX) ---
const handleGlobalDragStart = (index: number) => {
  dragIndex.value = index
  nestedDragSource.value = null
}

const handleGlobalDrop = (index: number) => {
  if (dragIndex.value === null || dragIndex.value === index) return

  const updated = [...props.modelValue]
  const [draggedItem] = updated.splice(dragIndex.value, 1)

  if (draggedItem !== undefined) {
    updated.splice(index, 0, draggedItem)
    emit('update:modelValue', updated)
  }

  dragIndex.value = null
}

// --- DRAG & DROP LOCAL (PERMUTER LES DEUX COLONNES D'UN BLOC DOUBLE) 🔒 ---
const handleNestedDragStart = (index: number, column: 'left' | 'right') => {
  nestedDragSource.value = { index, column }
  dragIndex.value = null
}

const handleNestedDrop = (index: number, targetColumn: 'left' | 'right') => {
  if (!nestedDragSource.value || nestedDragSource.value.index !== index) return
  const sourceColumn = nestedDragSource.value.column

  if (sourceColumn === targetColumn) return

  const updated = [...props.modelValue]
  const block = updated[index]

  if (block) {
    const temp = block[sourceColumn]
    block[sourceColumn] = block[targetColumn]
    block[targetColumn] = temp
    emit('update:modelValue', updated)
  }

  nestedDragSource.value = null
}
</script>

<template>
  <div class="block-manager-container">
    <label class="form-label">Constructeur d'Article par Blocs réutilisables</label>

    <div class="blocks-list">
      <div
          v-for="(block, index) in modelValue"
          :key="index"
          class="block-item-row"
          draggable="true"
          @dragstart="handleGlobalDragStart(index)"
          @dragover.prevent
          @drop="handleGlobalDrop(index)"
          :class="{ 'dragging': dragIndex === index }"
      >
        <!-- Poignée globale de la ligne -->
        <span class="global-drag-handle">☰</span>
        <span class="block-number-tag">BLOC #{{ index + 1 }}</span>

        <!-- ÉDITION D'UN BLOC TEXTE STANDARD AVEC BARRE DE FORMATAGE 🚀 -->
        <div v-if="block.type === 'TEXT'" class="block-content-box text-field">
          <div class="flex items-center justify-between w-full mb-2">
            <span class="block-type-badge font-mono">TEXTE</span>

            <!-- BARRE DE FORMATAGE D'ÉDITION SÉMANTIQUE 🚀 -->
            <div class="formatting-toolbar">
              <button type="button" @click="insertTag(`text-${index}`, index, '<strong>', '</strong>')" title="Gras" class="format-btn font-bold">G</button>
              <button type="button" @click="insertTag(`text-${index}`, index, '<u>', '</u>')" title="Souligné" class="format-btn underline">S</button>
              <button type="button" @click="insertTag(`text-${index}`, index, '<a href=\'https://\' target=\'_blank\'>', '</a>')" title="Lien" class="format-btn italic">Lien</button>
            </div>
          </div>
          <textarea
              :id="`text-${index}`"
              :value="block.value"
              @input="updateBlockValue(index, ($event.target as HTMLTextAreaElement).value)"
              placeholder="Rédigez votre paragraphe de texte..."
              class="form-textarea"
          ></textarea>
        </div>

        <!-- ÉDITION D'UN BLOC DE CODE SOURCE -->
        <div v-else-if="block.type === 'CODE'" class="block-content-box code-field">
          <div class="flex items-center gap-3 mb-2">
            <span class="block-type-badge font-mono bg-purple-950/20 text-purple-400 border-purple-900">CODE</span>
            <input
                :value="block.language"
                @input="updateBlockMeta(index, 'language', ($event.target as HTMLInputElement).value)"
                placeholder="Langage (ex: typescript)"
                class="form-input-inline"
            />
          </div>
          <textarea
              :value="block.value"
              @input="updateBlockValue(index, ($event.target as HTMLTextAreaElement).value)"
              placeholder="Collez votre code source ici..."
              class="form-textarea font-mono bg-slate-950 text-emerald-400"
          ></textarea>
        </div>

        <!-- ÉDITION D'UN BLOC D'IMAGE -->
        <div v-else-if="block.type === 'IMAGE'" class="block-content-box image-field">
          <span class="block-type-badge font-mono bg-emerald-950/20 text-emerald-400 border-emerald-900">IMAGE</span>
          <input
              :value="block.value"
              @input="updateBlockValue(index, ($event.target as HTMLInputElement).value)"
              placeholder="Chemin d'image ou URL (ex: /public/uploads/post-...)"
              class="form-input mb-2"
          />
          <input
              :value="block.caption"
              @input="updateBlockMeta(index, 'caption', ($event.target as HTMLInputElement).value)"
              placeholder="Légende de la photo (optionnelle)"
              class="form-input"
          />
        </div>

        <!-- ÉDITION D'UN BLOC DOUBLE_CONTENT AVEC BARRES DE FORMATAGES 🔒 🚀 -->
        <div v-else-if="block.type === 'DOUBLE_CONTENT'" class="block-content-box double-field">
          <span class="block-type-badge font-mono bg-pink-950/20 text-pink-400 border-pink-900 mb-3">DOUBLE COLONNE</span>

          <div class="grid grid-cols-2 gap-4 w-full">

            <!-- COLONNE GAUCHE (LEFT) -->
            <div
                class="nested-column-editor"
                draggable="true"
                @dragstart.stop="handleNestedDragStart(index, 'left')"
                @dragover.prevent
                @drop.stop="handleNestedDrop(index, 'left')"
                :class="{ 'nested-dragging': nestedDragSource?.index === index && nestedDragSource?.column === 'left' }"
            >
              <div class="column-header">
                <span class="column-drag-handle">☰</span>
                <span class="column-tag">GAUCHE</span>

                <!-- Formatage local gauche -->
                <div v-if="block.left.type === 'TEXT'" class="formatting-toolbar scale-90">
                  <button type="button" @click="insertTag(`left-${index}`, index, '<strong>', '</strong>', 'left')" title="Gras" class="format-btn font-bold">G</button>
                  <button type="button" @click="insertTag(`left-${index}`, index, '<u>', '</u>', 'left')" title="Souligné" class="format-btn underline">S</button>
                  <button type="button" @click="insertTag(`left-${index}`, index, '<a href=\'https://\' target=\'_blank\'>', '</a>', 'left')" title="Lien" class="format-btn">Lien</button>
                </div>

                <select :value="block.left.type" @change="updateNestedType(index, 'left', ($event.target as HTMLSelectElement).value)" class="form-select-mini">
                  <option value="TEXT">TEXTE</option>
                  <option value="IMAGE">IMAGE</option>
                </select>
              </div>
              <textarea
                  v-if="block.left.type === 'TEXT'"
                  :id="`left-${index}`"
                  :value="block.left.value"
                  @input="updateNestedBlock(index, 'left', ($event.target as HTMLTextAreaElement).value)"
                  placeholder="Texte de gauche..."
                  class="form-textarea mt-2"
              ></textarea>
              <input
                  v-else
                  :value="block.left.value"
                  @input="updateNestedBlock(index, 'left', ($event.target as HTMLInputElement).value)"
                  placeholder="URL de l'image de gauche..."
                  class="form-input mt-2"
              />
            </div>

            <!-- COLONNE DROITE (RIGHT) -->
            <div
                class="nested-column-editor"
                draggable="true"
                @dragstart.stop="handleNestedDragStart(index, 'right')"
                @dragover.prevent
                @drop.stop="handleNestedDrop(index, 'right')"
                :class="{ 'nested-dragging': nestedDragSource?.index === index && nestedDragSource?.column === 'right' }"
            >
              <div class="column-header">
                <span class="column-drag-handle">☰</span>
                <span class="column-tag">DROITE</span>

                <!-- Formatage local droite -->
                <div v-if="block.right.type === 'TEXT'" class="formatting-toolbar scale-90">
                  <button type="button" @click="insertTag(`right-${index}`, index, '<strong>', '</strong>', 'right')" title="Gras" class="format-btn font-bold">G</button>
                  <button type="button" @click="insertTag(`right-${index}`, index, '<u>', '</u>', 'right')" title="Souligné" class="format-btn underline">S</button>
                  <button type="button" @click="insertTag(`right-${index}`, index, '<a href=\'https://\' target=\'_blank\'>', '</a>', 'right')" title="Lien" class="format-btn">Lien</button>
                </div>

                <select :value="block.right.type" @change="updateNestedType(index, 'right', ($event.target as HTMLSelectElement).value)" class="form-select-mini">
                  <option value="TEXT">TEXTE</option>
                  <option value="IMAGE">IMAGE</option>
                </select>
              </div>
              <textarea
                  v-if="block.right.type === 'TEXT'"
                  :id="`right-${index}`"
                  :value="block.right.value"
                  @input="updateNestedBlock(index, 'right', ($event.target as HTMLTextAreaElement).value)"
                  placeholder="Texte de droite..."
                  class="form-textarea mt-2"
              ></textarea>
              <input
                  v-else
                  :value="block.right.value"
                  @input="updateNestedBlock(index, 'right', ($event.target as HTMLInputElement).value)"
                  placeholder="URL de l'image de droite..."
                  class="form-input mt-2"
              />
            </div>

          </div>
        </div>

        <!-- Bouton de suppression du bloc principal -->
        <button
            type="button"
            @click="removeBlock(index)"
            class="delete-block-btn"
            title="Supprimer ce bloc"
        >
          ✕
        </button>
      </div>

      <!-- État vide -->
      <div v-if="modelValue.length === 0" class="empty-blocks-state">
        Aucun bloc de contenu créé. Utilisez les boutons ci-dessous pour composer votre article.
      </div>
    </div>

    <!-- Palette d'additions de blocs sémantiques -->
    <div class="add-block-palette">
      <button type="button" @click="addBlock('TEXT')" class="add-palette-btn">+ Paragraphe Texte</button>
      <button type="button" @click="addBlock('IMAGE')" class="add-palette-btn image-btn">+ Image / Photo</button>
      <button type="button" @click="addBlock('CODE')" class="add-palette-btn code-btn">+ Bloc Code</button>
      <button type="button" @click="addBlock('DOUBLE_CONTENT')" class="add-palette-btn double-btn">+ Double Colonne (Glisser-Déposer)</button>
    </div>
  </div>
</template>