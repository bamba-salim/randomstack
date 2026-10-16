<script setup lang="ts">
import {computed, ref} from 'vue'
import {useRouter} from 'vue-router'
import {fileUrl} from '#services'
import type {TechnologyCompatLite} from '@randomstack/commons'

const props = defineProps<{
  center: {id: string; name: string; slug: string; logo: string | null}
  nodes: TechnologyCompatLite[]
}>()

const router = useRouter()
const hoveredId = ref<string | null>(null)
const tooltip = ref<{name: string; left: string; top: string} | null>(null)

const W = 720
const H = 520
const CX = W / 2
const CY = H / 2

type LayoutItem = {
  node: TechnologyCompatLite
  x: number
  y: number
}

const layout = computed((): LayoutItem[] => {
  const items = props.nodes
  const n = items.length
  if (n === 0) return []

  const base = Math.min(W, H)
  const rings =
    n > 24
      ? [base * 0.24, base * 0.34, base * 0.44]
      : n > 10
        ? [base * 0.28, base * 0.42]
        : [base * 0.36]

  return items.map((node, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const radius = rings[i % rings.length]
    return {
      node,
      x: CX + radius * Math.cos(angle),
      y: CY + radius * Math.sin(angle)
    }
  })
})

const edgeColor = (kind: TechnologyCompatLite['kind']) => {
  if (kind === 'RECOMMENDED') return '#0ea5e9'
  if (kind === 'WORKS_WITH') return '#64748b'
  return '#e11d48'
}

const showTooltip = (item: LayoutItem) => {
  hoveredId.value = item.node.id
  tooltip.value = {
    name: item.node.name,
    left: `${(item.x / W) * 100}%`,
    top: `${(item.y / H) * 100}%`
  }
}

const hideTooltip = () => {
  hoveredId.value = null
  tooltip.value = null
}

const goTo = (slug: string) => {
  router.push(`/technology/${slug}`)
}
</script>

<template>
  <div class="tech-compat-graph" role="img" :aria-label="`Cartographie des compatibilités de ${center.name}`">
    <svg :viewBox="`0 0 ${W} ${H}`" class="tech-compat-graph__svg">
      <line
          v-for="item in layout"
          :key="`e-${item.node.id}`"
          :x1="CX"
          :y1="CY"
          :x2="item.x"
          :y2="item.y"
          :stroke="edgeColor(item.node.kind)"
          :stroke-width="hoveredId === item.node.id ? 2.5 : 1.25"
          :stroke-opacity="hoveredId && hoveredId !== item.node.id ? 0.2 : 0.8"
          :stroke-dasharray="item.node.kind === 'WORKS_WITH' ? '4 3' : undefined"
      />

      <!-- Centre -->
      <g class="tech-compat-graph__center">
        <circle :cx="CX" :cy="CY" r="36" class="tech-compat-graph__center-ring"/>
        <foreignObject :x="CX - 28" :y="CY - 28" width="56" height="56">
          <div class="tech-compat-graph__avatar tech-compat-graph__avatar--center">
            <img v-if="center.logo" :src="fileUrl(center.logo)" :alt="center.name"/>
            <span v-else>{{ center.name.substring(0, 2) }}</span>
          </div>
        </foreignObject>
        <text :x="CX" :y="CY + 52" text-anchor="middle" class="tech-compat-graph__label tech-compat-graph__label--center">
          {{ center.name }}
        </text>
      </g>

      <!-- Voisins : logo visible, nom en tooltip stylé -->
      <g
          v-for="item in layout"
          :key="`n-${item.node.id}`"
          class="tech-compat-graph__node"
          @mouseenter="showTooltip(item)"
          @mouseleave="hideTooltip"
          @click="goTo(item.node.slug)"
      >
        <circle
            :cx="item.x"
            :cy="item.y"
            r="28"
            :class="[
              'tech-compat-graph__node-ring',
              `tech-compat-graph__node-ring--${item.node.kind.toLowerCase()}`
            ]"
        />
        <foreignObject :x="item.x - 22" :y="item.y - 22" width="44" height="44">
          <div class="tech-compat-graph__avatar">
            <img v-if="item.node.logo" :src="fileUrl(item.node.logo)" :alt="item.node.name" loading="lazy"/>
            <span v-else>{{ item.node.name.substring(0, 2) }}</span>
          </div>
        </foreignObject>
      </g>
    </svg>

    <div
        v-if="tooltip"
        class="tech-compat-graph__tooltip"
        :style="{left: tooltip.left, top: tooltip.top}"
    >
      {{ tooltip.name }}
    </div>
  </div>
</template>
