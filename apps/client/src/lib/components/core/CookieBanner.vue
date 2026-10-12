<script setup lang="ts">
import {ref, onMounted} from 'vue'

const STORAGE_KEY = 'rs_cookie_consent'
const visible = ref(false)

onMounted(() => {
  try {
    visible.value = localStorage.getItem(STORAGE_KEY) !== 'accepted'
  } catch {
    visible.value = true
  }
})

const accept = () => {
  try {
    localStorage.setItem(STORAGE_KEY, 'accepted')
  } catch {
    /* private mode */
  }
  visible.value = false
}
</script>

<template>
  <div
    v-if="visible"
    class="cookie-banner"
    role="dialog"
    aria-live="polite"
    aria-label="Information cookies"
  >
    <p class="cookie-banner__text">
      Ce site utilise des cookies essentiels (session, tirage de stack).
      Les espaces sponsorisés sont des liens partenaires, sans cookies publicitaires tiers.
    </p>
    <button type="button" class="btn btn--primary cookie-banner__btn" @click="accept">
      Compris
    </button>
  </div>
</template>
