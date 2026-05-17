# StreamVibe Frontend (Vue 3)

这是 StreamVibe 视频平台的 Vue 3 前端项目。

## 技术栈

- Vue 3 (Composition API)
- Vue Router 4
- Pinia (状态管理)
- Axios (HTTP 请求)
- Vite (构建工具)

## 快速开始

### 安装依赖

```bash
cd frontend
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建后的文件会生成在 `dist` 目录。

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
frontend/
├── index.html          # 入口 HTML
├── package.json        # 依赖配置
├── vite.config.js      # Vite 配置
├── src/
│   ├── main.js         # 应用入口
│   ├── App.vue         # 根组件
│   ├── assets/
│   │   └── styles/
│   │       └── main.css    # 全局样式
│   ├── components/
│   │   ├── Navbar.vue      # 导航栏组件
│   │   └── VideoCard.vue   # 视频卡片组件
│   ├── stores/
│   │   ├── auth.js         # 认证状态管理
│   │   └── video.js        # 视频状态管理
│   ├── views/
│   │   ├── HomePage.vue    # 首页
│   │   ├── LoginPage.vue   # 登录页
│   │   ├── RegisterPage.vue# 注册页
│   │   ├── VideoPage.vue   # 视频播放页
│   │   ├── ProfilePage.vue # 个人中心
│   │   ├── CategoryPage.vue# 分类页
│   │   ├── SearchPage.vue  # 搜索页
│   │   └── UploadPage.vue  # 上传页
│   └── router/
│       └── index.js        # 路由配置
```

## 与后端配合

前端开发模式下，Vite 会代理以下请求到后端：
- `/api/*` → http://localhost:3000/api/*
- `/uploads/*` → http://localhost:3000/uploads/*

确保后端服务在 http://localhost:3000 运行。

## 功能特性

- [x] 用户登录/注册
- [x] 首页视频列表
- [x] 视频分类浏览
- [x] 视频搜索
- [x] 视频详情播放
- [x] 个人中心
- [x] 视频上传
- [x] 用户下拉菜单
- [x] 响应式设计
