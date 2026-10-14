<script setup lang="ts">
import {ref, computed} from 'vue'
import {toast} from '../../../../lib/toast'

const props = defineProps<{
  shareUrl: string
  title?: string
  summary?: string
}>()

const copied = ref(false)

const encodedUrl = computed(() => encodeURIComponent(props.shareUrl || ''))
const encodedTitle = computed(() => encodeURIComponent(props.title || ''))
const shareText = computed(() => {
  const t = props.title || 'RandomStack'
  const s = props.summary?.trim()
  return s ? `${t} — ${s}` : t
})
const encodedText = computed(() => encodeURIComponent(shareText.value))
const encodedWhatsApp = computed(() =>
  encodeURIComponent(`${shareText.value}\n${props.shareUrl}`)
)

const networks = computed(() => [
  {
    id: 'x',
    label: 'X',
    href: `https://twitter.com/intent/tweet?url=${encodedUrl.value}&text=${encodedTitle.value}`
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl.value}`
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    href: `https://wa.me/?text=${encodedWhatsApp.value}`
  },
  {
    id: 'telegram',
    label: 'Telegram',
    href: `https://t.me/share/url?url=${encodedUrl.value}&text=${encodedTitle.value}`
  },
  {
    id: 'reddit',
    label: 'Reddit',
    href: `https://www.reddit.com/submit?url=${encodedUrl.value}&title=${encodedTitle.value}`
  },
  {
    id: 'email',
    label: 'E-mail',
    href: `mailto:?subject=${encodedTitle.value}&body=${encodedText.value}%0A%0A${encodedUrl.value}`
  }
])

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
  <div class="post-share-links">
    <div class="post-share-links__copy">
      <input
          readonly
          :value="shareUrl"
          class="post-share-links__input"
          aria-label="Lien de partage"
          @focus="($event.target as HTMLInputElement).select()"
      />
      <button type="button" class="post-share-links__copy-btn" @click="copyLink">
        {{ copied ? 'Copié !' : 'Copier' }}
      </button>
    </div>

    <p class="post-share-links__label">Partager sur</p>
    <ul class="post-share-links__networks">
      <li v-for="net in networks" :key="net.id">
        <a
            :href="net.href"
            class="post-share-links__net"
            :class="`post-share-links__net--${net.id}`"
            :title="net.label"
            :aria-label="net.label"
            target="_blank"
            rel="noopener noreferrer"
        >
          <!-- X -->
          <svg v-if="net.id === 'x'" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.259 5.672L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
          </svg>
          <!-- Facebook -->
          <svg v-else-if="net.id === 'facebook'" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.48h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z"/>
          </svg>
          <!-- LinkedIn -->
          <svg v-else-if="net.id === 'linkedin'" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22 2H2v20h20V2z"/>
          </svg>
          <!-- WhatsApp -->
          <svg v-else-if="net.id === 'whatsapp'" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"/>
            <path d="M12.04 2C6.5 2 2.01 6.49 2.01 12c0 1.77.46 3.45 1.28 4.92L2 22l5.21-1.37A9.96 9.96 0 0 0 12.04 22C17.56 22 22 17.51 22 12S17.56 2 12.04 2zm0 18.2c-1.58 0-3.05-.43-4.32-1.18l-.31-.18-3.09.81.83-3.01-.2-.32A8.17 8.17 0 0 1 3.84 12c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2z"/>
          </svg>
          <!-- Telegram -->
          <svg v-else-if="net.id === 'telegram'" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M11.94 2C6.48 2 2.05 6.43 2.05 11.89c0 1.75.46 3.4 1.26 4.83L2 22l5.42-1.42a9.84 9.84 0 0 0 4.52 1.1h.01c5.46 0 9.89-4.43 9.89-9.89S17.4 2 11.94 2zm5.76 7.18-1.92 9.05c-.14.64-.52.8-1.05.5l-2.9-2.14-1.4 1.35c-.16.16-.29.29-.59.29l.21-2.98 5.42-4.9c.24-.21-.05-.33-.37-.12l-6.7 4.22-2.88-.9c-.63-.2-.64-.63.13-.93l11.26-4.34c.52-.19.98.13.79.9z"/>
          </svg>
          <!-- Reddit -->
          <svg v-else-if="net.id === 'reddit'" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.07 10.91c.02.13.03.26.03.39 0 2.03-2.36 3.68-5.27 3.68-2.91 0-5.27-1.65-5.27-3.68 0-.13.01-.26.03-.39A1.64 1.64 0 0 1 6.5 9.9c.9 0 1.65.73 1.65 1.64 0 .1-.01.2-.03.29A4.7 4.7 0 0 1 12 10.7c1.4 0 2.65.45 3.61 1.14-.02-.1-.03-.2-.03-.3 0-.9.74-1.63 1.64-1.63.9 0 1.64.73 1.64 1.64 0 .4-.14.76-.37 1.04-.06.07-.12.13-.19.18-.06.05-.12.09-.19.12-.1.05-.2.07-.31.07-.05 0-.1 0-.15-.01zm-7.71.84c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm5.56 2.39c-.55.55-1.58.73-2.92.73s-2.37-.18-2.92-.73a.37.37 0 0 1 0-.53.37.37 0 0 1 .53 0c.37.37 1.18.53 2.39.53s2.02-.16 2.39-.53a.37.37 0 0 1 .53 0c.14.15.14.39 0 .53zm-.28-1.39c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
          </svg>
          <!-- Email -->
          <svg v-else viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="5" width="18" height="14" rx="2"/>
            <path d="M3 7l9 7 9-7"/>
          </svg>
        </a>
      </li>
    </ul>
  </div>
</template>
