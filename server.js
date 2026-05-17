const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ============= 日志系统 =============
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = process.env.LOG_LEVEL ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO : LOG_LEVELS.INFO;

function log(level, prefix, message, data = null) {
  if (level > currentLogLevel) return;
  
  const timestamp = new Date().toISOString();
  const levelStr = Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k] === level) || 'INFO';
  const prefixStr = prefix ? `[${prefix}]` : '';
  
  let logMessage = `${timestamp} ${levelStr}${prefixStr} ${message}`;
  if (data) {
    logMessage += ' ' + JSON.stringify(data);
  }
  
  if (level === LOG_LEVELS.ERROR) {
    console.error('\x1b[31m' + logMessage + '\x1b[0m');
  } else if (level === LOG_LEVELS.WARN) {
    console.warn('\x1b[33m' + logMessage + '\x1b[0m');
  } else if (level === LOG_LEVELS.DEBUG) {
    console.debug('\x1b[90m' + logMessage + '\x1b[0m');
  } else {
    console.log('\x1b[36m' + logMessage + '\x1b[0m');
  }
}

const logger = {
  error: (msg, data) => log(LOG_LEVELS.ERROR, 'ERROR', msg, data),
  warn: (msg, data) => log(LOG_LEVELS.WARN, 'WARN', msg, data),
  info: (msg, data) => log(LOG_LEVELS.INFO, 'INFO', msg, data),
  debug: (msg, data) => log(LOG_LEVELS.DEBUG, 'DEBUG', msg, data)
};

// ============= 请求限流 =============
const rateLimiter = (() => {
  const requests = new Map();
  
  // 清理过期记录
  const cleanup = () => {
    const now = Date.now();
    for (const [key, data] of requests) {
      if (now - data.windowStart > data.windowMs) {
        requests.delete(key);
      }
    }
  };
  
  // 每分钟清理一次
  setInterval(cleanup, 60000);
  
  return (options = {}) => {
    const {
      windowMs = 60000, // 时间窗口（毫秒）
      maxRequests = 100, // 最大请求数
      keyGenerator = (req) => req.ip || req.connection.remoteAddress,
      message = '请求过于频繁，请稍后再试'
    } = options;
    
    return (req, res, next) => {
      const key = keyGenerator(req);
      const now = Date.now();
      
      if (!requests.has(key)) {
        requests.set(key, { count: 1, windowStart: now });
        return next();
      }
      
      const requestData = requests.get(key);
      
      // 如果时间窗口已过，重置计数
      if (now - requestData.windowStart > windowMs) {
        requests.set(key, { count: 1, windowStart: now });
        return next();
      }
      
      // 增加计数
      requestData.count++;
      
      // 检查是否超过限制
      if (requestData.count > maxRequests) {
        logger.warn('Rate limit exceeded', { key, count: requestData.count });
        return res.status(429).json({
          success: false,
          message: message,
          retryAfter: Math.ceil((windowMs - (now - requestData.windowStart)) / 1000)
        });
      }
      
      next();
    };
  };
})();

// 配置文件 - 支持环境变量覆盖
const config = {
  jwtSecret: process.env.JWT_SECRET || 'StreamVibeSecretKey2026ForJWTTokenGenerationAndValidation',
  dbPassword: process.env.DB_PASSWORD || '123456',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000'
};

logger.info('Server configuration loaded', { 
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development'
});

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// 全局限流：每分钟最多 120 个请求
app.use(rateLimiter({
  windowMs: 60000,
  maxRequests: 120,
  message: '请求过于频繁，请稍后再试'
}));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    logger[logLevel](`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });
  
  next();
});

// CORS headers for uploads directory (videos and thumbnails)
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    next();
}, express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'video') {
            cb(null, uploadsDir);
        } else if (file.fieldname === 'thumbnail') {
            cb(null, thumbnailsDir);
        } else {
            cb(null, uploadsDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024 // 5GB
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'video') {
            const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only video files are allowed'), false);
            }
        } else if (file.fieldname === 'thumbnail') {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed for thumbnails'), false);
            }
        } else {
            cb(null, true);
        }
    }
});

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'streamvibe',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize Database
async function initDatabase() {
    try {
        logger.info('Initializing database...');
        
        // Create connection without database first
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '123456'
        });

        // Create database if not exists
        await connection.query('CREATE DATABASE IF NOT EXISTS streamvibe');
        await connection.query('USE streamvibe');
        
        logger.info('Database connection established');

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                nickname VARCHAR(50),
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                password_sha256 VARCHAR(64) DEFAULT NULL,
                phone VARCHAR(20),
                avatar_url VARCHAR(255) DEFAULT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        // Add password_sha256 column if it doesn't exist
        try {
            const [columns] = await connection.query('SHOW COLUMNS FROM users LIKE ?', ['password_sha256']);
            if (columns.length === 0) {
                await connection.query(`
                    ALTER TABLE users ADD COLUMN password_sha256 VARCHAR(64) DEFAULT NULL AFTER password
                `);
            }
        } catch (e) {
            // Column might already exist, ignore error
        }

        // Create videos table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS videos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                video_url VARCHAR(500) NOT NULL,
                thumbnail_url VARCHAR(500),
                duration VARCHAR(20),
                category VARCHAR(50),
                tags JSON,
                quality VARCHAR(20) DEFAULT '1080P',
                views INT DEFAULT 0,
                user_id INT NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_category (category),
                INDEX idx_status (status),
                INDEX idx_title (title),
                FULLTEXT idx_search (title, description),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create admin user if not exists
        const [adminExists] = await connection.query('SELECT id FROM users WHERE username = ?', ['admin']);
        if (adminExists.length === 0) {
            const hashedPassword = await bcrypt.hash(config.adminPassword, 10);
            await connection.query(
                'INSERT INTO users (username, nickname, email, password, role) VALUES (?, ?, ?, ?, ?)',
                ['admin', '管理员', 'admin@streamvibe.com', hashedPassword, 'admin']
            );
            console.log(`Admin user created: admin / ${config.adminPassword}`);
        }

        // Create comments table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                video_id INT NOT NULL,
                user_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_video_id (video_id),
                INDEX idx_user_id (user_id),
                FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create favorites table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS favorites (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                video_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_favorite (user_id, video_id),
                INDEX idx_user_id (user_id),
                INDEX idx_video_id (video_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create likes table (video likes)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                video_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_like (user_id, video_id),
                INDEX idx_user_id (user_id),
                INDEX idx_video_id (video_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Add likes_count column to videos table if not exists (MySQL compatible way)
        try {
            const [columns] = await connection.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'videos' AND COLUMN_NAME = 'likes_count'`, [config.database]);
            if (columns.length === 0) {
                await connection.query(`ALTER TABLE videos ADD COLUMN likes_count INT DEFAULT 0`);
                console.log('Added likes_count column to videos table');
            }
        } catch (e) {
            // Column might already exist, ignore error
            console.log('likes_count column check/add:', e.message);
        }

        // Create subscriptions table (subscribe to authors)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subscriber_id INT NOT NULL,
                channel_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_subscription (subscriber_id, channel_id),
                INDEX idx_subscriber_id (subscriber_id),
                INDEX idx_channel_id (channel_id),
                FOREIGN KEY (subscriber_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (channel_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Add subscribers_count column to users table if not exists (MySQL compatible way)
        try {
            const [columns] = await connection.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'subscribers_count'`, [config.database]);
            if (columns.length === 0) {
                await connection.query(`ALTER TABLE users ADD COLUMN subscribers_count INT DEFAULT 0`);
                console.log('Added subscribers_count column to users table');
            }
        } catch (e) {
            // Column might already exist, ignore error
            console.log('subscribers_count column check/add:', e.message);
        }

        // Insert sample videos if table is empty
        const [videoCount] = await connection.query('SELECT COUNT(*) as count FROM videos');
        if (videoCount[0].count === 0) {
            const sampleVideos = [
                ['星际穿越：平行宇宙的无限可能', '一部震撼人心的科幻巨制，探索宇宙的奥秘', '/uploads/video-1778924984288-720925202.mp4', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80', '9:56', 'movie', JSON.stringify(['科幻', '冒险', '太空']), '4K'],
                ['灌篮高手：全国大赛篇', '青春热血的篮球故事', '/uploads/video-1778955707253-339412962.mp4', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80', '10:53', 'anime', JSON.stringify(['运动', '热血', '青春']), '1080P'],
                ['速度与激情10：终极对决', '肾上腺素飙升的飙车盛宴', '/uploads/video-1778924984288-720925202.mp4', 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=800&q=80', '0:15', 'movie', JSON.stringify(['动作', '赛车', '惊险']), '4K'],
                ['甄嬛传：宫廷恩怨', '经典宫斗大戏', '/uploads/video-1778955707253-339412962.mp4', 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&q=80', '0:15', 'drama', JSON.stringify(['宫斗', '历史', '爱情']), '1080P'],
                ['地球脉动：自然奇观', '探索大自然的奥秘', '/uploads/video-1778924984288-720925202.mp4', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', '1:00', 'documentary', JSON.stringify(['自然', '科普', '纪录']), '4K'],
                ['蜘蛛侠：多元宇宙', '穿梭多元宇宙的英雄故事', '/uploads/video-1778955707253-339412962.mp4', 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&q=80', '0:15', 'movie', JSON.stringify(['超级英雄', '科幻', '动作']), '4K'],
                ['向往的生活：田园时光', '远离喧嚣的田园生活', '/uploads/video-1778924984288-720925202.mp4', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', '0:15', 'variety', JSON.stringify(['慢综艺', '生活', '治愈']), '1080P'],
                ['周杰伦：经典演唱会', '华语乐坛天王演唱会', '/uploads/video-1778955707253-339412962.mp4', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', '14:48', 'music', JSON.stringify(['演唱会', '音乐', '流行']), '4K'],
                ['NBA总决赛精彩集锦', '篮球巅峰对决', '/uploads/video-1778924984288-720925202.mp4', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80', '0:11', 'sports', JSON.stringify(['篮球', '体育', 'NBA']), '1080P']
            ];
            
            const [adminUser] = await connection.query('SELECT id FROM users WHERE username = ?', ['admin']);
            const adminId = adminUser[0].id;
            
            for (const video of sampleVideos) {
                await connection.query(
                    'INSERT INTO videos (title, description, video_url, thumbnail_url, duration, category, tags, quality, user_id, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [...video, adminId, Math.floor(Math.random() * 10000000)]
                );
            }
            console.log('Sample videos inserted');
        }

        await connection.end();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error.message);
        throw error;
    }
}

// Register API (backward compatible)
app.post('/api/register', async (req, res) => {
    try {
        const { username, nickname, email, password, phone } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名、账号和密码不能为空' 
            });
        }

        if (password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: '密码长度至少为8位' 
            });
        }

        // Check if user exists (case-insensitive)
        const usernameLower = username.toLowerCase();
        const emailLower = email.toLowerCase();
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?',
            [usernameLower, emailLower]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: '用户名或邮箱已被注册' 
            });
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.query(
            'INSERT INTO users (username, nickname, email, password, phone) VALUES (?, ?, ?, ?, ?)',
            [username, nickname || username, email, hashedPassword, phone || null]
        );

        res.status(201).json({
            success: true,
            message: '注册成功',
            user: {
                id: result.insertId,
                username,
                nickname: nickname || username,
                email
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误: ' + error.message 
        });
    }
});

// Register API (aliased for frontend compatibility)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, nickname, email, password, phone } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名、账号和密码不能为空' 
            });
        }

        if (password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: '密码长度至少为8位' 
            });
        }

        // Check if user exists (case-insensitive)
        const usernameLower = username.toLowerCase();
        const emailLower = email.toLowerCase();
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?',
            [usernameLower, emailLower]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: '用户名或邮箱已被注册' 
            });
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.query(
            'INSERT INTO users (username, nickname, email, password, phone) VALUES (?, ?, ?, ?, ?)',
            [username, nickname || username, email, hashedPassword, phone || null]
        );

        res.status(201).json({
            success: true,
            message: '注册成功',
            user: {
                id: result.insertId,
                username,
                nickname: nickname || username,
                email
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误: ' + error.message 
        });
    }
});

// Auth login API - same as /api/login but for frontend compatibility
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: '账号和密码不能为空' 
            });
        }

        // Find user by email or username (case-insensitive)
        const emailLower = email.toLowerCase();
        const [users] = await pool.query(
            'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?',
            [emailLower, emailLower]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: '账号或密码错误' 
            });
        }

        const user = users[0];

        // 密码验证
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: '账号或密码错误' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            config.jwtSecret,
            { expiresIn: '7d' }
        );

        // Return user info (without password)
        res.json({
            success: true,
            message: '登录成功',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                email: user.email,
                avatar_url: user.avatar_url,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误，请稍后重试' 
        });
    }
});

// Get user info API
app.get('/api/user/:id', async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username, nickname, email, avatar_url, role, created_at FROM users WHERE id = ?',
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '用户不存在' 
            });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误' 
        });
    }
});

// ========== Admin APIs ==========

// Admin middleware - check if user is admin (从 JWT 解码获取用户 ID)
const isAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: '未登录' });
        }
        
        const token = authHeader.split(' ')[1];
        // 解码 JWT token 获取用户 ID
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwtSecret);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Token 无效或已过期' });
        }
        
        const userId = decoded.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: '无法验证身份' });
        }
        
        const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
        if (users.length === 0 || users[0].role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: '需要管理员权限' });
        }
        
        // 将用户 ID 附加到请求对象，供后续使用
        req.userId = userId;
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 通用认证中间件 - 验证 JWT token
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token 无效或已过期' });
    }
};

// Get all users
app.get('/api/admin/users', async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username, nickname, email, phone, avatar_url, role, created_at FROM users ORDER BY id'
        );
        res.json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: '获取用户列表失败' });
    }
});

// Update user role
app.put('/api/admin/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (role !== 'USER' && role !== 'ADMIN') {
            return res.status(400).json({ success: false, message: '无效的角色' });
        }
        
        await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ success: true, message: '角色更新成功' });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ success: false, message: '更新角色失败' });
    }
});

// Delete user
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user exists
        const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }
        
        // Delete user (cascade will handle related data)
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true, message: '用户删除成功' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: '删除用户失败' });
    }
});

// Get all videos
app.get('/api/admin/videos', async (req, res) => {
    try {
        const [videos] = await pool.query(`
            SELECT v.*, u.username as uploader_name, u.nickname as uploader_nickname 
            FROM videos v 
            LEFT JOIN users u ON v.user_id = u.id 
            ORDER BY v.created_at DESC
        `);
        const baseUrl = getBaseUrl(req);
        const videosWithFullUrl = videos.map(video => ({
            ...video,
            video_url: video.video_url.startsWith('http') ? video.video_url : baseUrl + video.video_url,
            thumbnail_url: video.thumbnail_url ? (video.thumbnail_url.startsWith('http') ? video.thumbnail_url : baseUrl + video.thumbnail_url) : null
        }));
        res.json({ success: true, videos: videosWithFullUrl });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({ success: false, message: '获取视频列表失败' });
    }
});

// Delete video
app.delete('/api/admin/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if video exists and get video_url for file cleanup
        const [videos] = await pool.query('SELECT id, video_url, thumbnail_url FROM videos WHERE id = ?', [id]);
        if (videos.length === 0) {
            return res.status(404).json({ success: false, message: '视频不存在' });
        }
        
        // Delete associated comments first
        await pool.query('DELETE FROM comments WHERE video_id = ?', [id]);
        
        // Delete the video
        await pool.query('DELETE FROM videos WHERE id = ?', [id]);
        
        // Try to delete the video file from disk
        const video = videos[0];
        if (video.video_url && !video.video_url.startsWith('http')) {
            const videoPath = path.join(__dirname, video.video_url);
            if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath);
            }
        }
        if (video.thumbnail_url && !video.thumbnail_url.startsWith('http')) {
            const thumbPath = path.join(__dirname, video.thumbnail_url);
            if (fs.existsSync(thumbPath)) {
                fs.unlinkSync(thumbPath);
            }
        }
        
        res.json({ success: true, message: '视频删除成功' });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({ success: false, message: '删除视频失败' });
    }
});

// Update video
app.put('/api/admin/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, status, quality, tags, user_id } = req.body;
        
        // Check if video exists
        const [videos] = await pool.query('SELECT id FROM videos WHERE id = ?', [id]);
        if (videos.length === 0) {
            return res.status(404).json({ success: false, message: '视频不存在' });
        }
        
        // Build update query dynamically
        const updates = [];
        const params = [];
        
        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (category !== undefined) {
            updates.push('category = ?');
            params.push(category);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }
        if (quality !== undefined) {
            updates.push('quality = ?');
            params.push(quality);
        }
        if (tags !== undefined) {
            updates.push('tags = ?');
            params.push(typeof tags === 'string' ? tags : JSON.stringify(tags));
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: '没有要更新的字段' });
        }
        
        params.push(id);
        
        await pool.query(`UPDATE videos SET ${updates.join(', ')} WHERE id = ?`, params);
        
        // Get updated video
        const [updatedVideos] = await pool.query('SELECT * FROM videos WHERE id = ?', [id]);
        res.json({ success: true, message: '视频更新成功', video: updatedVideos[0] });
    } catch (error) {
        console.error('Update video error:', error);
        res.status(500).json({ success: false, message: '更新视频失败' });
    }
});

// Get all comments
app.get('/api/admin/comments', async (req, res) => {
    try {
        const [comments] = await pool.query(`
            SELECT c.*, u.username as user_name, v.title as video_title
            FROM comments c 
            LEFT JOIN users u ON c.user_id = u.id 
            LEFT JOIN videos v ON c.video_id = v.id 
            ORDER BY c.created_at DESC
        `);
        res.json({ success: true, comments });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ success: false, message: '获取评论列表失败' });
    }
});

// Delete comment
app.delete('/api/admin/comments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [comments] = await pool.query('SELECT id FROM comments WHERE id = ?', [id]);
        if (comments.length === 0) {
            return res.status(404).json({ success: false, message: '评论不存在' });
        }
        
        await pool.query('DELETE FROM comments WHERE id = ?', [id]);
        res.json({ success: true, message: '评论删除成功' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ success: false, message: '删除评论失败' });
    }
});

// Get admin stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [videoCount] = await pool.query('SELECT COUNT(*) as count FROM videos');
        const [commentCount] = await pool.query('SELECT COUNT(*) as count FROM comments');
        const [activeUsers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role != "DISABLED"');
        
        res.json({
            success: true,
            stats: {
                totalUsers: userCount[0].count,
                totalVideos: videoCount[0].count,
                totalComments: commentCount[0].count,
                activeUsers: activeUsers[0].count
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: '获取统计数据失败' });
    }
});

// Video Upload API (with file upload)
app.post('/api/videos', upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, description, duration, category, tags, quality, user_id, rating, allowComments, allowDownload, isPublic } = req.body;

        if (!title || !user_id) {
            return res.status(400).json({
                success: false,
                message: '标题和用户ID不能为空'
            });
        }

        // Verify user exists
        const [users] = await pool.query('SELECT id, role FROM users WHERE id = ?', [user_id]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        // Get file paths
        let videoUrl = '';
        let thumbnailUrl = '';

        if (req.files['video'] && req.files['video'][0]) {
            videoUrl = '/uploads/' + req.files['video'][0].filename;
        }

        if (req.files['thumbnail'] && req.files['thumbnail'][0]) {
            thumbnailUrl = '/uploads/thumbnails/' + req.files['thumbnail'][0].filename;
        }

        // Parse tags
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {
                parsedTags = tags.split(',').map(t => t.trim()).filter(t => t);
            }
        }

        // Insert video
        const [result] = await pool.query(
            `INSERT INTO videos (title, description, video_url, thumbnail_url, duration, category, tags, quality, user_id, views) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                description || '',
                videoUrl || '/uploads/video-1778924984288-720925202.mp4',
                thumbnailUrl || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80',
                duration || '00:00',
                category || 'other',
                JSON.stringify(parsedTags),
                quality || '1080P',
                user_id,
                0
            ]
        );

        // Get the inserted video with uploader info
        const [videos] = await pool.query(
            `SELECT v.*, u.username as uploader_name, u.nickname as uploader_nickname 
             FROM videos v 
             LEFT JOIN users u ON v.user_id = u.id 
             WHERE v.id = ?`,
            [result.insertId]
        );

        const baseUrl = getBaseUrl(req);
        const videoData = videos[0];

        res.status(201).json({
            success: true,
            message: '视频上传成功',
            video: {
                ...videoData,
                video_url: videoUrl ? baseUrl + videoUrl : videoData.video_url,
                thumbnail_url: thumbnailUrl ? baseUrl + thumbnailUrl : videoData.thumbnail_url,
                tags: parsedTags
            }
        });
    } catch (error) {
        console.error('Video upload error:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试'
        });
    }
});

// Video Upload API (JSON with base64 - fallback)
app.post('/api/videos/json', async (req, res) => {
    try {
        const { title, description, videoData, thumbnailData, duration, category, tags, quality, user_id } = req.body;

        if (!title || !user_id) {
            return res.status(400).json({
                success: false,
                message: '标题和用户ID不能为空'
            });
        }

        // Verify user exists
        const [users] = await pool.query('SELECT id, role FROM users WHERE id = ?', [user_id]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        let videoUrl = '';
        let thumbnailUrl = '';

        // Save video file
        if (videoData) {
            try {
                const videoBuffer = Buffer.from(videoData, 'base64');
                const videoFilename = 'video-' + Date.now() + '.mp4';
                const videoPath = path.join(uploadsDir, videoFilename);
                fs.writeFileSync(videoPath, videoBuffer);
                videoUrl = '/uploads/' + videoFilename;
            } catch (e) {
                console.error('Error saving video:', e);
            }
        }

        // Save thumbnail file
        if (thumbnailData) {
            try {
                const thumbBuffer = Buffer.from(thumbnailData, 'base64');
                const thumbFilename = 'thumb-' + Date.now() + '.jpg';
                const thumbPath = path.join(thumbnailsDir, thumbFilename);
                fs.writeFileSync(thumbPath, thumbBuffer);
                thumbnailUrl = '/uploads/thumbnails/' + thumbFilename;
            } catch (e) {
                console.error('Error saving thumbnail:', e);
            }
        }

        // Parse tags
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {
                parsedTags = [];
            }
        }

        // Insert video
        const [result] = await pool.query(
            `INSERT INTO videos (title, description, video_url, thumbnail_url, duration, category, tags, quality, user_id, views) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                description || '',
                videoUrl || '/uploads/video-1778924984288-720925202.mp4',
                thumbnailUrl || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80',
                duration || '00:00',
                category || 'other',
                JSON.stringify(parsedTags),
                quality || '1080P',
                user_id,
                0
            ]
        );

        // Get the inserted video with uploader info
        const [videos] = await pool.query(
            `SELECT v.*, u.username as uploader_name, u.nickname as uploader_nickname 
             FROM videos v 
             LEFT JOIN users u ON v.user_id = u.id 
             WHERE v.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: '视频上传成功',
            video: {
                ...videos[0],
                tags: parsedTags
            }
        });
    } catch (error) {
        console.error('Video upload error:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试'
        });
    }
});

// Helper function to get full URL for uploads
const getBaseUrl = (req) => {
    if (process.env.NODE_ENV === 'production') {
        return `${req.protocol}://${req.get('host')}`;
    }
    return config.baseUrl;
}

// Get videos API with search
app.get('/api/videos', async (req, res) => {
    try {
        const { category, user_id, status = 'approved', search, page = 1, limit = 20 } = req.query;
        
        let query = `
            SELECT v.*, u.username as uploader_name, u.nickname as uploader_nickname, u.avatar_url as uploader_avatar
            FROM videos v
            LEFT JOIN users u ON v.user_id = u.id
            WHERE v.status = ?
        `;
        const params = [status];

        if (category && category !== 'all') {
            query += ' AND v.category = ?';
            params.push(category);
        }

        if (user_id) {
            query += ' AND v.user_id = ?';
            params.push(user_id);
        }

        // Search functionality
        if (search && search.trim()) {
            const searchTerm = '%' + search.trim() + '%';
            query += ' AND (v.title LIKE ? OR v.description LIKE ?)';
            params.push(searchTerm, searchTerm);
        }

        // Get total count
        const countQuery = query.replace('SELECT v.*, u.username as uploader_name, u.nickname as uploader_nickname, u.avatar_url as uploader_avatar', 'SELECT COUNT(*) as total');
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        // Add pagination
        query += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';
        const offset = (parseInt(page) - 1) * parseInt(limit);
        params.push(parseInt(limit), offset);

        const [videos] = await pool.query(query, params);
        const baseUrl = getBaseUrl(req);

        // Parse tags JSON and add full URLs
        const parsedVideos = videos.map(video => ({
            ...video,
            video_url: video.video_url.startsWith('http') ? video.video_url : baseUrl + video.video_url,
            thumbnail_url: video.thumbnail_url ? (video.thumbnail_url.startsWith('http') ? video.thumbnail_url : baseUrl + video.thumbnail_url) : null,
            tags: typeof video.tags === 'string' ? JSON.parse(video.tags || '[]') : (video.tags || [])
        }));

        res.json({
            success: true,
            videos: parsedVideos,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// Get single video API
app.get('/api/videos/:id', async (req, res) => {
    try {
        const [videos] = await pool.query(
            `SELECT v.*, u.username as uploader_name, u.nickname as uploader_nickname, u.avatar_url as uploader_avatar
             FROM videos v
             LEFT JOIN users u ON v.user_id = u.id
             WHERE v.id = ?`,
            [req.params.id]
        );

        if (videos.length === 0) {
            return res.status(404).json({
                success: false,
                message: '视频不存在'
            });
        }

        const baseUrl = getBaseUrl(req);
        const video = {
            ...videos[0],
            video_url: videos[0].video_url.startsWith('http') ? videos[0].video_url : baseUrl + videos[0].video_url,
            thumbnail_url: videos[0].thumbnail_url ? (videos[0].thumbnail_url.startsWith('http') ? videos[0].thumbnail_url : baseUrl + videos[0].thumbnail_url) : null,
            tags: typeof videos[0].tags === 'string' ? JSON.parse(videos[0].tags || '[]') : (videos[0].tags || [])
        };

        // Increment views
        await pool.query('UPDATE videos SET views = views + 1 WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            video: video
        });
    } catch (error) {
        console.error('Get video error:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// Get comments for a video
app.get('/api/videos/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        // Get comments with user info
        const [comments] = await pool.query(
            `SELECT c.id, c.content, c.created_at, u.username, u.nickname, u.avatar_url
             FROM comments c
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.video_id = ?
             ORDER BY c.created_at DESC
             LIMIT ? OFFSET ?`,
            [id, parseInt(limit), parseInt(offset)]
        );

        // Get total count
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM comments WHERE video_id = ?',
            [id]
        );

        res.json({
            success: true,
            comments: comments.map(c => ({
                id: c.id,
                content: c.content,
                created_at: c.created_at,
                user_name: c.nickname || c.username || '匿名用户',
                avatar_url: c.avatar_url
            })),
            total: countResult[0].total
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ success: false, message: '获取评论失败' });
    }
});

// Add comment to a video
app.post('/api/videos/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, user_id } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: '评论内容不能为空' });
        }

        if (!user_id) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        // Verify video exists
        const [videos] = await pool.query('SELECT id FROM videos WHERE id = ?', [id]);
        if (videos.length === 0) {
            return res.status(404).json({ success: false, message: '视频不存在' });
        }

        // Insert comment
        const [result] = await pool.query(
            'INSERT INTO comments (video_id, user_id, content) VALUES (?, ?, ?)',
            [id, user_id, content.trim()]
        );

        // Get the inserted comment with user info
        const [comments] = await pool.query(
            `SELECT c.id, c.content, c.created_at, u.username, u.nickname, u.avatar_url
             FROM comments c
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.id = ?`,
            [result.insertId]
        );

        const comment = comments[0];
        res.json({
            success: true,
            comment: {
                id: comment.id,
                content: comment.content,
                created_at: comment.created_at,
                user_name: comment.nickname || comment.username || '匿名用户',
                avatar_url: comment.avatar_url
            }
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ success: false, message: '发表评论失败' });
    }
});

// ========== Favorites API ==========

// Get user's favorites
app.get('/api/favorites', async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        // Convert to integer to ensure type safety
        const userIdInt = parseInt(user_id, 10);
        
        const [favorites] = await pool.query(
            `SELECT v.*, u.username as uploader_name, u.nickname as uploader_nickname,
                    f.id as favorite_id, f.created_at as favorited_at
             FROM favorites f
             LEFT JOIN videos v ON f.video_id = v.id
             LEFT JOIN users u ON v.user_id = u.id
             WHERE f.user_id = ?
             ORDER BY f.created_at DESC`,
            [userIdInt]
        );

        const baseUrl = getBaseUrl(req);
        const formattedVideos = favorites
            .filter(v => v.id !== null) // 过滤掉视频已被删除的收藏
            .map(v => ({
                ...v,
                video_url: v.video_url ? (v.video_url.startsWith('http') ? v.video_url : baseUrl + v.video_url) : '',
                thumbnail_url: v.thumbnail_url ? (v.thumbnail_url.startsWith('http') ? v.thumbnail_url : baseUrl + v.thumbnail_url) : null,
                tags: typeof v.tags === 'string' ? JSON.parse(v.tags || '[]') : (v.tags || [])
            }));

        res.json({ success: true, favorites: formattedVideos });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ success: false, message: '获取收藏失败' });
    }
});

// Check if video is favorited
app.get('/api/favorites/check', async (req, res) => {
    try {
        const { user_id, video_id } = req.query;
        if (!user_id) {
            return res.json({ success: true, isFavorited: false });
        }

        // Convert to integer
        const userIdInt = parseInt(user_id, 10);
        const videoIdInt = parseInt(video_id, 10);

        const [favorites] = await pool.query(
            'SELECT id FROM favorites WHERE user_id = ? AND video_id = ?',
            [userIdInt, videoIdInt]
        );

        res.json({ success: true, isFavorited: favorites.length > 0 });
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ success: false, message: '检查收藏失败' });
    }
});

// Add to favorites
app.post('/api/favorites', async (req, res) => {
    try {
        const { user_id, video_id } = req.body;
        if (!user_id) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        // Convert to integer
        const userIdInt = parseInt(user_id, 10);
        const videoIdInt = parseInt(video_id, 10);

        // Check if video exists
        const [videos] = await pool.query('SELECT id FROM videos WHERE id = ?', [videoIdInt]);
        if (videos.length === 0) {
            return res.status(404).json({ success: false, message: '视频不存在' });
        }

        // Check if already favorited
        const [existing] = await pool.query(
            'SELECT id FROM favorites WHERE user_id = ? AND video_id = ?',
            [userIdInt, videoIdInt]
        );

        if (existing.length > 0) {
            return res.json({ success: true, message: '已收藏' });
        }

        await pool.query(
            'INSERT INTO favorites (user_id, video_id) VALUES (?, ?)',
            [userIdInt, videoIdInt]
        );

        res.json({ success: true, message: '收藏成功' });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ success: false, message: '收藏失败' });
    }
});

// Remove from favorites
app.delete('/api/favorites', async (req, res) => {
    try {
        const { user_id, video_id } = req.query;
        if (!user_id) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        // Convert to integer
        const userIdInt = parseInt(user_id, 10);
        const videoIdInt = parseInt(video_id, 10);

        await pool.query(
            'DELETE FROM favorites WHERE user_id = ? AND video_id = ?',
            [userIdInt, videoIdInt]
        );

        res.json({ success: true, message: '已取消收藏' });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ success: false, message: '取消收藏失败' });
    }
});

// ========== Likes API ==========

// Get user's liked videos
app.get('/api/likes', async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        const userIdInt = parseInt(user_id, 10);
        
        const [likes] = await pool.query(
            `SELECT v.*, u.username as uploader_name, u.nickname as uploader_nickname,
                    l.id as like_id, l.created_at as liked_at
             FROM likes l
             LEFT JOIN videos v ON l.video_id = v.id
             LEFT JOIN users u ON v.user_id = u.id
             WHERE l.user_id = ?
             ORDER BY l.created_at DESC`,
            [userIdInt]
        );

        const baseUrl = getBaseUrl(req);
        const formattedVideos = likes
            .filter(v => v.id !== null)
            .map(v => ({
                ...v,
                video_url: v.video_url ? (v.video_url.startsWith('http') ? v.video_url : baseUrl + v.video_url) : '',
                thumbnail_url: v.thumbnail_url ? (v.thumbnail_url.startsWith('http') ? v.thumbnail_url : baseUrl + v.thumbnail_url) : null,
                tags: typeof v.tags === 'string' ? JSON.parse(v.tags || '[]') : (v.tags || [])
            }));

        res.json({ success: true, likes: formattedVideos });
    } catch (error) {
        console.error('Get likes error:', error);
        res.status(500).json({ success: false, message: '获取点赞失败' });
    }
});

// Check if video is liked
app.get('/api/likes/check', async (req, res) => {
    try {
        const { user_id, video_id } = req.query;
        if (!user_id) {
            return res.json({ success: true, isLiked: false });
        }

        const userIdInt = parseInt(user_id, 10);
        const videoIdInt = parseInt(video_id, 10);

        const [likes] = await pool.query(
            'SELECT id FROM likes WHERE user_id = ? AND video_id = ?',
            [userIdInt, videoIdInt]
        );

        res.json({ success: true, isLiked: likes.length > 0 });
    } catch (error) {
        console.error('Check like error:', error);
        res.status(500).json({ success: false, message: '检查点赞失败' });
    }
});

// Add like
app.post('/api/likes', async (req, res) => {
    try {
        const { user_id, video_id } = req.body;
        if (!user_id) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        const userIdInt = parseInt(user_id, 10);
        const videoIdInt = parseInt(video_id, 10);

        // Check if video exists
        const [videos] = await pool.query('SELECT id, user_id FROM videos WHERE id = ?', [videoIdInt]);
        if (videos.length === 0) {
            return res.status(404).json({ success: false, message: '视频不存在' });
        }

        // Check if already liked
        const [existing] = await pool.query(
            'SELECT id FROM likes WHERE user_id = ? AND video_id = ?',
            [userIdInt, videoIdInt]
        );

        if (existing.length > 0) {
            return res.json({ success: true, message: '已点赞' });
        }

        await pool.query(
            'INSERT INTO likes (user_id, video_id) VALUES (?, ?)',
            [userIdInt, videoIdInt]
        );

        // Update likes_count in videos table (safely, in case column doesn't exist)
        try {
            await pool.query('UPDATE videos SET likes_count = likes_count + 1 WHERE id = ?', [videoIdInt]);
        } catch (e) {
            // Ignore if likes_count column doesn't exist
            console.log('likes_count update skipped:', e.message);
        }

        res.json({ success: true, message: '点赞成功' });
    } catch (error) {
        console.error('Add like error:', error);
        res.status(500).json({ success: false, message: '点赞失败: ' + error.message });
    }
});

// Remove like
app.delete('/api/likes', async (req, res) => {
    try {
        const { user_id, video_id } = req.query;
        if (!user_id) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        const userIdInt = parseInt(user_id, 10);
        const videoIdInt = parseInt(video_id, 10);

        await pool.query(
            'DELETE FROM likes WHERE user_id = ? AND video_id = ?',
            [userIdInt, videoIdInt]
        );

        // Update likes_count in videos table (safely, in case column doesn't exist)
        try {
            await pool.query('UPDATE videos SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?', [videoIdInt]);
        } catch (e) {
            // Ignore if likes_count column doesn't exist
            console.log('likes_count update skipped:', e.message);
        }

        res.json({ success: true, message: '已取消点赞' });
    } catch (error) {
        console.error('Remove like error:', error);
        res.status(500).json({ success: false, message: '取消点赞失败: ' + error.message });
    }
});

// Get likes count for a video
app.get('/api/likes/count', async (req, res) => {
    try {
        const { video_id } = req.query;
        if (!video_id) {
            return res.json({ success: true, count: 0 });
        }

        const videoIdInt = parseInt(video_id, 10);
        
        // Try to get likes_count from videos table first
        try {
            const [videos] = await pool.query('SELECT likes_count FROM videos WHERE id = ?', [videoIdInt]);
            if (videos.length > 0) {
                return res.json({ success: true, count: videos[0].likes_count || 0 });
            }
        } catch (e) {
            // likes_count column might not exist, fall back to counting
        }
        
        // Fall back: count likes from likes table
        const [countResult] = await pool.query('SELECT COUNT(*) as count FROM likes WHERE video_id = ?', [videoIdInt]);
        res.json({ success: true, count: countResult[0].count || 0 });
    } catch (error) {
        console.error('Get likes count error:', error);
        res.status(500).json({ success: false, message: '获取点赞数失败' });
    }
});

// ========== AI Creation API ==========
// 统一的 AI 创作接口，支持连接外部 AI 服务

const AI_CONFIG = {
    // 是否启用 AI 服务
    enabled: true,
    // AI 服务提供商: 'volcengine' | 'cloud' | 'custom'
    provider: 'volcengine',
    // API 地址
    customApiUrl: 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks',
    // API Key
    customApiKey: 'ark-ae010a11-d2eb-4f1b-abf5-0787e8f4f1d9-89124',
    // 火山引擎模型ID
    volcengineModel: 'doubao-seedance-1-5-pro-251215',
    // Cloud Studio Token（从 connect_cloud_service 获取）
    cloudToken: null
};

// 存储进行中的任务
const aiJobs = new Map();

// 设置 Cloud Token
app.post('/api/ai/set-token', (req, res) => {
    const { token } = req.body;
    if (token) {
        AI_CONFIG.cloudToken = token;
        res.json({ success: true, message: 'Token 已设置' });
    } else {
        res.status(400).json({ success: false, message: 'Token 不能为空' });
    }
});

// 获取 AI 服务状态
app.get('/api/ai/status', (req, res) => {
    res.json({
        success: true,
        enabled: AI_CONFIG.enabled,
        provider: AI_CONFIG.provider,
        hasToken: !!(AI_CONFIG.cloudToken || AI_CONFIG.customApiKey)
    });
});

// 文生视频
app.post('/api/ai/video', async (req, res) => {
    try {
        const { prompt, negative_prompt, duration, resolution, style } = req.body;
        
        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ success: false, message: '请输入视频描述' });
        }

        if (!AI_CONFIG.enabled) {
            return res.status(503).json({ 
                success: false, 
                message: 'AI 服务未启用，请联系管理员配置',
                code: 'AI_SERVICE_DISABLED'
            });
        }

        // 生成任务ID
        const jobId = `video_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        
        res.json({ 
            success: true, 
            job_id: jobId,
            status: 'SUBMITTED',
            message: '任务已提交，请通过状态接口查询结果'
        });

        // 后台异步执行
        executeAIVideo(jobId, { prompt, negative_prompt, duration, resolution, style });
        
    } catch (error) {
        console.error('AI Video Error:', error);
        res.status(500).json({ success: false, message: '提交任务失败' });
    }
});

// 文生图片
app.post('/api/ai/image', async (req, res) => {
    try {
        const { prompt, negative_prompt, style, width, height } = req.body;
        
        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ success: false, message: '请输入图片描述' });
        }

        if (!AI_CONFIG.enabled) {
            return res.status(503).json({ 
                success: false, 
                message: 'AI 服务未启用，请联系管理员配置',
                code: 'AI_SERVICE_DISABLED'
            });
        }

        const jobId = `image_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        
        res.json({ 
            success: true, 
            job_id: jobId,
            status: 'SUBMITTED',
            message: '任务已提交，请通过状态接口查询结果'
        });

        executeAIImage(jobId, { prompt, negative_prompt, style, width, height });
        
    } catch (error) {
        console.error('AI Image Error:', error);
        res.status(500).json({ success: false, message: '提交任务失败' });
    }
});

// 查询任务状态
app.get('/api/ai/status/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = aiJobs.get(jobId);
    
    if (!job) {
        return res.status(404).json({ 
            success: false, 
            message: '任务不存在或已过期',
            job_id: jobId
        });
    }
    
    res.json({
        success: true,
        job_id: jobId,
        status: job.status,
        progress: job.progress || 0,
        result_url: job.resultUrl || null,
        error: job.error || null,
        created_at: job.createdAt,
        updated_at: job.updatedAt
    });
});

// 获取任务列表
app.get('/api/ai/jobs', (req, res) => {
    const { status, limit = 20 } = req.query;
    let jobs = Array.from(aiJobs.values());
    
    if (status) {
        jobs = jobs.filter(j => j.status === status);
    }
    
    // 按时间倒序
    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
        success: true,
        jobs: jobs.slice(0, parseInt(limit))
    });
});

// 异步执行 AI 视频生成
async function executeAIVideo(jobId, params) {
    const job = {
        id: jobId,
        type: 'video',
        status: 'PENDING',
        progress: 0,
        params: params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    aiJobs.set(jobId, job);
    
    try {
        job.status = 'RUNNING';
        job.progress = 10;
        job.updatedAt = new Date().toISOString();
        
        // 如果有 Cloud Token，使用 Cloud 服务
        if (AI_CONFIG.cloudToken) {
            job.progress = 30;
            job.updatedAt = new Date().toISOString();
            
            // 调用 Cloud AI 服务
            const result = await callCloudAI('video', params.prompt, AI_CONFIG.cloudToken);
            
            job.progress = 90;
            job.updatedAt = new Date().toISOString();
            
            if (result.success) {
                job.status = 'SUCCESS';
                job.resultUrl = result.url;
            } else {
                job.status = 'FAILED';
                job.error = result.message;
            }
        } else if (AI_CONFIG.provider === 'volcengine' || (AI_CONFIG.provider === 'custom' && AI_CONFIG.customApiUrl)) {
            // 使用火山引擎或其他自定义 API
            job.progress = 30;
            job.updatedAt = new Date().toISOString();
            
            const result = await callCustomAI('video', params);
            
            job.progress = 90;
            job.updatedAt = new Date().toISOString();
            
            if (result.success) {
                // 如果返回了任务ID，需要轮询获取结果
                if (result.taskId) {
                    job.status = 'PENDING';
                    job.taskId = result.taskId;
                    job.pollingUrl = result.pollingUrl;
                    // 启动轮询
                    pollVideoResult(jobId, result.taskId);
                    aiJobs.set(jobId, job);
                    return;
                }
                job.status = 'SUCCESS';
                job.resultUrl = result.url;
            } else {
                job.status = 'FAILED';
                job.error = result.message;
            }
        } else {
            // 演示模式：模拟生成
            job = await simulateAIGeneration(job, 'video');
        }
    } catch (error) {
        console.error('AI Video Execution Error:', error);
        job.status = 'FAILED';
        job.error = error.message;
        job.updatedAt = new Date().toISOString();
    }
    
    aiJobs.set(jobId, job);
}

// 异步执行 AI 图片生成
async function executeAIImage(jobId, params) {
    const job = {
        id: jobId,
        type: 'image',
        status: 'PENDING',
        progress: 0,
        params: params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    aiJobs.set(jobId, job);
    
    try {
        job.status = 'RUNNING';
        job.progress = 10;
        job.updatedAt = new Date().toISOString();
        
        if (AI_CONFIG.cloudToken) {
            job.progress = 30;
            job.updatedAt = new Date().toISOString();
            
            const result = await callCloudAI('image', params.prompt, AI_CONFIG.cloudToken);
            
            job.progress = 90;
            job.updatedAt = new Date().toISOString();
            
            if (result.success) {
                job.status = 'SUCCESS';
                job.resultUrl = result.url;
            } else {
                job.status = 'FAILED';
                job.error = result.message;
            }
        } else if (AI_CONFIG.provider === 'volcengine' || (AI_CONFIG.provider === 'custom' && AI_CONFIG.customApiUrl)) {
            job.progress = 30;
            job.updatedAt = new Date().toISOString();
            
            const result = await callCustomAI('image', params);
            
            job.progress = 90;
            job.updatedAt = new Date().toISOString();
            
            if (result.success) {
                job.status = 'SUCCESS';
                job.resultUrl = result.url;
            } else {
                job.status = 'FAILED';
                job.error = result.message;
            }
        } else {
            job = await simulateAIGeneration(job, 'image');
        }
    } catch (error) {
        console.error('AI Image Execution Error:', error);
        job.status = 'FAILED';
        job.error = error.message;
        job.updatedAt = new Date().toISOString();
    }
    
    aiJobs.set(jobId, job);
}

// 轮询视频生成结果（火山引擎异步任务）
async function pollVideoResult(jobId, taskId) {
    const maxAttempts = 60; // 最多轮询60次
    const interval = 5000; // 每5秒轮询一次
    let attempts = 0;
    
    // 获取查询任务状态的URL
    const pollingUrl = `${AI_CONFIG.customApiUrl.replace('/tasks', '')}/tasks/${taskId}`;
    
    const poll = async () => {
        if (attempts >= maxAttempts) {
            const job = aiJobs.get(jobId);
            if (job) {
                job.status = 'FAILED';
                job.error = '视频生成超时';
                job.updatedAt = new Date().toISOString();
                aiJobs.set(jobId, job);
            }
            return;
        }
        
        attempts++;
        const job = aiJobs.get(jobId);
        if (!job || job.status !== 'PENDING') return;
        
        try {
            // 调用火山引擎查询任务状态
            const response = await fetch(pollingUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${AI_CONFIG.customApiKey}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // 检查不同的成功状态格式
                const isSuccess = data.status === 'succeed' || data.status === 'SUCCESS' || data.status === 'completed';
                const hasVideoUrl = data.data?.video_url || data.output?.video_url || data.video_url;
                
                if (isSuccess && hasVideoUrl) {
                    job.status = 'SUCCESS';
                    job.resultUrl = data.data?.video_url || data.output?.video_url || data.video_url;
                    job.progress = 100;
                } else if (data.status === 'failed' || data.status === 'FAILED') {
                    job.status = 'FAILED';
                    job.error = data.message || data.error || '视频生成失败';
                } else {
                    // 继续轮询
                    job.progress = Math.min(10 + attempts * 1.5, 95);
                    job.updatedAt = new Date().toISOString();
                    aiJobs.set(jobId, { ...job });
                    setTimeout(poll, interval);
                    return;
                }
            } else {
                // 请求失败，继续轮询
                job.progress = Math.min(10 + attempts * 1.5, 90);
                job.updatedAt = new Date().toISOString();
                aiJobs.set(jobId, { ...job });
                setTimeout(poll, interval);
                return;
            }
        } catch (error) {
            job.status = 'FAILED';
            job.error = error.message;
        }
        
        job.updatedAt = new Date().toISOString();
        aiJobs.set(jobId, job);
    };
    
    setTimeout(poll, interval);
}

// 模拟 AI 生成（演示用）
async function simulateAIGeneration(job, type) {
    // 模拟生成过程
    for (let i = 20; i <= 80; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        job.progress = i;
        job.updatedAt = new Date().toISOString();
        aiJobs.set(job.id, { ...job });
    }
    
    // 返回示例图片/视频
    const demoImages = [
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
        'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=800&q=80',
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80'
    ];
    
    job.status = 'SUCCESS';
    job.progress = 100;
    job.resultUrl = demoImages[Math.floor(Math.random() * demoImages.length)];
    job.updatedAt = new Date().toISOString();
    job.message = '这是演示结果，请配置真实的 AI 服务';
    
    return job;
}

// 调用 Cloud AI 服务
async function callCloudAI(type, prompt, token) {
    try {
        const https = require('https');
        const { spawn } = require('child_process');
        
        const skillDir = 'd:/CodeBuddy CN/resources/app/extensions/genie/out/extension/builtin/buddy-multimodal-generation';
        const scriptPath = `${skillDir}/scripts/buddy-cloud.py`;
        
        const cmd = type === 'video' 
            ? `python "${scriptPath}" video "${prompt}" --token "${token}"`
            : `python "${scriptPath}" image "${prompt}" --token "${token}"`;
        
        return new Promise((resolve) => {
            const { exec } = require('child_process');
            exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
                if (error) {
                    console.error('Cloud AI Error:', error);
                    resolve({ success: false, message: 'AI 服务调用失败' });
                    return;
                }
                
                try {
                    const result = JSON.parse(stdout);
                    if (result.status === 'DONE' && result.result_url) {
                        resolve({ success: true, url: result.result_url, jobId: result.job_id });
                    } else if (result.error) {
                        resolve({ success: false, message: result.message || '生成失败' });
                    } else {
                        resolve({ success: false, message: '未知错误' });
                    }
                } catch (e) {
                    console.error('Parse Error:', e);
                    resolve({ success: false, message: '解析结果失败' });
                }
            });
        });
    } catch (error) {
        console.error('Cloud AI Error:', error);
        return { success: false, message: error.message };
    }
}

// 调用火山引擎 AI API（contents/generations/tasks）
async function callCustomAI(type, params) {
    try {
        const endpoint = AI_CONFIG.customApiUrl;
        const modelId = AI_CONFIG.volcengineModel;
        
        // 根据类型构建不同的请求
        if (type === 'image') {
            // 火山引擎图像生成API（文生图）
            const requestBody = {
                model: modelId,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: params.prompt
                            }
                        ]
                    }
                ],
                stream: false
            };
            
            if (params.negative_prompt) {
                requestBody.messages[0].content.push({
                    type: 'text',
                    text: `请避免包含以下内容：${params.negative_prompt}`
                });
            }
            
            const response = await fetch(`${endpoint}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_CONFIG.customApiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorData}`);
            }
            
            const data = await response.json();
            
            // 火山引擎返回的图片通常在 choices[0].message.content 中
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const content = data.choices[0].message.content;
                // 尝试解析返回的图片URL
                if (typeof content === 'string' && content.includes('http')) {
                    const urlMatch = content.match(/https?:\/\/[^\s)]+/);
                    if (urlMatch) {
                        return { success: true, url: urlMatch[0] };
                    }
                }
            }
            
            return { success: false, message: '未获取到有效的图片结果' };
            
        } else {
            // 视频生成 - 火山引擎视频API (contents/generations/tasks)
            const requestBody = {
                model: modelId,
                prompt: params.prompt
            };
            
            // 添加可选参数
            if (params.negative_prompt) {
                requestBody.negative_prompt = params.negative_prompt;
            }
            if (params.duration) {
                requestBody.duration = params.duration;
            }
            if (params.resolution) {
                requestBody.resolution = params.resolution;
            }
            if (params.style) {
                requestBody.aspect_ratio = params.style === 'anime' ? '9:16' : '16:9';
            }
            
            // 使用新的API端点
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_CONFIG.customApiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorData}`);
            }
            
            const data = await response.json();
            
            // 火山引擎返回格式 - 通常返回 task_id
            if (data.task_id) {
                // 异步任务，返回任务ID
                return { success: true, taskId: data.task_id };
            }
            
            // 如果直接返回了结果URL
            if (data.output?.video_url || data.video_url || data.url) {
                return { success: true, url: data.output?.video_url || data.video_url || data.url };
            }
            
            // 如果返回了data对象中的URL
            if (data.data?.video_url) {
                return { success: true, url: data.data.video_url };
            }
            
            return { success: false, message: '未获取到有效的视频任务ID' };
        }
    } catch (error) {
        console.error('Custom AI Error:', error);
        return { success: false, message: error.message };
    }
}

// ========== Subscriptions API ==========

// Get user's subscriptions (authors they follow)
app.get('/api/subscriptions', async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        const userIdInt = parseInt(user_id, 10);
        
        const [subscriptions] = await pool.query(
            `SELECT u.id as channel_id, u.username, u.nickname, u.avatar_url,
                    s.id as subscription_id, s.created_at as subscribed_at
             FROM subscriptions s
             LEFT JOIN users u ON s.channel_id = u.id
             WHERE s.subscriber_id = ?
             ORDER BY s.created_at DESC`,
            [userIdInt]
        );

        // Get video count and total views for each channel
        const channels = await Promise.all(subscriptions.map(async (channel) => {
            if (!channel.id) return channel;
            
            const [stats] = await pool.query(
                `SELECT COUNT(*) as video_count, COALESCE(SUM(views), 0) as total_views
                 FROM videos WHERE user_id = ?`,
                [channel.channel_id]
            );
            
            return {
                ...channel,
                video_count: stats[0].video_count || 0,
                total_views: stats[0].total_views || 0
            };
        }));

        res.json({ success: true, subscriptions: channels.filter(c => c.channel_id !== null) });
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({ success: false, message: '获取订阅失败' });
    }
});

// Check if subscribed to an author
app.get('/api/subscriptions/check', async (req, res) => {
    try {
        const { subscriber_id, channel_id } = req.query;
        if (!subscriber_id) {
            return res.json({ success: true, isSubscribed: false });
        }

        const subscriberIdInt = parseInt(subscriber_id, 10);
        const channelIdInt = parseInt(channel_id, 10);

        const [subscriptions] = await pool.query(
            'SELECT id FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?',
            [subscriberIdInt, channelIdInt]
        );

        res.json({ success: true, isSubscribed: subscriptions.length > 0 });
    } catch (error) {
        console.error('Check subscription error:', error);
        res.status(500).json({ success: false, message: '检查订阅失败' });
    }
});

// Subscribe to an author
app.post('/api/subscriptions', async (req, res) => {
    try {
        const { subscriber_id, channel_id } = req.body;
        if (!subscriber_id) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        if (parseInt(subscriber_id) === parseInt(channel_id)) {
            return res.status(400).json({ success: false, message: '不能订阅自己' });
        }

        const subscriberIdInt = parseInt(subscriber_id, 10);
        const channelIdInt = parseInt(channel_id, 10);

        // Check if channel exists
        const [channels] = await pool.query('SELECT id FROM users WHERE id = ?', [channelIdInt]);
        if (channels.length === 0) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        // Check if already subscribed
        const [existing] = await pool.query(
            'SELECT id FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?',
            [subscriberIdInt, channelIdInt]
        );

        if (existing.length > 0) {
            return res.json({ success: true, message: '已订阅' });
        }

        await pool.query(
            'INSERT INTO subscriptions (subscriber_id, channel_id) VALUES (?, ?)',
            [subscriberIdInt, channelIdInt]
        );

        // Update subscribers_count in users table
        await pool.query('UPDATE users SET subscribers_count = subscribers_count + 1 WHERE id = ?', [channelIdInt]);

        res.json({ success: true, message: '订阅成功' });
    } catch (error) {
        console.error('Add subscription error:', error);
        res.status(500).json({ success: false, message: '订阅失败' });
    }
});

// Unsubscribe from an author
app.delete('/api/subscriptions', async (req, res) => {
    try {
        const { subscriber_id, channel_id } = req.query;
        if (!subscriber_id) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        const subscriberIdInt = parseInt(subscriber_id, 10);
        const channelIdInt = parseInt(channel_id, 10);

        await pool.query(
            'DELETE FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?',
            [subscriberIdInt, channelIdInt]
        );

        // Update subscribers_count in users table
        await pool.query('UPDATE users SET subscribers_count = GREATEST(subscribers_count - 1, 0) WHERE id = ?', [channelIdInt]);

        res.json({ success: true, message: '已取消订阅' });
    } catch (error) {
        console.error('Remove subscription error:', error);
        res.status(500).json({ success: false, message: '取消订阅失败' });
    }
});

// Get subscriber count for a user
app.get('/api/users/:id/subscribers', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        const [countResult] = await pool.query('SELECT COUNT(*) as count FROM subscriptions WHERE channel_id = ?', [req.params.id]);
        
        res.json({ success: true, count: countResult[0].count || 0 });
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({ success: false, message: '获取粉丝数失败' });
    }
});

// Get user profile by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        const [users] = await pool.query(
            'SELECT id, username, nickname, email, avatar_url, created_at FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        res.json({ success: true, user: users[0] });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ success: false, message: '获取用户信息失败' });
    }
});

// Reset admin password API
app.post('/api/admin/reset', async (req, res) => {
    try {
        // Delete existing admin
        await pool.query('DELETE FROM users WHERE username = ?', ['admin']);
        
        // Create new admin
        const hashedPassword = await bcrypt.hash(config.adminPassword, 10);
        await pool.query(
            'INSERT INTO users (username, nickname, email, password, role) VALUES (?, ?, ?, ?, ?)',
            ['admin', '管理员', 'admin@streamvibe.com', hashedPassword, 'admin']
        );
        
        console.log(`Admin reset: admin / ${config.adminPassword}`);
        res.json({ success: true, message: '管理员账号已重置', username: 'admin', password: config.adminPassword });
    } catch (error) {
        console.error('Reset admin error:', error);
        res.status(500).json({ success: false, message: '重置失败' });
    }
});

// Search videos API
app.get('/api/search', async (req, res) => {
    try {
        const { q, category, page = 1, limit = 20 } = req.query;
        
        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: '请提供搜索关键词'
            });
        }

        let query = `
            SELECT v.*, u.username as uploader_name, u.nickname as uploader_nickname, u.avatar_url as uploader_avatar
            FROM videos v
            LEFT JOIN users u ON v.user_id = u.id
            WHERE v.status = 'approved' AND (v.title LIKE ? OR v.description LIKE ?)
        `;
        const params = ['%' + q.trim() + '%', '%' + q.trim() + '%'];

        if (category && category !== 'all') {
            query += ' AND v.category = ?';
            params.push(category);
        }

        // Get total count
        const countQuery = query.replace('SELECT v.*, u.username as uploader_name, u.nickname as uploader_nickname, u.avatar_url as uploader_avatar', 'SELECT COUNT(*) as total');
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        // Add pagination
        query += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';
        const offset = (parseInt(page) - 1) * parseInt(limit);
        params.push(parseInt(limit), offset);

        const [videos] = await pool.query(query, params);
        const baseUrl = getBaseUrl(req);

        const parsedVideos = videos.map(video => ({
            ...video,
            video_url: video.video_url.startsWith('http') ? video.video_url : baseUrl + video.video_url,
            thumbnail_url: video.thumbnail_url ? (video.thumbnail_url.startsWith('http') ? video.thumbnail_url : baseUrl + video.thumbnail_url) : null,
            tags: typeof video.tags === 'string' ? JSON.parse(video.tags || '[]') : (video.tags || [])
        }));

        res.json({
            success: true,
            videos: parsedVideos,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// Serve static files and Vue SPA
const frontendDistPath = path.join(__dirname, 'frontend', 'dist');

// Serve Vue app for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
    // If it's an API request, let it pass through
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found' });
    }
    
    // Check if frontend dist exists (production mode)
    if (fs.existsSync(frontendDistPath)) {
        const indexPath = path.join(frontendDistPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
    }
    
    // Fallback to original HTML files (development mode)
    const htmlFiles = {
        '/': 'index.html',
        '/login': 'login.html',
        '/register': 'register.html'
    };
    
    const htmlFile = htmlFiles[req.path];
    if (htmlFile) {
        return res.sendFile(path.join(__dirname, htmlFile));
    }
    
    // Default to index.html for SPA routing
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve frontend static files if built
app.use('/assets', express.static(frontendDistPath));

// Error handling middleware for multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: '文件过大，请选择小于5GB的文件'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
});

// Start server
async function startServer() {
    try {
        await initDatabase();
        
        app.listen(PORT, () => {
            logger.info('========================================');
            logger.info('Server started successfully!');
            logger.info(`Server running at http://localhost:${PORT}`);
            logger.info(`Login page: http://localhost:${PORT}/login`);
            logger.info(`Register page: http://localhost:${PORT}/register`);
            logger.info('========================================');
        });
    } catch (error) {
        logger.error('Failed to start server:', { error: error.message });
        process.exit(1);
    }
}

startServer();
