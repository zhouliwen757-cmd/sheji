-- ============================================
-- StreamVibe 数据库结构设计 v2.0
-- 完整数据库Schema
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS streamvibe 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE streamvibe;

-- ============================================
-- 1. 用户表 (users)
-- ============================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    -- 基础信息
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    nickname VARCHAR(100) COMMENT '昵称',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    password_sha256 VARCHAR(64) DEFAULT NULL COMMENT 'SHA256密码（备用）',
    
    -- 个人资料
    phone VARCHAR(20) COMMENT '手机号',
    avatar_url VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    bio TEXT COMMENT '个人简介',
    gender ENUM('male', 'female', 'other', 'secret') DEFAULT 'secret' COMMENT '性别',
    birthday DATE DEFAULT NULL COMMENT '生日',
    
    -- 社交统计
    subscribers_count INT DEFAULT 0 COMMENT '粉丝数',
    following_count INT DEFAULT 0 COMMENT '关注数',
    video_count INT DEFAULT 0 COMMENT '作品数',
    total_views BIGINT DEFAULT 0 COMMENT '总播放量',
    
    -- 账户状态
    role ENUM('admin', 'user', 'vip') DEFAULT 'user' COMMENT '角色',
    status ENUM('active', 'banned', 'inactive') DEFAULT 'active' COMMENT '账户状态',
    email_verified TINYINT(1) DEFAULT 0 COMMENT '邮箱验证',
    
    -- 安全设置
    last_login_ip VARCHAR(45) DEFAULT NULL COMMENT '最后登录IP',
    last_login_time DATETIME DEFAULT NULL COMMENT '最后登录时间',
    login_attempts INT DEFAULT 0 COMMENT '登录尝试次数',
    locked_until DATETIME DEFAULT NULL COMMENT '锁定截止时间',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at DATETIME DEFAULT NULL COMMENT '删除时间（软删除）',
    
    -- 索引
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 2. 视频表 (videos)
-- ============================================
DROP TABLE IF EXISTS videos;
CREATE TABLE videos (
    -- 基础信息
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '视频ID',
    video_id VARCHAR(32) UNIQUE NOT NULL COMMENT '视频唯一标识ID（UUID）',
    title VARCHAR(255) NOT NULL COMMENT '标题',
    description TEXT COMMENT '描述',
    
    -- 媒体资源
    video_url VARCHAR(500) NOT NULL COMMENT '视频地址',
    video_path VARCHAR(500) DEFAULT NULL COMMENT '服务器存储路径',
    thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT '封面URL',
    thumbnail_path VARCHAR(500) DEFAULT NULL COMMENT '封面存储路径',
    
    -- 视频属性
    duration VARCHAR(20) COMMENT '时长（秒或HH:MM:SS）',
    duration_seconds INT DEFAULT 0 COMMENT '时长（秒）',
    file_size BIGINT DEFAULT 0 COMMENT '文件大小（字节）',
    width INT DEFAULT 0 COMMENT '视频宽度',
    height INT DEFAULT 0 COMMENT '视频高度',
    quality VARCHAR(20) DEFAULT '1080P' COMMENT '画质',
    codec VARCHAR(50) DEFAULT NULL COMMENT '编码格式',
    
    -- 分类与标签
    category VARCHAR(50) COMMENT '分类',
    tags JSON COMMENT '标签数组',
    
    -- 统计数据
    views INT DEFAULT 0 COMMENT '播放次数',
    likes_count INT DEFAULT 0 COMMENT '点赞数',
    favorites_count INT DEFAULT 0 COMMENT '收藏数',
    comments_count INT DEFAULT 0 COMMENT '评论数',
    shares_count INT DEFAULT 0 COMMENT '分享数',
    danmaku_count INT DEFAULT 0 COMMENT '弹幕数',
    
    -- 用户信息
    user_id INT NOT NULL COMMENT '上传用户ID',
    
    -- 内容审核
    status ENUM('pending', 'approved', 'rejected', 'deleted') DEFAULT 'approved' COMMENT '状态',
    review_time DATETIME DEFAULT NULL COMMENT '审核时间',
    review_reason VARCHAR(255) DEFAULT NULL COMMENT '审核原因',
    
    -- 推荐权重
    weight INT DEFAULT 0 COMMENT '推荐权重',
    hot_score DOUBLE DEFAULT 0 COMMENT '热度分数',
    
    -- 下载设置
    allow_download TINYINT(1) DEFAULT 1 COMMENT '允许下载',
    allow_share TINYINT(1) DEFAULT 1 COMMENT '允许分享',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    published_at DATETIME DEFAULT NULL COMMENT '发布时间',
    deleted_at DATETIME DEFAULT NULL COMMENT '删除时间',
    
    -- 索引
    INDEX idx_video_id (video_id),
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_views (views DESC),
    INDEX idx_likes_count (likes_count DESC),
    INDEX idx_created_at (created_at),
    INDEX idx_published_at (published_at),
    FULLTEXT idx_search (title, description),
    
    -- 外键
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='视频表';

-- ============================================
-- 3. 评论表 (comments)
-- ============================================
DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
    -- 基础信息
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
    comment_id VARCHAR(32) UNIQUE NOT NULL COMMENT '评论唯一标识ID',
    
    -- 评论内容
    video_id INT NOT NULL COMMENT '视频ID',
    user_id INT NOT NULL COMMENT '用户ID',
    parent_id INT DEFAULT NULL COMMENT '父评论ID（回复）',
    root_id INT DEFAULT NULL COMMENT '根评论ID',
    content TEXT NOT NULL COMMENT '评论内容',
    content_length INT DEFAULT 0 COMMENT '内容长度',
    
    -- 互动数据
    likes_count INT DEFAULT 0 COMMENT '点赞数',
    replies_count INT DEFAULT 0 COMMENT '回复数',
    
    -- 评论属性
    type ENUM('normal', 'reply', 'system') DEFAULT 'normal' COMMENT '类型',
    is_top TINYINT(1) DEFAULT 0 COMMENT '是否置顶',
    is_hot TINYINT(1) DEFAULT 0 COMMENT '是否热评',
    is_deleted TINYINT(1) DEFAULT 0 COMMENT '是否已删除',
    
    -- 敏感词检测
    sentiment_score DOUBLE DEFAULT NULL COMMENT '情感分析分数',
    sensitive_check TINYINT(1) DEFAULT 0 COMMENT '敏感词检测',
    
    -- IP与设备
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
    user_agent VARCHAR(500) DEFAULT NULL COMMENT '用户代理',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at DATETIME DEFAULT NULL COMMENT '删除时间',
    
    -- 索引
    INDEX idx_comment_id (comment_id),
    INDEX idx_video_id (video_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_root_id (root_id),
    INDEX idx_likes_count (likes_count DESC),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_is_hot (is_hot, likes_count DESC),
    
    -- 外键
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ============================================
-- 4. 点赞表 (likes)
-- ============================================
DROP TABLE IF EXISTS likes;
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '点赞ID',
    user_id INT NOT NULL COMMENT '用户ID',
    video_id INT NOT NULL COMMENT '视频ID',
    type ENUM('like', 'dislike') DEFAULT 'like' COMMENT '点赞类型',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    
    -- 索引
    UNIQUE KEY unique_like (user_id, video_id, type),
    INDEX idx_user_id (user_id),
    INDEX idx_video_id (video_id),
    INDEX idx_created_at (created_at),
    
    -- 外键
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- ============================================
-- 5. 收藏表 (favorites)
-- ============================================
DROP TABLE IF EXISTS favorites;
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '收藏ID',
    user_id INT NOT NULL COMMENT '用户ID',
    video_id INT NOT NULL COMMENT '视频ID',
    collection_id INT DEFAULT NULL COMMENT '收藏夹ID',
    note VARCHAR(255) DEFAULT NULL COMMENT '备注',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    
    -- 索引
    UNIQUE KEY unique_favorite (user_id, video_id),
    INDEX idx_user_id (user_id),
    INDEX idx_video_id (video_id),
    INDEX idx_collection_id (collection_id),
    INDEX idx_created_at (created_at DESC),
    
    -- 外键
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- ============================================
-- 6. 收藏夹表 (collections)
-- ============================================
DROP TABLE IF EXISTS collections;
CREATE TABLE collections (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '收藏夹ID',
    user_id INT NOT NULL COMMENT '用户ID',
    name VARCHAR(100) NOT NULL COMMENT '收藏夹名称',
    description TEXT COMMENT '收藏夹描述',
    cover_url VARCHAR(500) DEFAULT NULL COMMENT '封面图片',
    is_public TINYINT(1) DEFAULT 1 COMMENT '是否公开',
    video_count INT DEFAULT 0 COMMENT '视频数量',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    
    -- 外键
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏夹表';

-- ============================================
-- 7. 关注表 (subscriptions)
-- ============================================
DROP TABLE IF EXISTS subscriptions;
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '关注ID',
    subscriber_id INT NOT NULL COMMENT '关注者ID',
    channel_id INT NOT NULL COMMENT '被关注者ID',
    note VARCHAR(255) DEFAULT NULL COMMENT '备注',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',
    
    -- 索引
    UNIQUE KEY unique_subscription (subscriber_id, channel_id),
    INDEX idx_subscriber_id (subscriber_id),
    INDEX idx_channel_id (channel_id),
    INDEX idx_created_at (created_at),
    
    -- 外键
    FOREIGN KEY (subscriber_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注表';

-- ============================================
-- 8. 播放记录表 (watch_history)
-- ============================================
DROP TABLE IF EXISTS watch_history;
CREATE TABLE watch_history (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    user_id INT NOT NULL COMMENT '用户ID',
    video_id INT NOT NULL COMMENT '视频ID',
    progress INT DEFAULT 0 COMMENT '观看进度（秒）',
    duration INT DEFAULT 0 COMMENT '视频总时长',
    completed TINYINT(1) DEFAULT 0 COMMENT '是否看完',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '首次观看',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后观看',
    
    -- 索引
    UNIQUE KEY unique_watch (user_id, video_id),
    INDEX idx_user_id (user_id),
    INDEX idx_video_id (video_id),
    INDEX idx_updated_at (updated_at DESC),
    
    -- 外键
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='播放记录表';

-- ============================================
-- 9. 视频分类表 (categories)
-- ============================================
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    slug VARCHAR(50) NOT NULL COMMENT '分类别名',
    description TEXT COMMENT '分类描述',
    icon VARCHAR(100) DEFAULT NULL COMMENT '分类图标',
    parent_id INT DEFAULT NULL COMMENT '父分类ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    video_count INT DEFAULT 0 COMMENT '视频数量',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 索引
    UNIQUE KEY unique_slug (slug),
    INDEX idx_parent_id (parent_id),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='视频分类表';

-- ============================================
-- 10. 标签表 (tags)
-- ============================================
DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
    name VARCHAR(50) NOT NULL COMMENT '标签名称',
    slug VARCHAR(50) NOT NULL COMMENT '标签别名',
    color VARCHAR(20) DEFAULT '#6366f1' COMMENT '标签颜色',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    is_hot TINYINT(1) DEFAULT 0 COMMENT '是否热门',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 索引
    UNIQUE KEY unique_name (name),
    UNIQUE KEY unique_slug (slug),
    INDEX idx_usage_count (usage_count DESC),
    INDEX idx_is_hot (is_hot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- ============================================
-- 11. 视频标签关联表 (video_tags)
-- ============================================
DROP TABLE IF EXISTS video_tags;
CREATE TABLE video_tags (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    video_id INT NOT NULL COMMENT '视频ID',
    tag_id INT NOT NULL COMMENT '标签ID',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    -- 索引
    UNIQUE KEY unique_video_tag (video_id, tag_id),
    INDEX idx_video_id (video_id),
    INDEX idx_tag_id (tag_id),
    
    -- 外键
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='视频标签关联表';

-- ============================================
-- 12. AI创作任务表 (ai_jobs)
-- ============================================
DROP TABLE IF EXISTS ai_jobs;
CREATE TABLE ai_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
    job_id VARCHAR(64) UNIQUE NOT NULL COMMENT '任务唯一ID',
    user_id INT DEFAULT NULL COMMENT '用户ID（可选）',
    type ENUM('video', 'image', 'audio') NOT NULL COMMENT '任务类型',
    status ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' COMMENT '状态',
    
    -- 请求参数
    prompt TEXT COMMENT '提示词',
    negative_prompt TEXT COMMENT '负向提示词',
    params JSON COMMENT '其他参数',
    
    -- 结果
    result_url VARCHAR(500) DEFAULT NULL COMMENT '结果URL',
    result_data JSON DEFAULT NULL COMMENT '结果数据',
    error_message TEXT DEFAULT NULL COMMENT '错误信息',
    
    -- 进度
    progress INT DEFAULT 0 COMMENT '进度百分比',
    task_id VARCHAR(100) DEFAULT NULL COMMENT '第三方任务ID',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    completed_at DATETIME DEFAULT NULL COMMENT '完成时间',
    
    -- 索引
    INDEX idx_job_id (job_id),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI创作任务表';

-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认管理员
INSERT INTO users (username, nickname, email, password, role, status) 
VALUES ('admin', '管理员', 'admin@streamvibe.com', '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'admin', 'active')
ON DUPLICATE KEY UPDATE nickname = '管理员';

-- 插入默认分类
INSERT INTO categories (name, slug, description, sort_order) VALUES
('全部', 'all', '全部视频', 0),
('科技', 'tech', '科技相关视频', 1),
('游戏', 'gaming', '游戏视频', 2),
('音乐', 'music', '音乐视频', 3),
('电影', 'movies', '电影相关', 4),
('动漫', 'anime', '动漫视频', 5),
('生活', 'lifestyle', '生活方式', 6),
('教育', 'education', '教育内容', 7),
('体育', 'sports', '体育视频', 8),
('其他', 'other', '其他分类', 99)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 插入热门标签
INSERT INTO tags (name, slug, color, usage_count, is_hot) VALUES
('热门', 'hot', '#ef4444', 1000, 1),
('推荐', 'featured', '#f59e0b', 800, 1),
('新品', 'new', '#22c55e', 600, 1),
('必看', 'must-watch', '#6366f1', 500, 1),
('搞笑', 'funny', '#ec4899', 700, 1),
('精彩', 'amazing', '#8b5cf6', 400, 1),
('治愈', 'healing', '#14b8a6', 300, 1),
('震撼', 'stunning', '#f97316', 250, 1)
ON DUPLICATE KEY UPDATE usage_count = VALUES(usage_count);

-- ============================================
-- 创建视图
-- ============================================

-- 视频完整信息视图
CREATE OR REPLACE VIEW video_full_view AS
SELECT 
    v.id,
    v.video_id,
    v.title,
    v.description,
    v.video_url,
    v.thumbnail_url,
    v.duration,
    v.duration_seconds,
    v.file_size,
    v.width,
    v.height,
    v.quality,
    v.category,
    v.tags,
    v.views,
    v.likes_count,
    v.favorites_count,
    v.comments_count,
    v.shares_count,
    v.status,
    v.created_at,
    v.published_at,
    u.id as user_id,
    u.username,
    u.nickname as user_nickname,
    u.avatar_url as user_avatar
FROM videos v
LEFT JOIN users u ON v.user_id = u.id
WHERE v.status = 'approved' AND v.deleted_at IS NULL;

-- 用户统计视图
CREATE OR REPLACE VIEW user_stats_view AS
SELECT 
    u.id,
    u.username,
    u.nickname,
    u.avatar_url,
    u.subscribers_count,
    u.following_count,
    u.video_count,
    u.total_views,
    (SELECT COUNT(*) FROM comments c WHERE c.user_id = u.id) as comment_count,
    (SELECT COUNT(*) FROM likes l WHERE l.user_id = u.id) as like_count
FROM users u;

-- ============================================
-- 完成
-- ============================================
SELECT '数据库初始化完成！' as message;
