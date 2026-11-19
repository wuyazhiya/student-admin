<script setup lang="ts">
// 分页组件：页码 + 每页条数 + 总数，被列表页复用
import { computed } from 'vue'

const props = defineProps<{
  page: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  (e: 'change', page: number): void
  (e: 'size-change', size: number): void
}>()

// 总页数，至少为 1，避免除零
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

// 当前页前后的页码范围（最多展示 7 个按钮）
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = props.page
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const start = Math.max(1, Math.min(current - 3, total - 6))
  return Array.from({ length: 7 }, (_, i) => start + i)
})

// 切页时做边界保护
function go(page: number) {
  const next = Math.min(totalPages.value, Math.max(1, page))
  if (next !== props.page) emit('change', next)
}

// 每页条数变化时回到第一页
function onSizeChange(event: Event) {
  emit('size-change', Number((event.target as HTMLSelectElement).value))
}
</script>

<template>
  <div class="pager">
    <span class="pager__total">共 {{ total }} 条</span>

    <div class="pager__pages">
      <button class="pager__btn" :disabled="page <= 1" @click="go(page - 1)">上一页</button>
      <button
        v-for="p in visiblePages"
        :key="p"
        class="pager__btn pager__btn--num"
        :class="{ 'is-active': p === page }"
        @click="go(p)"
      >
        {{ p }}
      </button>
      <button class="pager__btn" :disabled="page >= totalPages" @click="go(page + 1)">下一页</button>
    </div>

    <select class="pager__size" :value="pageSize" @change="onSizeChange">
      <option :value="5">5 条/页</option>
      <option :value="10">10 条/页</option>
      <option :value="20">20 条/页</option>
    </select>
  </div>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  flex-wrap: wrap;
}

.pager__total {
  font-size: 13px;
  color: var(--gray);
}

.pager__pages {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pager__btn {
  height: 32px;
  min-width: 32px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--white);
  color: var(--text);
  font-size: 13px;
  transition: all 0.16s ease;
}

.pager__btn:hover:not(:disabled) {
  border-color: var(--blue);
  color: var(--blue);
}

.pager__btn.is-active {
  background: var(--navy);
  border-color: var(--navy);
  color: #fff;
}

.pager__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pager__size {
  height: 32px;
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 0 8px;
  font-size: 13px;
  color: var(--text);
  background: var(--white);
}
</style>
