<script setup lang="ts">
import { ref, computed } from 'vue'

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

const copyShareLink = () => {
  if (!shareLinkUrl.value) return
  navigator.clipboard.writeText(shareLinkUrl.value).then(() => {
    copiedSuccess.value = true
    setTimeout(() => {
      copiedSuccess.value = false
    }, 2000)
  })
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