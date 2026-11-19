// 路由表：用 hash 模式，部署到 GitHub Pages 刷新子路由不会 404
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // 根路径直接进列表页
    { path: '/', redirect: '/students' },
    {
      path: '/students',
      name: 'student-list',
      component: () => import('@/views/StudentList.vue'),
      meta: { title: '学生列表' },
    },
    // 新增要放在 /:id 之前，否则 new 会被当成 id
    {
      path: '/students/new',
      name: 'student-create',
      component: () => import('@/views/StudentForm.vue'),
      meta: { title: '新增学生' },
    },
    {
      path: '/students/:id',
      name: 'student-detail',
      component: () => import('@/views/StudentDetail.vue'),
      meta: { title: '学生详情' },
    },
    {
      path: '/students/:id/edit',
      name: 'student-edit',
      component: () => import('@/views/StudentForm.vue'),
      meta: { title: '编辑学生' },
    },
    // 兜底：地址写错时回到列表
    { path: '/:pathMatch(.*)*', redirect: '/students' },
  ],
})

// 根据路由 meta 生成浏览器标题
router.afterEach((to) => {
  const title = (to.meta.title as string) || '学生信息管理系统'
  document.title = `${title} · 学生信息管理系统`
})

export default router
