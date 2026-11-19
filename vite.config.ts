import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Vite 配置：Vue 插件、@ 路径别名、GitHub Pages 相对路径
export default defineConfig({
  // 用相对路径打包，部署到 GitHub Pages 的任何子目录都能直接访问
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      // 让 @ 指向 src，避免出现 ../../../ 这种难以维护的相对路径
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // 启动后不自动打开浏览器，方便在 CI 或远程环境运行
    open: false,
  },
})
