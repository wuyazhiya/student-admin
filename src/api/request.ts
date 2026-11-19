// ===== axios 统一封装 =====
// 所有接口都走这里：统一 baseURL、超时、错误提示、业务状态码处理。
// 页面里不再出现 try/catch + alert 的重复代码。

import axios from 'axios'
import type { ApiResult } from '@/types/student'
import { notify } from '@/composables/useToast'
import { mockAdapter } from '@/mock/adapter'

// 是否使用本地 mock：默认开启，配置 VITE_USE_MOCK=false 才走真实后端
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 8000,
  // 接真实后端时，把这一行删掉即可
  adapter: USE_MOCK ? mockAdapter : undefined,
})

// 请求拦截器：统一带上身份凭证
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('student-admin:token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器：把"业务失败"统一转成 reject，页面只关心成功数据
request.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResult<unknown>
    // code !== 0 表示业务失败（学号重复、数据不存在等）
    if (body && typeof body.code === 'number' && body.code !== 0) {
      notify(body.message || '操作失败', 'error')
      return Promise.reject(new Error(body.message || '操作失败'))
    }
    return response
  },
  (error) => {
    // 网络错误、超时、服务端 5xx 走这里
    const message =
      error.code === 'ECONNABORTED'
        ? '请求超时，请稍后重试'
        : error.response?.status === 500
          ? '服务器开小差了，请稍后重试'
          : '网络异常，请检查网络连接'
    notify(message, 'error')
    return Promise.reject(error)
  },
)
