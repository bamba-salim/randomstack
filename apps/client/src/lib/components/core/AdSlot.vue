<script setup lang="ts">
import {computed} from 'vue'
import {getHouseAd, type AdPlacement} from '../../ads/ads.config'

const props = withDefaults(
    defineProps<{
      placement: AdPlacement
      /** Variante visuelle */
      variant?: 'card' | 'banner' | 'rail'
    }>(),
    {variant: 'card'}
)

const ad = computed(() => getHouseAd(props.placement))
const showPlaceholder = computed(() => !ad.value && import.meta.env.DEV)
</script>

<template>
  <aside
      v-if="ad || showPlaceholder"
      class="ad-slot"
      :class="[`ad-slot--${variant}`, `ad-slot--${placement}`]"
      aria-label="Publicité"
  >
    <span class="ad-slot__label">Sponsorisé</span>

    <a
        v-if="ad"
        class="ad-slot__link"
        :href="ad.href"
        :title="ad.title"
        target="_blank"
        rel="noopener noreferrer sponsored"
    >
      <img class="ad-slot__image" :src="ad.imageUrl" :alt="ad.title" loading="lazy"/>
      <span v-if="ad.sponsor" class="ad-slot__sponsor">{{ ad.sponsor }}</span>
    </a>

    <div v-else class="ad-slot__placeholder">
      <span>Emplacement pub — {{ placement }}</span>
      <span class="ad-slot__hint">Édite <code>lib/ads/ads.config.ts</code></span>
    </div>
  </aside>
</template>
