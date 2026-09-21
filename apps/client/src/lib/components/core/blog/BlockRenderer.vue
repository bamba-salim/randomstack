<script setup lang="ts">
import { type PostContentBlock } from '@randomstack/commons'

// Auto-importation pour la récursivité
import BlockRenderer from './BlockRenderer.vue'

defineProps<{
  block: PostContentBlock
}>()
</script>

<template>
  <!-- TEXTE (v-html pour interpréter le gras, souligné, liens) -->
  <p v-if="block.type === 'TEXT'" v-html="block.value" class="blog-text-paragraph"></p>

  <!-- CODE SOURCE -->
  <div v-else-if="block.type === 'CODE'" class="blog-code-block">
    <div class="code-header">{{ block.language || 'Code' }}</div>
    <pre><code>{{ block.value }}</code></pre>
  </div>

  <!-- IMAGE -->
  <figure v-else-if="block.type === 'IMAGE'" class="blog-image-block">
    <img :src="`http://localhost:4000/api/files/${block.value}`" :alt="block.caption || 'Illustration'" />
    <figcaption v-if="block.caption">{{ block.caption }}</figcaption>
  </figure>

  <!-- DOUBLE COLONNE RÉCURSIVE 🚀 -->
  <div v-else-if="block.type === 'DOUBLE_CONTENT'" class="blog-double-column">
    <div class="column">
      <BlockRenderer v-if="block.left" :block="block.left" />
    </div>
    <div class="column">
      <BlockRenderer v-if="block.right" :block="block.right" />
    </div>
  </div>
</template>