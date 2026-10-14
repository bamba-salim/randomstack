<script setup lang="ts">
import {ref, watch} from 'vue'
import {toast} from '../../../../lib/toast'

const props = defineProps<{
  isOpen: boolean
  shareUrl: string
  title?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const copied = ref(false)

watch(
  () => props.isOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) copied.value = false
  }
)

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}

const copyLink = async () => {
  if (!props.shareUrl) return
  try {
    await navigator.clipboard.writeText(props.shareUrl)
    copied.value = true
    toast.success('Lien copié.')
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    toast.error('Impossible de copier le lien.')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="post-share-fade">
      <div
          v-if="isOpen"
          class="post-share-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="post-share-title"
          @click="emit('close')"
          @keydown="onKeydown"
      >
        <div class="post-share-modal" @click.stop>
          <header class="post-share-modal__header">
            <h3 id="post-share-title" class="post-share-modal__title">Partager l’article</h3>
            <button type="button" class="post-share-modal__close" aria-label="Fermer" @click="emit('close')">
              ✕
            </button>
          </header>

          <p v-if="title" class="post-share-modal__lead">{{ title }}</p>
          <p class="post-share-modal__hint">
            Lien permanent <code>/post/…</code> — reste valide même si le slug change.
          </p>

          <div class="post-share-links__copy">
            <input
                readonly
                :value="props.shareUrl"
                class="post-share-links__input"
                aria-label="Lien de partage"
                placeholder="Lien indisponible"
                @focus="($event.target as HTMLInputElement).select()"
            />
            <button
                type="button"
                class="post-share-links__copy-btn"
                :disabled="!props.shareUrl"
                @click="copyLink"
            >
              {{ copied ? 'Copié !' : 'Copier' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
