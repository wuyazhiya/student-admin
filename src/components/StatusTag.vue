<script setup lang="ts">
// 学籍状态标签：颜色与文案都由字典统一决定，页面不用写映射
import type { StudentStatus } from '@/types/student'
import { STATUS_LABEL, STATUS_TONE } from '@/constants/options'

defineProps<{ status: StudentStatus }>()
</script>

<template>
  <span class="tag" :class="'tag--' + STATUS_TONE[status]">{{ STATUS_LABEL[status] }}</span>
</template>
