import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'

// 挂载应用：路由 + 全局样式
createApp(App).use(router).mount('#app')
