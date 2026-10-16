<script setup lang="ts">
import {computed} from 'vue'
import {useRouter} from 'vue-router'
import {AdSlot} from '#components'
import {getHouseAd, type AdPlacement} from '../../../lib/ads/ads.config'

const router = useRouter()

const hasAdSlot = (placement: AdPlacement) =>
  Boolean(getHouseAd(placement) || import.meta.env.DEV)

const showLeftRail = computed(() => hasAdSlot('about-rail-left'))
const showRightRail = computed(() => hasAdSlot('about-rail-right'))

const shellClass = computed(() => [
  'about-page__shell',
  showLeftRail.value && 'about-page__shell--left',
  showRightRail.value && 'about-page__shell--right'
])
</script>

<template>
  <main class="about-page container-catalog py-8">
    <div :class="shellClass">
      <aside v-if="showLeftRail" class="about-page__rail about-page__rail--left" aria-label="Publicité">
        <AdSlot placement="about-rail-left" variant="rail"/>
      </aside>

      <div class="about-page__column">
        <header class="page-header page-header--flush">
          <p class="page-subtitle">À propos</p>
          <h1 class="page-title">RANDOMSTACK</h1>
          <p class="about-page__lead">
            Le générateur de tech stacks pour développeurs indécis.
          </p>
        </header>

        <AdSlot placement="about-header" variant="banner" class="about-page__banner"/>

        <div class="about-page__body">
          <section class="about-page__section">
            <h2 class="about-page__heading">Pourquoi ça existe</h2>
            <p>
              Choisir un front, un back et une base de données prend parfois plus de temps que de coder.
              Randomstack tire une combinaison pour toi — tu gardes ce qui te plaît, tu exclues le reste,
              et tu explores l’écosystème sans te perdre dans les comparatifs.
            </p>
          </section>

          <section class="about-page__section">
            <h2 class="about-page__heading">Ce que tu peux faire</h2>
            <ul class="about-page__list">
              <li>
                <strong>Générateur</strong> — tirage aléatoire, cadenas par couche, blacklist, historique de session, lien de partage.
              </li>
              <li>
                <strong>Encyclopédie</strong> — fiches technos (usage, versions, liens) pour comprendre ce que tu tires.
              </li>
              <li>
                <strong>Blog</strong> — actualités et articles autour de la stack web.
              </li>
            </ul>
          </section>

          <section class="about-page__section">
            <h2 class="about-page__heading">Comment ça marche</h2>
            <p>
              Chaque tirage combine des technologies actives (client, serveur, base).
              Tu peux verrouiller une couche, exclure des outils, rejouer, puis partager le résultat
              pendant quelques jours via un lien court.
            </p>
          </section>

          <div class="about-page__actions">
            <button type="button" class="btn btn--primary" @click="router.push('/draft')">
              Lancer le générateur
            </button>
            <button type="button" class="btn btn--secondary" @click="router.push('/encyclopedia')">
              Voir l’encyclopédie
            </button>
          </div>

          <AdSlot placement="about-footer" variant="banner" class="about-page__banner"/>
        </div>
      </div>

      <aside v-if="showRightRail" class="about-page__rail about-page__rail--right" aria-label="Publicité">
        <AdSlot placement="about-rail-right" variant="rail"/>
      </aside>
    </div>
  </main>
</template>
