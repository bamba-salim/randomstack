<script setup lang="ts">
const onContextMenu = (e: MouseEvent) => {
  const target = e.target as HTMLElement | null
  if (target?.closest?.('img')) {
    e.preventDefault()
  }
}
</script>

<template>
  <div class="app-root" @contextmenu="onContextMenu">
    <router-view/>
  </div>
</template>

<style>
.app-root img {
  -webkit-user-drag: none;
  user-select: none;
}
</style>
