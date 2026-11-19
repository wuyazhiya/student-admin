// ===== 学生接口 =====
// 页面只调用这里的方法，不直接写 URL，接口一改只动这一个文件。

import { request } from './request'
import type { ApiResult, PageResult, Student, StudentPayload, StudentQuery } from '@/types/student'

// 查询列表（分页 + 多条件）
export async function fetchStudents(query: StudentQuery): Promise<PageResult<Student>> {
  const res = await request.get<ApiResult<PageResult<Student>>>('/students', { params: query })
  return res.data.data
}

// 查询详情
export async function fetchStudent(id: number): Promise<Student> {
  const res = await request.get<ApiResult<Student>>(`/students/${id}`)
  return res.data.data
}

// 新增
export async function createStudent(payload: StudentPayload): Promise<Student> {
  const res = await request.post<ApiResult<Student>>('/students', payload)
  return res.data.data
}

// 编辑
export async function updateStudent(id: number, payload: StudentPayload): Promise<Student> {
  const res = await request.put<ApiResult<Student>>(`/students/${id}`, payload)
  return res.data.data
}

// 删除
export async function deleteStudent(id: number): Promise<void> {
  await request.delete<ApiResult<null>>(`/students/${id}`)
}
