<script setup lang="ts">
// 学生列表页：多条件查询 + 分页 + 删除
// 关键设计：查询条件写进 URL，翻页/刷新/从详情返回时都不会丢失
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { deleteStudent, fetchStudents } from '@/api/student'
import { CLASS_OPTIONS, STATUS_OPTIONS } from '@/constants/options'
import type { Student, StudentQuery, StudentStatus } from '@/types/student'
import { notify } from '@/composables/useToast'
import Pagination from '@/components/Pagination.vue'
import StatusTag from '@/components/StatusTag.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()

// 默认查询参数
function defaultQuery(): StudentQuery {
  return { keyword: '', className: '', status: '', page: 1, pageSize: 10 }
}

const query = reactive<StudentQuery>(defaultQuery())
const list = ref<Student[]>([])
const total = ref(0)
const loading = ref(false)

// ===== 删除确认 =====
const confirmOpen = ref(false)
const deleting = ref(false)
const deleteTarget = ref<Student | null>(null)

// 把 URL 上的查询参数还原到页面状态
function syncFromUrl() {
  const q = route.query
  query.keyword = typeof q.keyword === 'string' ? q.keyword : ''
  query.className = typeof q.className === 'string' ? q.className : ''
  query.status = (typeof q.status === 'string' ? q.status : '') as StudentStatus | ''
  query.page = Number(q.page) > 0 ? Number(q.page) : 1
  query.pageSize = Number(q.pageSize) > 0 ? Number(q.pageSize) : 10
}

// 查询数据
async function load() {
  loading.value = true
  try {
    const res = await fetchStudents({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

// 修改查询条件 → 写进 URL（URL 变化后由 watch 统一触发查询）
function updateUrl(patch: Partial<StudentQuery>) {
  const merged = { ...query, ...patch }
  const next: Record<string, string> = {}
  if (merged.keyword) next.keyword = merged.keyword
  if (merged.className) next.className = merged.className
  if (merged.status) next.status = merged.status
  if (merged.page > 1) next.page = String(merged.page)
  if (merged.pageSize !== 10) next.pageSize = String(merged.pageSize)
  router.replace({ query: next })
}

// 点击查询：条件变化时回到第一页
function handleSearch() {
  updateUrl({ page: 1 })
}

// 重置所有筛选条件
function handleReset() {
  Object.assign(query, defaultQuery())
  router.replace({ query: {} })
}

// 每页条数变化
function handleSizeChange(size: number) {
  updateUrl({ pageSize: size, page: 1 })
}

// 打开删除确认框
function askDelete(student: Student) {
  deleteTarget.value = student
  confirmOpen.value = true
}

// 确认删除
async function handleDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await deleteStudent(deleteTarget.value.id)
    notify('删除成功', 'success')
    confirmOpen.value = false
    // 删掉的是当前页最后一条时，自动回退一页，避免停在空页
    if (list.value.length === 1 && query.page > 1) {
      updateUrl({ page: query.page - 1 })
    } else {
      await load()
    }
  } finally {
    deleting.value = false
  }
}

// 时间格式化：2025-09-01T09:30:00.000Z → 2025-09-01 17:30
function formatTime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 首次进入 + URL 变化时查询
onMounted(() => {
  syncFromUrl()
  load()
})
watch(
  () => route.query,
  () => {
    syncFromUrl()
    load()
  },
)
</script>

<template>
  <section>
    <!-- 页头 -->
    <div class="page-head">
      <div>
        <h2 class="page-title">学生管理</h2>
        <p class="page-sub">共 {{ total }} 名学生，支持按学号、姓名、手机号搜索</p>
      </div>
      <!-- 跳转时带上当前筛选条件，返回列表时不会丢失 -->
      <RouterLink class="btn btn--primary" :to="{ name: 'student-create', query: route.query }">
        + 新增学生
      </RouterLink>
    </div>

    <!-- 筛选区 -->
    <div class="card filters">
      <div class="field filters__item filters__item--wide">
        <label class="field__label" for="keyword">关键字</label>
        <input
          id="keyword"
          v-model.trim="query.keyword"
          class="input"
          placeholder="学号 / 姓名 / 手机号"
          @keyup.enter="handleSearch"
        />
      </div>

      <div class="field filters__item">
        <label class="field__label" for="className">班级</label>
        <select id="className" v-model="query.className" class="select">
          <option value="">全部班级</option>
          <option v-for="c in CLASS_OPTIONS" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div class="field filters__item">
        <label class="field__label" for="status">学籍状态</label>
        <select id="status" v-model="query.status" class="select">
          <option value="">全部状态</option>
          <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </div>

      <div class="filters__actions">
        <button class="btn btn--primary" @click="handleSearch">查询</button>
        <button class="btn btn--ghost" @click="handleReset">重置</button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="card table-card">
      <!-- 窄屏时横向滚动，避免列被挤压换行 -->
      <div class="table-scroll">
        <table class="table">
        <thead>
          <tr>
            <th>学号</th>
            <th>姓名</th>
            <th>性别</th>
            <th>班级</th>
            <th>状态</th>
            <th>更新时间</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>

        <!-- 加载态：骨架屏，避免表格突然跳动 -->
        <tbody v-if="loading">
          <tr v-for="n in 6" :key="'sk-' + n">
            <td v-for="c in 7" :key="c"><div class="skeleton" /></td>
          </tr>
        </tbody>

        <tbody v-else-if="list.length">
          <tr v-for="item in list" :key="item.id">
            <td class="mono">{{ item.studentNo }}</td>
            <td class="strong">{{ item.name }}</td>
            <td>{{ item.gender === 'male' ? '男' : '女' }}</td>
            <td>{{ item.className }}</td>
            <td><StatusTag :status="item.status" /></td>
            <td class="dim">{{ formatTime(item.updatedAt) }}</td>
            <td class="col-actions">
              <RouterLink
                class="link"
                :to="{ name: 'student-detail', params: { id: item.id }, query: route.query }"
              >
                详情
              </RouterLink>
              <RouterLink
                class="link"
                :to="{ name: 'student-edit', params: { id: item.id }, query: route.query }"
              >
                编辑
              </RouterLink>
              <button class="btn btn--danger-text" @click="askDelete(item)">删除</button>
            </td>
          </tr>
        </tbody>

        <!-- 空状态 -->
        <tbody v-else>
          <tr>
            <td colspan="7">
              <div class="empty">
                <p class="empty__title">没有找到符合条件的学生</p>
                <p class="empty__desc">试试换一个关键字，或点“重置”查看全部数据</p>
                <button class="btn btn--ghost" @click="handleReset">重置筛选</button>
              </div>
            </td>
          </tr>
        </tbody>
        </table>
      </div>

      <div class="table-card__foot">
        <Pagination
          :page="query.page"
          :page-size="query.pageSize"
          :total="total"
          @change="(p) => updateUrl({ page: p })"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 删除确认 -->
    <ConfirmDialog
      :open="confirmOpen"
      title="删除确认"
      :content="`确定删除「${deleteTarget?.name ?? ''}」的档案吗？删除后不可恢复。`"
      confirm-text="确认删除"
      :loading="deleting"
      @cancel="confirmOpen = false"
      @confirm="handleDelete"
    />
  </section>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.page-title {
  font-size: 22px;
  color: var(--ink);
  font-weight: 700;
}

.page-sub {
  margin-top: 4px;
  font-size: 13px;
  color: var(--gray);
}

/* 筛选区采用弹性布局，窄屏自动换行 */
.filters {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  padding: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filters__item {
  width: 176px;
}

.filters__item--wide {
  width: 260px;
  flex: 1 1 220px;
}

.filters__actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.table-card {
  overflow: hidden;
}

/* 表格最小宽度：窗口变窄时出现横向滚动条，而不是把每个单元格挤成多行 */
.table-scroll {
  overflow-x: auto;
}

.table-scroll .table {
  min-width: 880px;
}

/* 学号、姓名、时间不换行，保证可读性 */
.table td:nth-child(1),
.table td:nth-child(2),
.table td:nth-child(6) {
  white-space: nowrap;
}

.table-card__foot {
  border-top: 1px solid var(--line);
}

.col-actions {
  width: 190px;
  white-space: nowrap;
}

.link {
  color: var(--blue);
  margin-right: 12px;
  font-size: 13px;
}

.link:hover {
  text-decoration: underline;
}

.mono {
  font-family: 'Consolas', 'Menlo', monospace;
  color: var(--ink);
}

.strong {
  font-weight: 600;
  color: var(--ink);
}

.dim {
  color: var(--gray);
  font-size: 13px;
}

.empty {
  padding: 44px 16px;
  text-align: center;
}

.empty__title {
  font-size: 15px;
  color: var(--ink);
}

.empty__desc {
  margin: 6px 0 16px;
  font-size: 13px;
  color: var(--gray);
}

@media (max-width: 720px) {
  .filters__item,
  .filters__item--wide {
    width: 100%;
  }

  .filters__actions {
    margin-left: 0;
    width: 100%;
  }
}
</style>
