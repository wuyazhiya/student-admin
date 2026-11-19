<script setup lang="ts">
// 全局消息提示的渲染出口，配合 useToast 的 notify 使用
import { toasts } from '@/composables/useToast'
</script>

<template>
  <div class="toast-host">
    <TransitionGroup name="toast">
      <div v-for="item in toasts" :key="item.id" class="toast" :class="'toast--' + item.type">
        {{ item.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}

.toast {
  padding: 10px 20px;
  border-radius: 8px;
  background: var(--navy);
  color: #fff;
  font-size: 14px;
  box-shadow: 0 8px 24px rgba(27, 58, 87, 0.18);
}

.toast--success {
  background: var(--success);
}

.toast--error {
  background: var(--danger);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.24s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
