// ===== 学生模块的公共类型定义 =====

// 学籍状态：在读 / 已毕业 / 休学
export type StudentStatus = 'active' | 'graduated' | 'suspended'

// 性别
export type Gender = 'male' | 'female'

// 一条学生记录（与"后端"返回的字段保持一致）
export interface Student {
  id: number
  studentNo: string
  name: string
  gender: Gender
  className: string
  major: string
  phone: string
  email: string
  status: StudentStatus
  enrolledAt: string
  remark: string
  updatedAt: string
}

// 新增/编辑时提交的表单数据（不含 id 与更新时间）
export type StudentPayload = Omit<Student, 'id' | 'updatedAt'>

// 列表查询参数：多条件 + 分页
export interface StudentQuery {
  keyword: string
  className: string
  status: StudentStatus | ''
  page: number
  pageSize: number
}

// 分页结果的通用结构
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 后端统一响应体：code 为 0 表示成功
export interface ApiResult<T> {
  code: number
  message: string
  data: T
}
