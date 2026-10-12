<script setup lang="ts">
import Header from './Header.vue'
import Footer from './Footer.vue'
import {CookieBanner} from '#components'
</script>

<template>
  <div class="app-layout-wrapper">
    <Header/>

    <main class="app-main-content">
      <router-view/>
    </main>

    <Footer/>
    <CookieBanner/>
  </div>
</template>
