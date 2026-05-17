<template>
  <div class="page-container">
    <Navbar />
    
    <div class="main-container">
      <div class="content-section">
        <h1 class="page-title">我的收藏</h1>
        
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="!isLoggedIn" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <p>请先登录查看收藏</p>
          <router-link to="/login" class="btn btn-primary">去登录</router-link>
        </div>
        
        <div v-else-if="favorites.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <p>还没有收藏任何视频</p>
          <router-link to="/" class="btn btn-primary">去首页看看</router-link>
        </div>
        
        <div v-else class="video-grid">
          <div v-for="video in favorites" :key="video.id" class="video-card-wrapper">
            <VideoCard :video="video" />
            <button class="remove-btn" @click="removeFavorite(video.id)" title="取消收藏">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import VideoCard from '@/components/VideoCard.vue'

const userId = ref(null)
const favorites = ref([])
const loading = ref(true)

// 计算属性确保响应式
const isLoggedIn = computed(() => !!userId.value)

// 获取用户ID - 从 localStorage 直接读取
const getUserId = () => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user?.id || null
    }
  } catch (e) {
    console.error('解析用户数据失败:', e)
  }
  return null
}

// 获取收藏列表
const fetchFavorites = async () => {
  userId.value = getUserId()
  
  if (!userId.value) {
    loading.value = false
    return
  }

  try {
    const response = await fetch(`http://localhost:3000/api/favorites?user_id=${userId.value}`)
    const data = await response.json()
    
    if (data.success) {
      favorites.value = data.favorites || []
    }
  } catch (err) {
    console.error('获取收藏失败:', err)
  } finally {
    loading.value = false
  }
}

// 取消收藏
const removeFavorite = async (videoId) => {
  if (!userId.value) return

  try {
    const response = await fetch(`http://localhost:3000/api/favorites?user_id=${userId.value}&video_id=${videoId}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    
    if (data.success) {
      favorites.value = favorites.value.filter(v => v.id !== videoId)
    }
  } catch (err) {
    console.error('取消收藏失败:', err)
  }
}

onMounted(() => {
  fetchFavorites()
})
</script>

<style scoped>
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 48px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 24px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.video-card-wrapper {
  position: relative;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
  z-index: 10;
}

.video-card-wrapper:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.9);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--surface2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .main-container {
    padding: 16px 20px;
  }
  
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
}
</style>
