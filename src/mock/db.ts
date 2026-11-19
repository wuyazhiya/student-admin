// ===== 本地数据层 =====
// 真实项目里这一层在服务端（JSP + MySQL）；这里用 localStorage 模拟，
// 让项目在没有后端的情况下也能完整演示：增、删、改、查、分页、多条件筛选。

import type { PageResult, Student, StudentPayload, StudentQuery } from '@/types/student'
import { CLASS_OPTIONS, MAJOR_OPTIONS } from '@/constants/options'

// 存储键名，加版本号方便以后数据结构升级时做迁移
const STORAGE_KEY = 'student-admin:db:v1'

// 生成初始数据的素材
const SURNAMES = ['李', '王', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙']
const GIVEN = ['子涵', '雨桐', '浩然', '思远', '嘉怡', '明轩', '若曦', '宇航', '静怡', '博文', '欣蕾', '俊杰']

// 生成一份固定的初始数据（不用随机，保证每次打开看到的一样）
function createSeed(): Student[] {
  const list: Student[] = []
  for (let i = 0; i < 46; i++) {
    const name = SURNAMES[i % SURNAMES.length] + GIVEN[(i * 5) % GIVEN.length]
    const className = CLASS_OPTIONS[i % CLASS_OPTIONS.length]
    const major = MAJOR_OPTIONS[i % MAJOR_OPTIONS.length]
    const status = i % 11 === 0 ? 'graduated' : i % 13 === 0 ? 'suspended' : 'active'
    list.push({
      id: i + 1,
      studentNo: `2023${String(1001 + i)}`,
      name,
      gender: i % 3 === 0 ? 'female' : 'male',
      className,
      major,
      phone: `138${String(10000000 + i * 137).slice(0, 8)}`,
      email: `stu${2023}${1001 + i}@example.com`,
      status,
      enrolledAt: `2023-09-0${(i % 9) + 1}`,
      remark: i % 7 === 0 ? '担任班级学习委员' : '',
      updatedAt: new Date(2025, 8, 1 + (i % 27), 9, (i * 7) % 60).toISOString(),
    })
  }
  return list
}

// 读取数据；第一次访问时写入初始数据
export function readAll(): Student[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = createSeed()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
  try {
    return JSON.parse(raw) as Student[]
  } catch {
    // 数据被手动改坏时重新初始化，避免整个页面白屏
    const seed = createSeed()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
}

// 覆盖写入
function writeAll(list: Student[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

// 模拟网络延迟，让加载态、防重复提交等交互能真实被看到
export function delay(ms = 320): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 分页 + 多条件查询（关键字命中 学号 / 姓名 / 手机号）
export function queryStudents(q: StudentQuery): PageResult<Student> {
  const all = readAll()
  const keyword = q.keyword.trim().toLowerCase()

  const filtered = all.filter((s) => {
    // 关键字：学号、姓名、手机号任意一个包含即可
    const hitKeyword =
      !keyword ||
      s.studentNo.toLowerCase().includes(keyword) ||
      s.name.toLowerCase().includes(keyword) ||
      s.phone.includes(keyword)
    // 班级精确匹配
    const hitClass = !q.className || s.className === q.className
    // 状态精确匹配
    const hitStatus = !q.status || s.status === q.status
    return hitKeyword && hitClass && hitStatus
  })

  // 按更新时间倒序，最新的改动排在前面
  filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const start = (q.page - 1) * q.pageSize
  return {
    list: filtered.slice(start, start + q.pageSize),
    total: filtered.length,
    page: q.page,
    pageSize: q.pageSize,
  }
}

// 按 id 查单条
export function findStudent(id: number): Student | undefined {
  return readAll().find((s) => s.id === id)
}

// 新增：学号唯一 + 返回新记录
export function createStudent(payload: StudentPayload): Student {
  const all = readAll()
  if (all.some((s) => s.studentNo === payload.studentNo)) {
    throw new Error('学号已存在，请检查后重新填写')
  }
  // 用当前最大 id + 1，避免删除后 id 重复
  const id = all.reduce((max, s) => Math.max(max, s.id), 0) + 1
  const record: Student = { ...payload, id, updatedAt: new Date().toISOString() }
  writeAll([record, ...all])
  return record
}

// 更新：学号不能与其他记录重复
export function updateStudent(id: number, payload: StudentPayload): Student {
  const all = readAll()
  const index = all.findIndex((s) => s.id === id)
  if (index === -1) throw new Error('该学生不存在或已被删除')
  if (all.some((s) => s.studentNo === payload.studentNo && s.id !== id)) {
    throw new Error('学号已被其他学生占用')
  }
  const record: Student = { ...payload, id, updatedAt: new Date().toISOString() }
  all.splice(index, 1, record)
  writeAll(all)
  return record
}

// 删除
export function removeStudent(id: number): void {
  const all = readAll()
  const next = all.filter((s) => s.id !== id)
  if (next.length === all.length) throw new Error('该学生不存在或已被删除')
  writeAll(next)
}
