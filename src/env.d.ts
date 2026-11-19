/// <reference types="vite/client" />

// 让 TypeScript 认识 .vue 单文件组件
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

interface ImportMetaEnv {
  // 是否启用本地 mock 数据（默认启用，方便无后端时直接演示）
  readonly VITE_USE_MOCK?: string
  // 真实后端地址，接后端时在 .env 里覆盖
  readonly VITE_API_BASE?: string
}
