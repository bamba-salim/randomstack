<script setup lang="ts">
import {ref, computed} from 'vue'
import {toast} from '../../../../lib/toast'

const props = defineProps<{
  isOpen: boolean
  shareCode: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const copiedSuccess = ref(false)

const shareLinkUrl = computed(() => {
  if (!props.shareCode) return ''
  return `${window.location.origin}/draft/${props.shareCode}`
})

const copyShareLink = async () => {
  if (!shareLinkUrl.value) return
  try {
    await navigator.clipboard.writeText(shareLinkUrl.value)
    copiedSuccess.value = true
    toast.success('Lien copié.')
    setTimeout(() => {
      copiedSuccess.value = false
    }, 2000)
  } catch {
    toast.error('Impossible de copier le lien.')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" @click="emit('close')" class="share-modal-overlay">
        <div class="share-modal-card" @click.stop>
          <span class="modal-icon">🔗</span>
          <h3 class="modal-title">Lien de partage généré !</h3>
          <p class="modal-info">
            Ce lien de partage restera valide pendant 7 jours avant d'être supprimé automatiquement par la maintenance BDD.
          </p>

          <div class="link-copy-box">
            <input
                readonly
                :value="shareLinkUrl"
                class="copy-input"
            />
            <button @click="copyShareLink" class="copy-btn">
              {{ copiedSuccess ? 'Copié !' : 'Copier' }}
            </button>
          </div>

          <button @click="emit('close')" class="close-modal-btn">Fermer</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>