<script setup lang="ts">
import {useToasts} from './toast'

const {toasts, dismiss} = useToasts()
</script>

<template>
  <Teleport to="body">
    <div class="toast-host" aria-live="polite" aria-relevant="additions">
      <TransitionGroup name="toast">
        <div
            v-for="item in toasts"
            :key="item.id"
            :class="['toast', `toast--${item.kind}`]"
            role="status"
        >
          <span class="toast__msg">{{ item.message }}</span>
          <button type="button" class="toast__close" aria-label="Fermer" @click="dismiss(item.id)">
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-host {
  position: fixed;
  z-index: 9999;
  right: 1rem;
  bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: min(22rem, calc(100vw - 2rem));
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid #c3c4c7;
  background: #fff;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
  font-size: 0.8125rem;
  line-height: 1.35;
  color: #1e1e1e;
}

.toast--success {
  border-left: 4px solid #00a32a;
}

.toast--error {
  border-left: 4px solid #d63638;
}

.toast--info {
  border-left: 4px solid #2271b1;
}

.toast__msg {
  flex: 1;
  min-width: 0;
}

.toast__close {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: #646970;
  cursor: pointer;
  font-size: 0.75rem;
  line-height: 1;
  padding: 0.1rem;
}

.toast__close:hover {
  color: #1e1e1e;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
</style>
