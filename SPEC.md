# StreamVibe 视频平台规范

## 1. Concept & Vision

打造一个沉浸式的视频流媒体平台，灵感来源于Netflix和哔哩哔哩的融合。界面以深色为主基调，营造影院级观影氛围，通过精致的卡片动画和流畅的交互，让用户享受探索和发现内容的乐趣。

## 2. Design Language

### 美学方向
- **暗夜影院风格**：深邃的暗色背景配合霓虹渐变强调色，营造高端流媒体平台的质感
- **浅色主题**：明亮的浅色背景配合清晰的文字，适合日间使用
- 参考：Netflix的简洁布局 + 哔哩哔哩的活力感

### 色彩系统

**深色主题 (默认)**
```
Primary:     #6366f1 (靛蓝紫)
Secondary:   #ec4899 (玫瑰粉)
Accent:      #f59e0b (琥珀金)
Background:  #0f0f23 (深邃夜蓝)
Surface:     #1a1a2e (卡片背景)
Surface2:    #16213e (次级表面)
Text:        #e2e8f0 (主文字)
TextMuted:   #94a3b8 (次级文字)
```

**浅色主题**
```
Primary:     #4f46e5 (深靛蓝)
Secondary:   #db2777 (深玫瑰粉)
Accent:      #d97706 (深琥珀)
Background:  #f8fafc (明亮灰白)
Surface:     #ffffff (纯白)
Surface2:    #f1f5f9 (浅灰)
Text:        #1e293b (深灰文字)
TextMuted:   #64748b (中灰文字)
```

### 字体
- 主字体：`"Inter", "Noto Sans SC", sans-serif`
- 标题：700 weight
- 正文：400 weight

### 空间系统
- 基础单位：8px
- 卡片间距：24px
- 区块间距：48px
- 圆角：12px（大卡片）、8px（小元素）

### 动效哲学
- 卡片悬停：scale(1.05) + 上浮阴影，200ms ease-out
- 页面加载：staggered fade-in，每个元素延迟80ms
- 视频预览：悬停时播放gif预览
- 按钮交互：hover时渐变位移
- 图片加载：懒加载 + 骨架屏占位

## 3. Layout & Structure

### 页面结构
1. **导航栏**（固定顶部）
   - Logo + 品牌名
   - 导航链接（首页、分类、排行榜、我的收藏）
   - 搜索框（可展开）
   - 主题切换按钮（深色/浅色）
   - 用户头像/登录按钮

2. **英雄区域**
   - 全宽背景图/视频预览
   - 影片标题 + 简介
   - 播放按钮 + 详情按钮

3. **内容分类区**
   - 横向滚动的类别标签
   - 当前选中状态高亮

4. **视频网格**
   - 响应式卡片网格（4列 → 3列 → 2列 → 1列）
   - 每个卡片：缩略图 + 时长 + 标题 + 播放量
   - 图片懒加载 + 骨架屏

5. **底部**
   - 简洁的链接和版权信息

### 响应式断点
- Desktop: > 1200px (4列)
- Tablet: 768px - 1200px (3列)
- Mobile: < 768px (2列 → 1列)

## 4. Features & Interactions

### 核心功能
- **视频卡片展示**：悬停显示播放按钮和时长
- **分类筛选**：点击标签过滤视频列表
- **搜索功能**：实时搜索，匹配标题和标签
- **视频播放**：点击跳转播放页面
- **收藏功能**：心形按钮添加/移除收藏
- **点赞功能**：喜欢按钮点赞/取消点赞
- **订阅功能**：订阅创作者
- **主题切换**：深色/浅色主题自由切换
- **AI 创作**：文生视频、文生图片

### 交互细节
- 卡片hover：放大 + 显示半透明播放按钮
- 搜索框：focus时展开动画
- 标签切换：下划线滑动动画
- 收藏按钮：点击时心跳动画
- 图片加载：懒加载 + 骨架屏过渡

### 状态处理
- 空搜索结果：显示"未找到相关视频"
- 加载状态：骨架屏占位
- 错误状态：优雅的提示信息
- 404 页面：友好的错误提示和导航

## 5. Component Inventory

### 导航栏 (Navbar)
- 默认：半透明背景 + 模糊效果
- 滚动后：加深背景
- Logo有hover光晕效果
- 包含主题切换按钮

### 视频卡片 (VideoCard)
- 默认：缩略图 + 底部信息条
- Hover：放大 + 播放按钮浮现 + 阴影加深
- 播放量、时长、清晰度角标
- 懒加载图片 + 骨架屏

### 类别标签 (CategoryTag)
- 默认：透明背景 + 边框
- 选中：渐变背景 + 白色文字
- Hover：背景微亮

### 搜索框 (SearchBox)
- 默认：圆角矩形 + 搜索图标
- Focus：边框渐变 + 宽度扩展
- 有内容：显示清除按钮

### 英雄横幅 (HeroBanner)
- 全宽背景图
- 左侧文字信息 + 右侧装饰元素
- CTA按钮有脉冲动画

### 骨架屏 (SkeletonLoader)
- 多种变体：video-card, video-grid, profile, comment, page
- 平滑的闪烁动画
- 交错显示效果

### Toast 通知
- 成功/错误/警告/信息四种类型
- 自动消失动画
- 可手动关闭

### 404 页面
- 大字号错误码
- 友好错误提示
- 快速导航链接

## 6. Technical Approach

### 前端技术栈
- **框架**：Vue 3 (Composition API)
- **路由**：Vue Router 4
- **状态管理**：Pinia
- **HTTP 客户端**：Axios
- **构建工具**：Vite

### 后端技术栈（双后端架构）

#### Java Spring Boot 后端 (端口 8080)
- **框架**：Spring Boot 3.x
- **ORM**：Spring Data JPA
- **安全**：Spring Security + JWT
- **数据库**：MySQL

#### Node.js 服务 (端口 3000)
- **框架**：Express.js
- **认证**：JWT
- **文件上传**：Multer
- **密码加密**：bcryptjs

### 性能优化
- **图片懒加载**：使用 IntersectionObserver
- **骨架屏**：提升感知加载速度
- **请求拦截**：统一错误处理和重试
- **请求限流**：防止滥用和 DDoS

### API 设计

#### 认证 API (Node.js 端口3000)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 用户登出 |

#### 用户 API (Java 端口8080)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/users/:id` | GET | 获取用户信息 |
| `/api/users/:id/profile` | GET | 获取用户详情 |
| `/api/users/:id/videos` | GET | 获取用户视频列表 |
| `/api/users/:id/subscribers` | GET | 获取粉丝数 |

#### 视频 API
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/videos` (Node:3000) | GET | 获取视频列表 |
| `/api/videos` (Node:3000) | POST | 上传视频 |
| `/api/v1/videos` (Java:8080) | GET | 获取视频列表 |
| `/api/v1/videos/:id` (Java:8080) | GET | 获取视频详情 |
| `/api/v1/videos/user/:userId` (Java:8080) | GET | 获取用户视频 |
| `/api/v1/videos/hot` (Java:8080) | GET | 获取热门视频 |
| `/api/videos/:id/comments` | GET/POST | 获取/添加评论 |
| `/api/search` | GET | 搜索视频 |

#### 收藏/点赞/订阅 API (Java 端口8080)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/favorites` | GET/POST/DELETE | 收藏操作 |
| `/api/v1/likes` | GET/POST/DELETE | 点赞操作 |
| `/api/v1/subscriptions` | GET/POST/DELETE | 订阅操作 |

#### AI 创作 API (Node.js 端口3000)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/ai/status` | GET | 获取 AI 服务状态 |
| `/api/ai/video` | POST | 文生视频 |
| `/api/ai/image` | POST | 文生图片 |
| `/api/ai/status/:jobId` | GET | 查询任务状态 |

#### 管理后台 API (Java 端口8080)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/stats` | GET | 获取统计数据 |
| `/api/admin/users` | GET | 用户列表 |
| `/api/admin/videos` | GET | 视频列表 |
| `/api/admin/comments` | GET | 评论列表 |

## 7. 项目结构

```
sheji/
├── frontend/                    # Vue 3 前端项目
│   ├── src/
│   │   ├── api/               # API 请求模块
│   │   ├── assets/
│   │   │   └── styles/
│   │   │       └── main.css   # 全局样式 + 主题变量
│   │   ├── components/        # 可复用组件
│   │   ├── composables/       # 组合式函数
│   │   ├── router/            # 路由配置
│   │   ├── stores/            # Pinia 状态管理
│   │   ├── views/             # 页面组件
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
│
├── backend/                     # Java Spring Boot 后端 (端口 8080)
│   ├── src/main/java/com/streamvibe/
│   │   ├── controller/        # 控制器
│   │   ├── service/          # 业务逻辑
│   │   ├── repository/       # 数据访问
│   │   ├── entity/           # 实体类
│   │   ├── dto/              # 数据传输对象
│   │   └── config/           # 配置类
│   ├── src/main/resources/
│   │   └── application.yml   # Spring Boot 配置
│   ├── pom.xml
│   └── mvnw
│
├── server.js                   # Node.js Express 服务 (端口 3000)
├── database.sql                # MySQL 数据库结构
├── uploads/                    # 上传文件目录
├── package.json                # Node.js 依赖
└── SPEC.md                     # 项目规范文档
```

## 8. 数据库表结构

### 核心表
| 表名 | 说明 |
|------|------|
| users | 用户表 |
| videos | 视频表 |
| comments | 评论表 |
| likes | 点赞表 |
| favorites | 收藏表 |
| collections | 收藏夹表 |
| subscriptions | 关注表 |
| watch_history | 播放记录表 |
| categories | 视频分类表 |
| tags | 标签表 |
| video_tags | 视频标签关联表 |
| ai_jobs | AI创作任务表 |

## 9. 优化记录

### 2026-05-17 优化项
1. **前端 API 模块优化**
   - 添加统一请求拦截器
   - 添加错误处理和重试机制
   - 完善 Axios 实例配置

2. **Pinia Stores 完善**
   - 优化 auth store
   - 优化 video store
   - 添加 user store

3. **组件增强**
   - VideoCard 添加懒加载和骨架屏
   - 新增 SkeletonLoader 组件
   - 新增 NotFoundPage 404 页面

4. **主题系统**
   - 添加深色/浅色主题切换
   - 使用 CSS 变量管理主题颜色
   - 支持系统主题检测

5. **后端优化**
   - 添加日志系统（分级日志）
   - 添加请求限流中间件
   - 统一请求日志记录

6. **用户体验提升**
   - 图片懒加载减少初始加载时间
   - 骨架屏提升感知性能
   - 友好的 404 页面

### 2026-05-17 双后端架构
- **Java Spring Boot 后端**：RESTful API，JPA 数据库操作
- **Node.js 服务**：AI 创作、视频上传等 Node 专长功能
- **完整启动器**：一键启动所有服务
