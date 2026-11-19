<script setup lang="ts">
// 学生详情页：按字段配置渲染信息，避免字段名和文案散落各处
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchStudent } from '@/api/student'
import { studentFields } from '@/constants/studentSchema'
import { GENDER_LABEL, STATUS_LABEL } from '@/constants/options'
import type { Student } from '@/types/student'
import StatusTag from '@/components/StatusTag.vue'

const route = useRoute()
const router = useRouter()

const student = ref<Student | null>(null)
const loading = ref(true)

// 把原始值转成页面展示的文案
function displayValue(key: string, value: unknown): string {
  if (key === 'gender') return GENDER_LABEL[value as Student['gender']]
  if (key === 'status') return STATUS_LABEL[value as Student['status']]
  return value ? String(value) : '—'
}

// 只有"备注"需要占满整行
const isWide = computed(() => (key: string) => key === 'remark')

onMounted(async () => {
  try {
    student.value = await fetchStudent(Number(route.params.id))
  } catch {
    // 数据不存在时回到列表，提示已由拦截器给出
    router.replace({ name: 'student-list' })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section>
    <div class="page-head">
      <RouterLink class="back" :to="{ name: 'student-list', query: route.query }">
        ← 返回列表
      </RouterLink>
    </div>

    <div v-if="loading" class="card detail">
      <p class="loading">正在加载…</p>
    </div>

    <div v-else-if="student" class="card detail">
      <!-- 头部：姓名 + 学号 + 状态 -->
      <div class="detail__head">
        <div>
          <h2 class="detail__name">{{ student.name }}</h2>
          <p class="detail__meta">{{ student.studentNo }}　·　{{ student.className }}</p>
        </div>
        <StatusTag :status="student.status" />
      </div>

      <!-- 信息列表 -->
      <dl class="info">
        <div
          v-for="field in studentFields"
          :key="field.key"
          class="info__item"
          :class="{ 'info__item--wide': isWide(field.key) }"
        >
          <dt>{{ field.label }}</dt>
          <dd>{{ displayValue(field.key, student[field.key]) }}</dd>
        </div>
      </dl>

      <div class="detail__foot">
        <RouterLink
          class="btn btn--primary"
          :to="{ name: 'student-edit', params: { id: student.id }, query: route.query }"
        >
          编辑信息
        </RouterLink>
        <RouterLink class="btn btn--ghost" :to="{ name: 'student-list', query: route.query }">
          返回列表
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-head {
  margin-bottom: 14px;
}

.back {
  font-size: 13px;
  color: var(--gray);
}

.back:hover {
  color: var(--blue);
}

.detail {
  padding: 28px 30px;
}

.loading {
  padding: 30px 0;
  text-align: center;
  color: var(--gray);
}

.detail__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line);
}

.detail__name {
  font-size: 22px;
  color: var(--ink);
  font-weight: 700;
}

.detail__meta {
  margin-top: 4px;
  font-size: 13px;
  color: var(--gray);
}

.info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 32px;
  margin: 24px 0 0;
}

.info__item--wide {
  grid-column: span 2;
}

.info dt {
  font-size: 13px;
  color: var(--gray);
  margin-bottom: 4px;
}

.info dd {
  margin: 0;
  font-size: 15px;
  color: var(--ink);
  line-height: 1.6;
  word-break: break-all;
}

.detail__foot {
  display: flex;
  gap: 10px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
}

@media (max-width: 720px) {
  .info {
    grid-template-columns: 1fr;
  }

  .info__item--wide {
    grid-column: span 1;
  }
}
</style>
