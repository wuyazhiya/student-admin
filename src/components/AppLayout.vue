<script setup lang="ts">
// 后台整体布局：左侧导航 + 顶部栏 + 内容区
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 顶部栏标题取当前路由的 meta.title
const pageTitle = computed(() => (route.meta.title as string) || '学生信息管理系统')
</script>

<template>
  <div class="layout">
    <!-- 侧边导航 -->
    <aside class="sidebar">
      <div class="brand">
        <div class="brand__mark">学</div>
        <div class="brand__text">
          <strong>学生信息管理</strong>
          <span>Student Admin</span>
        </div>
      </div>

      <nav class="nav">
        <RouterLink class="nav__item" to="/students">
          <span class="nav__icon">▤</span>
          <span>学生管理</span>
        </RouterLink>
      </nav>

      <div class="sidebar__foot">
        <p>Vue 3 + TypeScript</p>
        <p>数据存储于本地浏览器</p>
      </div>
    </aside>

    <!-- 右侧主体 -->
    <div class="main">
      <header class="topbar">
        <div class="crumb">
          <span>工作台</span>
          <span class="crumb__sep">/</span>
          <strong>{{ pageTitle }}</strong>
        </div>
        <div class="user">
          <span class="user__avatar">管</span>
          <span class="user__name">管理员</span>
        </div>
      </header>

      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

/* ===== 侧栏 ===== */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--navy);
  color: #cfdae6;
  display: flex;
  flex-direction: column;
  padding: 22px 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px 22px;
}

.brand__mark {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.brand__text strong {
  color: #fff;
  font-size: 15px;
}

.brand__text span {
  font-size: 11px;
  color: #8fa9c4;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav__item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #cfdae6;
  transition: background 0.18s ease;
}

.nav__item:hover {
  background: rgba(255, 255, 255, 0.07);
}

/* 当前路由高亮 */
.nav__item.router-link-active {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.nav__icon {
  font-size: 13px;
  opacity: 0.9;
}

.sidebar__foot {
  margin-top: auto;
  padding: 0 8px;
  font-size: 11px;
  color: #6d89a6;
  line-height: 1.9;
}

/* ===== 顶部栏 ===== */
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 62px;
  flex-shrink: 0;
  background: var(--white);
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
}

.crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--gray);
}

.crumb strong {
  color: var(--ink);
  font-weight: 600;
}

.crumb__sep {
  color: #c5d0dc;
}

.user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text);
}

.user__avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--blue-soft);
  color: var(--blue);
  display: grid;
  place-items: center;
  font-size: 13px;
}

/* ===== 内容区 ===== */
.content {
  flex: 1;
  padding: 26px 28px 40px;
  max-width: 1180px;
  width: 100%;
}

/* 小屏：侧栏收窄为图标栏 */
@media (max-width: 960px) {
  .sidebar {
    width: 72px;
    padding: 18px 12px;
  }

  .brand__text,
  .nav__item span:last-child,
  .sidebar__foot {
    display: none;
  }

  .nav__item {
    justify-content: center;
  }

  .content {
    padding: 18px 16px 30px;
  }
}
</style>
