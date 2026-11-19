// ===== Mock 适配器 =====
// 作用：接管 axios 的真实网络请求，按 REST 风格返回数据。
// 好处是"接口调用代码完全不用改"，将来接真后端时只要去掉 adapter 即可。

import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResult } from '@/types/student'
import { CLASS_OPTIONS, MAJOR_OPTIONS } from '@/constants/options'
import {
  createStudent,
  delay,
  findStudent,
  queryStudents,
  removeStudent,
  updateStudent,
} from './db'

// 统一成功响应
function ok<T>(data: T): ApiResult<T> {
  return { code: 0, message: 'ok', data }
}

// 统一失败响应（code 不为 0 时，请求拦截器会弹提示）
function fail(code: number, message: string): ApiResult<null> {
  return { code, message, data: null }
}

// 幂等校验：同一份表单在 800ms 内重复提交视为重复请求
let lastSubmitKey = ''
let lastSubmitAt = 0

function isDuplicateSubmit(payload: unknown): boolean {
  const key = JSON.stringify(payload)
  const now = Date.now()
  const duplicate = key === lastSubmitKey && now - lastSubmitAt < 800
  lastSubmitKey = key
  lastSubmitAt = now
  return duplicate
}

export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  // 取出路径（去掉可能存在的 /api 前缀）与请求方法
  const url = (config.url ?? '').replace(/^\/api/, '')
  const method = (config.method ?? 'get').toLowerCase()
  const params = (config.params ?? {}) as Record<string, unknown>

  // 请求体：axios 在发送前会把对象序列化成 JSON 字符串
  let body: Record<string, unknown> = {}
  if (typeof config.data === 'string' && config.data) {
    body = JSON.parse(config.data) as Record<string, unknown>
  } else if (config.data && typeof config.data === 'object') {
    body = config.data as Record<string, unknown>
  }

  // 模拟网络耗时
  await delay(300)

  let result: ApiResult<unknown>

  // ---------- 字典接口 ----------
  if (method === 'get' && url === '/students/meta') {
    result = ok({ classes: CLASS_OPTIONS, majors: MAJOR_OPTIONS })
  }
  // ---------- 列表（分页 + 多条件） ----------
  else if (method === 'get' && url === '/students') {
    result = ok(
      queryStudents({
        keyword: String(params.keyword ?? ''),
        className: String(params.className ?? ''),
        status: String(params.status ?? '') as never,
        page: Number(params.page ?? 1),
        pageSize: Number(params.pageSize ?? 10),
      }),
    )
  }
  // ---------- 详情 ----------
  else if (method === 'get' && /^\/students\/\d+$/.test(url)) {
    const id = Number(url.split('/').pop())
    const student = findStudent(id)
    result = student ? ok(student) : fail(404, '该学生不存在或已被删除')
  }
  // ---------- 新增 ----------
  else if (method === 'post' && url === '/students') {
    try {
      if (isDuplicateSubmit(body)) {
        result = fail(409, '请勿重复提交')
      } else {
        result = ok(createStudent(body as never))
      }
    } catch (e) {
      result = fail(409, (e as Error).message)
    }
  }
  // ---------- 编辑 ----------
  else if (method === 'put' && /^\/students\/\d+$/.test(url)) {
    const id = Number(url.split('/').pop())
    try {
      result = ok(updateStudent(id, body as never))
    } catch (e) {
      result = fail(409, (e as Error).message)
    }
  }
  // ---------- 删除 ----------
  else if (method === 'delete' && /^\/students\/\d+$/.test(url)) {
    const id = Number(url.split('/').pop())
    try {
      removeStudent(id)
      result = ok(null)
    } catch (e) {
      result = fail(404, (e as Error).message)
    }
  }
  // ---------- 未匹配到的接口 ----------
  else {
    result = fail(404, `接口不存在：${method.toUpperCase()} ${url}`)
  }

  // 组装成 axios 标准的响应对象返回
  const response: AxiosResponse = {
    data: result,
    status: 200,
    statusText: 'OK',
    headers: {} as AxiosResponse['headers'],
    config,
  }
  return response
}
