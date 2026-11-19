<script setup lang="ts">
// 通用确认弹窗：删除等不可逆操作前二次确认
withDefaults(
  defineProps<{
    open: boolean
    title?: string
    content?: string
    confirmText?: string
    loading?: boolean
  }>(),
  {
    title: '确认操作',
    content: '',
    confirmText: '确定',
    loading: false,
  },
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="open" class="mask" @click.self="emit('cancel')">
        <div class="dialog">
          <h3 class="dialog__title">{{ title }}</h3>
          <p class="dialog__content">{{ content }}</p>
          <div class="dialog__actions">
            <button class="btn btn--ghost" :disabled="loading" @click="emit('cancel')">取消</button>
            <button class="btn btn--primary" :disabled="loading" @click="emit('confirm')">
              {{ loading ? '处理中…' : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(20, 30, 42, 0.42);
  display: grid;
  place-items: center;
  z-index: 900;
}

.dialog {
  width: 380px;
  max-width: calc(100vw - 40px);
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 24px 60px rgba(15, 26, 38, 0.24);
}

.dialog__title {
  font-size: 16px;
  color: var(--ink);
  font-weight: 600;
}

.dialog__content {
  margin-top: 10px;
  font-size: 14px;
  color: var(--gray);
  line-height: 1.7;
}

.dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.18s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
