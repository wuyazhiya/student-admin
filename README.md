# 学生信息管理系统

一个基于 **Vue 3 + TypeScript + Vite** 的学生信息管理前端项目，覆盖列表查询、分页、新增、编辑、详情、删除的完整业务流程。

> 在线演示：`https://<你的 GitHub 用户名>.github.io/student-admin/`（部署后替换）
> 演示数据保存在浏览器 localStorage，打开即可操作，无需后端。

## 功能

- **多条件查询**：按学号 / 姓名 / 手机号关键字、班级、学籍状态组合筛选
- **分页**：支持 5 / 10 / 20 条每页切换，删除当前页最后一条时自动回退一页
- **筛选条件保持**：查询条件写入 URL query，翻页、刷新、从详情返回都不会丢失
- **新增 / 编辑**：同一页面复用，字段由配置生成，保存前整表校验
- **防重复提交**：提交按钮置灰 + 请求层幂等校验，避免重复写入
- **删除二次确认**：自定义弹窗，处理中禁用按钮
- **细节体验**：骨架屏加载、空状态引导、全局消息提示、移动端自适应

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 语言 | TypeScript（strict 模式） |
| 构建 | Vite 5 |
| 路由 | Vue Router 4（hash 模式，适配 GitHub Pages） |
| 请求 | axios（实例封装 + 拦截器 + 自定义 adapter） |
| 样式 | 原生 CSS（CSS 变量 + 组件 scoped 样式，无 UI 框架） |

## 项目结构

```
student-admin
├─ src
│  ├─ api            # 接口层：request 统一封装、业务接口
│  ├─ components     # 复用组件：布局、分页、确认弹窗、状态标签、消息提示
│  ├─ constants      # 字典与表单字段配置（新增字段只改这里）
│  ├─ mock           # mock 数据层与 axios adapter（接后端后可删除）
│  ├─ router         # 路由表
│  ├─ styles         # 全局设计变量与基础样式
│  ├─ types          # 业务类型定义
│  ├─ utils          # 表单校验
│  └─ views          # 列表 / 表单 / 详情三个页面
└─ index.html
```

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（默认 http://localhost:5173）
npm run dev

# 类型检查 + 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 接入真实后端

项目当前通过 axios 自定义 adapter 走本地 mock：

1. 新建 `.env.local`，写入：

```bash
VITE_USE_MOCK=false
VITE_API_BASE=http://localhost:8080/api
```

2. 后端按以下约定实现接口即可，前端代码无需修改：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/students` | 参数 `keyword/className/status/page/pageSize`，返回 `{ code, message, data: { list, total, page, pageSize } }` |
| GET | `/students/:id` | 学生详情 |
| POST | `/students` | 新增 |
| PUT | `/students/:id` | 编辑 |
| DELETE | `/students/:id` | 删除 |

响应体统一为 `{ code, message, data }`，`code === 0` 表示成功，其余由拦截器统一提示。

## 设计说明

- **字段配置驱动**：`constants/studentSchema.ts` 描述每个字段的类型、候选项、占位符，表单页与详情页都由它渲染；新增字段只需加一行配置。
- **校验集中**：所有规则在 `utils/validators.ts`，页面里不再散落 `if-else`。
- **请求集中**：页面只调用 `api/student.ts`，URL、错误码、提示逻辑都收在 `api/request.ts`。
- **类型贯穿**：`Student / StudentPayload / StudentQuery / PageResult` 覆盖接口、页面、mock 三层。

## 后续计划

- [ ] 接入真实后端（Spring Boot / JSP + MySQL）
- [ ] 增加登录与权限（路由守卫 + token 刷新）
- [ ] 列表支持排序与批量操作
- [ ] 补充单元测试（Vitest）
