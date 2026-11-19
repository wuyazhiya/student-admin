// ===== 表单字段配置 =====
// 列表页、表单页、详情页都读这一份配置：
// 新增一个字段只需要在这里加一行，不用去三个页面各改一遍。

import type { StudentPayload } from '@/types/student'
import {
  CLASS_OPTIONS,
  GENDER_OPTIONS,
  MAJOR_OPTIONS,
  STATUS_OPTIONS,
} from './options'

export type FieldType = 'text' | 'select' | 'radio' | 'date' | 'textarea'

export interface FieldConfig {
  key: keyof StudentPayload
  label: string
  type: FieldType
  placeholder?: string
  // 选择类字段的候选项
  options?: { label: string; value: string }[]
  // 表单栅格占几列（1 或 2）
  span: 1 | 2
  // 详情页展示时的格式化方式
  format?: (value: StudentPayload[keyof StudentPayload]) => string
}

export const studentFields: FieldConfig[] = [
  { key: 'studentNo', label: '学号', type: 'text', placeholder: '如 20231001', span: 1 },
  { key: 'name', label: '姓名', type: 'text', placeholder: '请输入真实姓名', span: 1 },
  { key: 'gender', label: '性别', type: 'radio', options: GENDER_OPTIONS, span: 1 },
  { key: 'status', label: '学籍状态', type: 'select', options: STATUS_OPTIONS, span: 1 },
  {
    key: 'className',
    label: '班级',
    type: 'select',
    span: 1,
    options: CLASS_OPTIONS.map((v) => ({ label: v, value: v })),
  },
  {
    key: 'major',
    label: '专业',
    type: 'select',
    span: 1,
    options: MAJOR_OPTIONS.map((v) => ({ label: v, value: v })),
  },
  { key: 'phone', label: '手机号', type: 'text', placeholder: '11 位手机号', span: 1 },
  { key: 'email', label: '邮箱', type: 'text', placeholder: 'name@example.com', span: 1 },
  { key: 'enrolledAt', label: '入学日期', type: 'date', span: 1 },
  { key: 'remark', label: '备注', type: 'textarea', placeholder: '选填，如担任职务、获奖情况', span: 2 },
]
