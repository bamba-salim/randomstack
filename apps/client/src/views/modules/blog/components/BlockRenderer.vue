<script setup lang="ts">
import {computed} from 'vue'
import {type PostContentBlock, sanitizeHtml} from '@randomstack/commons'
import {fileUrl} from '#services'
import BlockRenderer from './BlockRenderer.vue'

const props = defineProps<{block: PostContentBlock}>()

const safeValue = computed(() => sanitizeHtml(props.block.value || ''))

const listLines = computed(() =>
    (props.block.value || '')
        .split('\n')
        .filter(l => l.trim() !== '')
        .map(line => sanitizeHtml(line))
)
</script>

<template>
  <!-- TEXTE (HTML sanitisé anti-XSS) -->
  <p v-if="block.type === 'TEXT'" class="blog-text-paragraph" v-html="safeValue"></p>

  <!-- TITRES -->
  <h2 v-else-if="block.type === 'H2'" class="blog-h2">{{ block.value }}</h2>
  <h3 v-else-if="block.type === 'H3'" class="blog-h3">{{ block.value }}</h3>

  <!-- CITATION -->
  <blockquote v-else-if="block.type === 'QUOTE'" class="blog-quote">
    "{{ block.value }}"
  </blockquote>

  <!-- NOTE DE LA RÉDACTION (NDLR) -->
  <div v-else-if="block.type === 'NDLR'" class="blog-ndlr">
    <span class="ndlr-badge">NDLR</span>
    <p class="ndlr-text">{{ block.value }}</p>
  </div>

  <!-- LISTES -->
  <ul v-else-if="block.type === 'LIST_UL'" class="blog-list ul">
    <li v-for="(line, i) in listLines" :key="i" v-html="line"></li>
  </ul>

  <ol v-else-if="block.type === 'LIST_OL'" class="blog-list ol">
    <li v-for="(line, i) in listLines" :key="i" v-html="line"></li>
  </ol>

  <!-- CODE SOURCE -->
  <div v-else-if="block.type === 'CODE'" class="blog-code-block">
    <div class="code-header">{{ block.language || 'Code' }}</div>
    <pre><code>{{ block.value }}</code></pre>
  </div>

  <!-- IMAGE -->
  <figure v-else-if="block.type === 'IMAGE'" class="blog-image-block">
    <img :src="fileUrl(block.value)" :alt="block.caption || 'Illustration'" draggable="false"/>
    <figcaption v-if="block.caption">{{ block.caption }}</figcaption>
  </figure>

  <!-- DOUBLE COLONNE RÉCURSIVE -->
  <div v-else-if="block.type === 'DOUBLE_CONTENT'" class="blog-double-column">
    <div class="column"><BlockRenderer v-if="block.left" :block="block.left"/></div>
    <div class="column"><BlockRenderer v-if="block.right" :block="block.right"/></div>
  </div>
</template>
