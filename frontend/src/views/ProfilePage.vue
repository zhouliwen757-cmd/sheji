<template>
  <div class="page-container">
    <Navbar />
    
    <div class="container profile-container" v-if="authStore.isLoggedIn">
      <div class="profile-header">
        <div class="profile-avatar">
          {{ authStore.getUserInitial() }}
        </div>
        <div class="profile-info">
          <h1>{{ authStore.getUserName() }}</h1>
          <p>{{ authStore.user?.email }}</p>
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userVideos.length }}</span>
              <span class="stat-label">作品</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ totalViews }}</span>
              <span class="stat-label">观看</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ subscribers }}</span>
              <span class="stat-label">粉丝</span>
            </div>
          </div>
        </div>
        <button class="btn btn-secondary" @click="editProfile">编辑资料</button>
      </div>

      <div class="profile-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          :class="['tab-btn', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="profile-content">
        <!-- My Videos -->
        <div v-if="activeTab === 'videos'" class="videos-grid">
          <VideoCard v-for="video in userVideos" :key="video.id" :video="video" />
          <div v-if="userVideos.length === 0" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>还没有上传视频</p>
            <router-link to="/upload" class="btn btn-primary">上传第一个视频</router-link>
          </div>
        </div>

        <!-- Favorites -->
        <div v-if="activeTab === 'favorites'" class="favorites-section">
          <div v-if="favoritesLoading" class="loading">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>
          
          <div v-else-if="favorites.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <p>还没有收藏视频</p>
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

        <!-- Subscriptions -->
        <div v-if="activeTab === 'subscriptions'" class="subscriptions-section">
          <div v-if="subscriptionsLoading" class="loading">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>
          
          <div v-else-if="subscriptions.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p>还没有订阅任何作者</p>
            <router-link to="/" class="btn btn-primary">去首页看看</router-link>
          </div>
          
          <div v-else class="channels-grid">
            <div v-for="channel in subscriptions" :key="channel.channel_id" class="channel-card">
              <div class="channel-avatar">
                {{ channel.nickname?.charAt(0) || channel.username?.charAt(0) || 'U' }}
              </div>
              <div class="channel-info">
                <h4>{{ channel.nickname || channel.username }}</h4>
                <p>{{ channel.subscribers_count || 0 }} 粉丝 · {{ channel.video_count || 0 }} 作品</p>
              </div>
              <button class="unsubscribe-btn" @click="unsubscribeChannel(channel.channel_id)">
                已订阅
              </button>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div v-if="activeTab === 'settings'" class="settings-section">
          <div class="settings-card">
            <h3>个人信息</h3>
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input type="text" v-model="profileForm.username" class="form-input" disabled>
            </div>
            <div class="form-group">
              <label class="form-label">昵称</label>
              <input type="text" v-model="profileForm.nickname" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input type="email" v-model="profileForm.email" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">手机号</label>
              <input type="tel" v-model="profileForm.phone" class="form-input">
            </div>
            <button class="btn btn-primary" @click="saveProfile">保存修改</button>
          </div>

          <div class="settings-card">
            <h3>修改密码</h3>
            <div class="form-group">
              <label class="form-label">当前密码</label>
              <input type="password" v-model="passwordForm.current" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">新密码</label>
              <input type="password" v-model="passwordForm.new" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">确认新密码</label>
              <input type="password" v-model="passwordForm.confirm" class="form-input">
            </div>
            <button class="btn btn-primary" @click="changePassword">修改密码</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="login-prompt">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <h2>请先登录</h2>
      <p>登录后即可访问个人中心</p>
      <router-link to="/login?redirect=profile" class="btn btn-primary">立即登录</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import VideoCard from '@/components/VideoCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useVideoStore } from '@/stores/video'

const route = useRoute()
const authStore = useAuthStore()
const videoStore = useVideoStore()

const activeTab = ref('videos')
const userVideos = ref([])
const favorites = ref([])
const favoritesLoading = ref(false)
const subscriptions = ref([])
const subscriptionsLoading = ref(false)
const totalViews = ref(0)
const subscribers = ref(0)

const profileForm = ref({
  username: '',
  nickname: '',
  email: '',
  phone: ''
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const tabs = [
  { label: '我的作品', value: 'videos' },
  { label: '我的收藏', value: 'favorites' },
  { label: '我的订阅', value: 'subscriptions' },
  { label: '设置', value: 'settings' }
]

const editProfile = () => {
  activeTab.value = 'settings'
}

const saveProfile = () => {
  alert('资料已保存')
}

const changePassword = () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    alert('两次输入的密码不一致')
    return
  }
  alert('密码已修改')
  passwordForm.value = { current: '', new: '', confirm: '' }
}

// 获取收藏列表
const fetchFavorites = async () => {
  const userId = authStore.user?.id
  if (!userId) return
  
  favoritesLoading.value = true
  try {
    const response = await fetch(`http://localhost:3000/api/favorites?user_id=${userId}`)
    const data = await response.json()
    if (data.success) {
      favorites.value = data.favorites || []
    }
  } catch (err) {
    console.error('获取收藏失败:', err)
  } finally {
    favoritesLoading.value = false
  }
}

// 取消收藏
const removeFavorite = async (videoId) => {
  const userId = authStore.user?.id
  if (!userId) return
  
  try {
    const response = await fetch(`http://localhost:3000/api/favorites?user_id=${userId}&video_id=${videoId}`, {
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

// 获取订阅列表
const fetchSubscriptions = async () => {
  const userId = authStore.user?.id
  if (!userId) return
  
  subscriptionsLoading.value = true
  try {
    const response = await fetch(`http://localhost:3000/api/subscriptions?user_id=${userId}`)
    const data = await response.json()
    if (data.success) {
      subscriptions.value = data.subscriptions || []
    }
  } catch (err) {
    console.error('获取订阅失败:', err)
  } finally {
    subscriptionsLoading.value = false
  }
}

// 取消订阅
const unsubscribeChannel = async (channelId) => {
  const userId = authStore.user?.id
  if (!userId) return
  
  try {
    const response = await fetch(`http://localhost:3000/api/subscriptions?subscriber_id=${userId}&channel_id=${channelId}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (data.success) {
      subscriptions.value = subscriptions.value.filter(c => c.channel_id !== channelId)
    }
  } catch (err) {
    console.error('取消订阅失败:', err)
  }
}

onMounted(async () => {
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
  
  if (authStore.user) {
    profileForm.value = {
      username: authStore.user.username || '',
      nickname: authStore.user.nickname || '',
      email: authStore.user.email || '',
      phone: authStore.user.phone || ''
    }
    
    // Fetch user videos
    await videoStore.fetchVideos({ user_id: authStore.user.id, limit: 100 })
    userVideos.value = videoStore.videos
    totalViews.value = userVideos.value.reduce((sum, v) => sum + (v.views || 0), 0)
    
    // Fetch favorites
    await fetchFavorites()
  }
})

// 监听标签切换，获取数据
import { watch } from 'vue'
watch(activeTab, (newTab) => {
  if (newTab === 'favorites' && favorites.value.length === 0) {
    fetchFavorites()
  }
  if (newTab === 'subscriptions' && subscriptions.value.length === 0) {
    fetchSubscriptions()
  }
})
</script>

<style scoped>
.profile-container {
  padding-top: 100px;
  padding-bottom: 60px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: var(--surface);
  border-radius: var(--radius);
  margin-bottom: 32px;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.profile-info p {
  color: var(--text-muted);
  margin-bottom: 16px;
}

.profile-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.profile-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--surface2);
  padding-bottom: 16px;
}

.tab-btn {
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  font-weight: 500;
  transition: var(--transition);
  border: none;
}

.tab-btn:hover {
  background: var(--surface);
  color: var(--text);
}

.tab-btn.active {
  background: var(--gradient);
  color: white;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.favorites-section,
.subscriptions-section {
  min-height: 300px;
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

.remove-btn:hover svg path {
  fill: white;
}

.channels-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.channel-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--surface);
  border-radius: var(--radius);
  transition: var(--transition);
}

.channel-card:hover {
  background: var(--surface2);
}

.channel-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.channel-info {
  flex: 1;
}

.channel-info h4 {
  font-weight: 600;
  margin-bottom: 4px;
}

.channel-info p {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.unsubscribe-btn {
  padding: 8px 20px;
  background: var(--surface2);
  border: none;
  border-radius: 20px;
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.unsubscribe-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--text-muted);
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

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-muted);
  text-align: center;
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.settings-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.settings-card {
  padding: 24px;
  background: var(--surface);
  border-radius: var(--radius);
}

.settings-card h3 {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--surface2);
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px;
  text-align: center;
  color: var(--text-muted);
}

.login-prompt svg {
  margin-bottom: 24px;
  opacity: 0.5;
}

.login-prompt h2 {
  color: var(--text);
  margin-bottom: 8px;
}

.login-prompt p {
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .settings-section {
    grid-template-columns: 1fr;
  }
  
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
}
</style>
