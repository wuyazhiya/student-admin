<script setup lang="ts">
// 新增 / 编辑共用同一个页面：
// 字段从配置生成，校验规则集中在一处，提交时做防重复点击
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createStudent, fetchStudent, updateStudent } from '@/api/student'
import { studentFields } from '@/constants/studentSchema'
import type { StudentPayload } from '@/types/student'
import { notify } from '@/composables/useToast'
import { validateStudent, type FormErrors } from '@/utils/validators'

const route = useRoute()
const router = useRouter()

// 是否是编辑模式：URL 里带 id 就是编辑
const isEdit = computed(() => route.name === 'student-edit')
const studentId = computed(() => Number(route.params.id))

// 表单初始值
function emptyForm(): StudentPayload {
  return {
    studentNo: '',
    name: '',
    gender: 'male',
    className: '',
    major: '',
    phone: '',
    email: '',
    status: 'active',
    enrolledAt: '',
    remark: '',
  }
}

const form = reactive<StudentPayload>(emptyForm())
const errors = ref<FormErrors>({})
const loading = ref(false)
const submitting = ref(false)

// 今天的日期，用作入学日期的最大值
const today = new Date().toISOString().slice(0, 10)

// 编辑模式：先把原数据读进来
onMounted(async () => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const student = await fetchStudent(studentId.value)
    Object.assign(form, student)
  } catch {
    // 请求失败的提示已由拦截器统一处理，这里退回列表
    router.replace({ name: 'student-list' })
  } finally {
    loading.value = false
  }
})

// 提交
async function handleSubmit() {
  // 防重复提交：正在提交时直接忽略后续点击
  if (submitting.value) return

  errors.value = validateStudent({ ...form })
  if (Object.keys(errors.value).length > 0) {
    notify('请先修正表单中标红的内容', 'error')
    return
  }

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateStudent(studentId.value, { ...form })
      notify('保存成功', 'success')
    } else {
      await createStudent({ ...form })
      notify('新增成功', 'success')
    }
    // 回到列表，并带回原来的筛选条件
    router.push({ name: 'student-list', query: route.query })
  } finally {
    submitting.value = false
  }
}

// 取消：直接返回上一页
function handleCancel() {
  router.back()
}
</script>

<template>
  <section>
    <div class="page-head">
      <div>
        <h2 class="page-title">{{ isEdit ? '编辑学生' : '新增学生' }}</h2>
        <p class="page-sub">带 * 的为必填项，保存前会做一次完整校验</p>
      </div>
    </div>

    <div class="card form-card">
      <div v-if="loading" class="form-loading">正在读取学生信息…</div>

      <form v-else class="grid" @submit.prevent="handleSubmit">
        <!-- 字段由配置驱动，新增字段不用改这里 -->
        <div
          v-for="field in studentFields"
          :key="field.key"
          class="field"
          :class="'span-' + field.span"
        >
          <label class="field__label" :for="field.key">
            {{ field.label }}<span class="req">*</span>
          </label>

          <!-- 文本 -->
          <input
            v-if="field.type === 'text'"
            :id="field.key"
            v-model="form[field.key]"
            class="input"
            :class="{ 'input--error': errors[field.key] }"
            :placeholder="field.placeholder"
          />

          <!-- 日期 -->
          <input
            v-else-if="field.type === 'date'"
            :id="field.key"
            v-model="form[field.key]"
            type="date"
            :max="today"
            class="input"
            :class="{ 'input--error': errors[field.key] }"
          />

          <!-- 下拉 -->
          <select
            v-else-if="field.type === 'select'"
            :id="field.key"
            v-model="form[field.key]"
            class="select"
            :class="{ 'select--error': errors[field.key] }"
          >
            <option value="" disabled>请选择</option>
            <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <!-- 单选 -->
          <div v-else-if="field.type === 'radio'" class="radios">
            <label v-for="opt in field.options" :key="opt.value" class="radio">
              <input v-model="form.gender" type="radio" :value="opt.value" />
              <span>{{ opt.label }}</span>
            </label>
          </div>

          <!-- 多行文本 -->
          <textarea
            v-else
            :id="field.key"
            v-model="form[field.key]"
            class="textarea"
            :placeholder="field.placeholder"
          />

          <p v-if="errors[field.key]" class="field__error">{{ errors[field.key] }}</p>
        </div>

        <!-- 操作区 -->
        <div class="span-2 actions">
          <button type="button" class="btn btn--ghost" :disabled="submitting" @click="handleCancel">
            取消
          </button>
          <button type="submit" class="btn btn--primary" :disabled="submitting">
            {{ submitting ? '保存中…' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.page-head {
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

.form-card {
  padding: 26px 28px 22px;
}

.form-loading {
  padding: 40px 0;
  text-align: center;
  color: var(--gray);
  font-size: 14px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 24px;
}

.span-1 {
  grid-column: span 1;
}

.span-2 {
  grid-column: span 2;
}

.radios {
  display: flex;
  gap: 18px;
  height: 38px;
  align-items: center;
}

.radio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--line);
  margin-top: 4px;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .span-1,
  .span-2 {
    grid-column: span 1;
  }
}
</style>
