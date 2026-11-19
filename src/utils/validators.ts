// ===== 表单校验规则 =====
// 全部规则集中在这一个文件：改规则只改这里，页面不散落 if-else。

import type { StudentPayload } from '@/types/student'

// 每个字段对应一条错误信息
export type FormErrors = Partial<Record<keyof StudentPayload, string>>

const PHONE_RE = /^1[3-9]\d{9}$/
const EMAIL_RE = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/
const STUDENT_NO_RE = /^\d{6,12}$/

// 校验整份表单，返回错误集合（为空对象表示通过）
export function validateStudent(form: StudentPayload): FormErrors {
  const errors: FormErrors = {}

  if (!form.studentNo.trim()) {
    errors.studentNo = '学号不能为空'
  } else if (!STUDENT_NO_RE.test(form.studentNo.trim())) {
    errors.studentNo = '学号应为 6~12 位数字'
  }

  if (!form.name.trim()) {
    errors.name = '姓名不能为空'
  } else if (form.name.trim().length > 20) {
    errors.name = '姓名不能超过 20 个字'
  }

  if (!PHONE_RE.test(form.phone.trim())) {
    errors.phone = '请输入正确的 11 位手机号'
  }

  if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = '邮箱格式不正确'
  }

  if (!form.className) errors.className = '请选择班级'
  if (!form.major) errors.major = '请选择专业'
  if (!form.enrolledAt) errors.enrolledAt = '请选择入学日期'
  else if (form.enrolledAt > new Date().toISOString().slice(0, 10)) {
    errors.enrolledAt = '入学日期不能晚于今天'
  }

  return errors
}
