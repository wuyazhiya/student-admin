// 轻量的全局消息提示（toast），避免为了一个提示引入整套 UI 库
import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
}

// 全局共享的消息队列
export const toasts = reactive<ToastItem[]>([])

let seed = 0

// 弹出一条提示，2.4 秒后自动消失
export function notify(message: string, type: ToastType = 'info') {
  const id = ++seed
  toasts.push({ id, type, message })
  window.setTimeout(() => {
    const index = toasts.findIndex((t) => t.id === id)
    if (index > -1) toasts.splice(index, 1)
  }, 2400)
}
