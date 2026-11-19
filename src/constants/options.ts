// 下拉/单选项的字典，集中维护，页面与 mock 数据共用
import type { Gender, StudentStatus } from '@/types/student'

export const CLASS_OPTIONS = ['计科2301', '计科2302', '人工智能2301', '人工智能2302', '软件2301']

export const MAJOR_OPTIONS = [
  '计算机科学与技术',
  '人工智能',
  '软件工程',
  '数据科学与大数据技术',
]

export const STATUS_OPTIONS: { label: string; value: StudentStatus }[] = [
  { label: '在读', value: 'active' },
  { label: '已毕业', value: 'graduated' },
  { label: '休学', value: 'suspended' },
]

export const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

// 状态 → 中文，用于列表标签与详情展示
export const STATUS_LABEL: Record<StudentStatus, string> = {
  active: '在读',
  graduated: '已毕业',
  suspended: '休学',
}

// 状态 → 标签配色（配合 main.css 中的 .tag--{status}）
export const STATUS_TONE: Record<StudentStatus, string> = {
  active: 'success',
  graduated: 'info',
  suspended: 'warning',
}

export const GENDER_LABEL: Record<Gender, string> = {
  male: '男',
  female: '女',
}
