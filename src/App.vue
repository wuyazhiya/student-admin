<script setup lang="ts">
// 应用根组件：统一套用后台布局 + 全局消息提示
import AppLayout from '@/components/AppLayout.vue'
import ToastHost from '@/components/ToastHost.vue'
</script>

<template>
  <AppLayout>
    <!-- 路由页面切换带轻微淡入，避免生硬跳变 -->
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </AppLayout>

  <ToastHost />
</template>
