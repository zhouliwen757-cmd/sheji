<template>
  <div class="home-page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <div class="brand-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <span class="brand-name">StreamVibe</span>
        </div>
        
        <ul class="nav-links">
          <li><a href="#" class="nav-link active">首页</a></li>
          <li><a href="#" class="nav-link">分类</a></li>
        </ul>
        
        <div class="nav-actions">
          <div class="search-wrapper">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" v-model="searchQuery" class="search-input" placeholder="搜索视频...">
          </div>
          <div class="user-menu">
            <div class="user-avatar">{{ user?.username?.[0]?.toUpperCase() || 'U' }}</div>
            <div class="user-dropdown">
              <div class="user-info">
                <span class="user-name">{{ user?.nickname || user?.username }}</span>
                <span class="user-email">{{ user?.email }}</span>
              </div>
              <button @click="handleLogout" class="logout-btn">退出登录</button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          本周热门
        </div>
        <h1 class="hero-title">星际穿越：平行宇宙的无限可能</h1>
        <p class="hero-desc">当虫洞打开的那一刻，时间与空间的界限彻底消失。一场跨越星际的冒险，带你探索宇宙最深处的奥秘。</p>
        <div class="hero-actions">
          <button class="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            立即播放
          </button>
          <button class="btn btn-secondary">了解更多</button>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-value">2.8M</div>
          <div class="stat-label">播放量</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">98%</div>
          <div class="stat-label">好评率</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">156K</div>
          <div class="stat-label">追剧人数</div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Categories -->
      <div class="categories">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          :class="['category-tag', { active: activeCategory === cat.id }]"
          @click="activeCategory = cat.id"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- Video Grid -->
      <section class="video-section">
        <div class="section-header">
          <h2 class="section-title">为你推荐</h2>
        </div>
        <div class="video-grid">
          <div v-for="video in filteredVideos" :key="video.id" class="video-card animate-in">
            <div class="video-thumb">
              <img :src="video.thumbnail" :alt="video.title" loading="lazy">
              <div class="video-overlay">
                <div class="play-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <span class="video-duration">{{ video.duration }}</span>
              <span class="video-quality">{{ video.quality }}</span>
            </div>
            <div class="video-info">
              <h3 class="video-title">{{ video.title }}</h3>
              <div class="video-meta">
                <span class="video-views">{{ video.views }} 播放</span>
                <button class="favorite-btn" :class="{ active: video.favorite }" @click="toggleFavorite(video)">
                  <svg width="16" height="16" viewBox="0 0 24 24" :fill="video.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="brand">
            <div class="brand-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span class="brand-name">StreamVibe</span>
          </div>
          <p>异世界 是一个专注于优质视频内容的平台，为用户提供最新、最热的视频资源。</p>
        </div>
        <div class="footer-links">
          <h4>快速链接</h4>
          <ul>
            <li><a href="#">关于我们</a></li>
            <li><a href="#">联系方式</a></li>
            <li><a href="#">用户协议</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>帮助中心</h4>
          <ul>
            <li><a href="#">常见问题</a></li>
            <li><a href="#">观看指南</a></li>
            <li><a href="#">反馈建议</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 异世界. All rights reserved.</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.user)
const searchQuery = ref('')
const activeCategory = ref('all')

const categories = [
  { id: 'all', name: '全部' },
  { id: 'movie', name: '电影' },
  { id: 'tv', name: '电视剧' },
  { id: 'anime', name: '动漫' },
  { id: 'documentary', name: '纪录片' },
  { id: 'variety', name: '综艺' }
]

const videos = ref([
  {
    id: 1,
    title: '星际穿越：平行宇宙的无限可能',
    category: 'movie',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    duration: '2:28:15',
    views: '2.8M',
    quality: '4K',
    favorite: false
  },
  {
    id: 2,
    title: '深海探索：未知世界的奥秘',
    category: 'documentary',
    thumbnail: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800&q=80',
    duration: '1:45:30',
    views: '1.2M',
    quality: '1080P',
    favorite: false
  },
  {
    id: 3,
    title: '未来城市：科技与生活的融合',
    category: 'documentary',
    thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
    duration: '52:18',
    views: '890K',
    quality: '1080P',
    favorite: false
  },
  {
    id: 4,
    title: '热血篮球：总决赛精彩瞬间',
    category: 'sport',
    thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
    duration: '3:45:00',
    views: '3.5M',
    quality: '4K',
    favorite: false
  },
  {
    id: 5,
    title: '数码宝贝：重启归来',
    category: 'anime',
    thumbnail: 'https://images.unsplash.com/photo-1607604276583-b39e66f044ab?w=800&q=80',
    duration: '24:00',
    views: '1.5M',
    quality: '1080P',
    favorite: false
  },
  {
    id: 6,
    title: '速度与激情10：终极对决',
    category: 'movie',
    thumbnail: 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=800&q=80',
    duration: '2:15:42',
    views: '4.2M',
    quality: '4K',
    favorite: false
  },
  {
    id: 7,
    title: '向往的生活：田园诗意',
    category: 'variety',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    duration: '1:30:00',
    views: '2.1M',
    quality: '1080P',
    favorite: false
  },
  {
    id: 8,
    title: '盗梦空间：悬疑巅峰之作',
    category: 'movie',
    thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80',
    duration: '2:28:00',
    views: '5.6M',
    quality: '4K',
    favorite: false
  }
])

const filteredVideos = computed(() => {
  let result = videos.value
  
  if (activeCategory.value !== 'all') {
    result = result.filter(v => v.category === activeCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(v => v.title.toLowerCase().includes(query))
  }
  
  return result
})

const toggleFavorite = (video) => {
  video.favorite = !video.favorite
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 48px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 40px;
  height: 40px;
  background: var(--gradient);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--text);
  background: rgba(99, 102, 241, 0.1);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 200px;
  padding: 10px 16px 10px 44px;
  border-radius: 24px;
  border: 2px solid transparent;
  background: var(--surface);
  color: var(--text);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  width: 280px;
  border-color: var(--primary);
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--surface);
  border-radius: var(--radius-sm);
  padding: 16px;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.user-menu:hover .user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-info {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--surface2);
  margin-bottom: 12px;
}

.user-name {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-email {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.logout-btn {
  width: 100%;
  padding: 10px;
  border-radius: var(--radius-sm);
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Hero */
.hero {
  position: relative;
  height: 600px;
  margin-top: 72px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80') center/cover;
}

.hero-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(15, 15, 35, 0.95) 0%, rgba(15, 15, 35, 0.6) 50%, transparent 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 0 48px;
  max-width: 600px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid var(--primary);
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--primary);
  margin-bottom: 20px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 20px;
}

.hero-desc {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin-bottom: 32px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.hero-stats {
  position: absolute;
  right: 48px;
  bottom: 48px;
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Main Content */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px;
}

.categories {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  overflow-x: auto;
}

.categories::-webkit-scrollbar {
  height: 4px;
}

.category-tag {
  flex-shrink: 0;
  padding: 10px 24px;
  border-radius: 24px;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: 2px solid var(--surface2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-tag:hover {
  border-color: var(--primary);
  color: var(--text);
}

.category-tag.active {
  background: var(--gradient);
  border-color: transparent;
  color: white;
}

.video-section {
  margin-bottom: 64px;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: var(--gradient);
  border-radius: 2px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.video-card {
  background: var(--surface);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow);
}

.video-thumb {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.video-card:hover .video-thumb img {
  transform: scale(1.1);
}

.video-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.video-card:hover .video-overlay {
  opacity: 1;
}

.play-btn {
  width: 56px;
  height: 56px;
  background: var(--gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.video-card:hover .play-btn {
  transform: scale(1);
  animation: pulse 1s infinite;
}

.video-duration {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  font-size: 0.8rem;
}

.video-quality {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  background: var(--accent);
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #000;
}

.video-info {
  padding: 16px;
}

.video-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.favorite-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface2);
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.favorite-btn:hover,
.favorite-btn.active {
  background: var(--secondary);
  color: white;
}

/* Footer */
.footer {
  background: var(--surface);
  padding: 48px;
  margin-top: 64px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 48px;
}

.footer-brand p {
  color: var(--text-muted);
  margin-top: 16px;
  max-width: 300px;
}

.footer-links h4 {
  margin-bottom: 20px;
}

.footer-links ul {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links a {
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.footer-links a:hover {
  color: var(--primary);
}

.footer-bottom {
  max-width: 1400px;
  margin: 32px auto 0;
  padding-top: 32px;
  border-top: 1px solid var(--surface2);
  text-align: center;
  color: var(--text-muted);
}

@media (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 20px;
  }
  
  .nav-links {
    display: none;
  }
  
  .hero {
    height: auto;
    padding: 120px 20px 80px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-stats {
    display: none;
  }
  
  .main-content {
    padding: 24px 20px;
  }
  
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
