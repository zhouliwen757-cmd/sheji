<template>
  <div class="page-container">
    <Navbar />
    
    <div class="container profile-container" v-if="userProfile">
      <div class="profile-header">
        <div class="profile-avatar">
          {{ getInitial(userProfile.nickname || userProfile.username || 'U') }}
        </div>
        <div class="profile-info">
          <h1>{{ userProfile.nickname || userProfile.username || '未知用户' }}</h1>
          <p>{{ userProfile.email }}</p>
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
        <button class="btn btn-primary subscribe-btn" v-if="!isSubscribed" @click="subscribe">订阅</button>
        <button class="btn btn-secondary subscribed-btn" v-else @click="unsubscribe">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          已订阅
        </button>
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
            <p>该用户还没有上传视频</p>
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
            <p>该用户还没有订阅任何作者</p>
          </div>
          
          <div v-else class="channels-grid">
            <div v-for="channel in subscriptions" :key="channel.channel_id" class="channel-card" @click="goToUser(channel.channel_id)">
              <div class="channel-avatar">
                {{ channel.nickname?.charAt(0) || channel.username?.charAt(0) || 'U' }}
              </div>
              <div class="channel-info">
                <h4>{{ channel.nickname || channel.username }}</h4>
                <p>{{ channel.subscribers_count || 0 }} 粉丝 · {{ channel.video_count || 0 }} 作品</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else class="error-state">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h2>用户不存在</h2>
      <p>该用户可能已被删除或不存在</p>
      <router-link to="/" class="btn btn-primary">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import VideoCard from '@/components/VideoCard.vue'
import { useVideoStore } from '@/stores/video'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const videoStore = useVideoStore()
const toast = useToast()

const userProfile = ref(null)
const loading = ref(true)
const activeTab = ref('videos')
const userVideos = ref([])
const totalViews = ref(0)
const subscribers = ref(0)
const isSubscribed = ref(false)
const subscriptions = ref([])
const subscriptionsLoading = ref(false)

const tabs = [
  { label: '作品', value: 'videos' },
  { label: '订阅', value: 'subscriptions' }
]

const getInitial = (name) => {
  return (name || 'U').charAt(0).toUpperCase()
}

// 获取当前登录用户ID
const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user?.id || null
    }
  } catch (e) {}
  return null
}

// 获取用户ID
const getUserId = () => {
  return parseInt(route.params.id)
}

// 获取用户信息
const fetchUserProfile = async () => {
  const userId = getUserId()
  if (!userId) return
  
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`)
    const data = await response.json()
    if (data.success) {
      userProfile.value = data.user
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
  }
}

// 获取用户视频
const fetchUserVideos = async () => {
  const userId = getUserId()
  if (!userId) return
  
  try {
    await videoStore.fetchVideos({ user_id: userId, limit: 100 })
    userVideos.value = videoStore.videos
    totalViews.value = userVideos.value.reduce((sum, v) => sum + (v.views || 0), 0)
  } catch (err) {
    console.error('获取用户视频失败:', err)
  }
}

// 获取订阅者数量
const fetchSubscriberCount = async () => {
  const userId = getUserId()
  if (!userId) return
  
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}/subscribers`)
    const data = await response.json()
    if (data.success) {
      subscribers.value = data.count
    }
  } catch (err) {
    console.error('获取订阅者数量失败:', err)
  }
}

// 检查订阅状态
const checkSubscription = async () => {
  const currentUserId = getCurrentUserId()
  if (!currentUserId) return
  
  const channelId = getUserId()
  if (!channelId) return
  
  try {
    const response = await fetch(`http://localhost:3000/api/subscriptions/check?subscriber_id=${currentUserId}&channel_id=${channelId}`)
    const data = await response.json()
    if (data.success) {
      isSubscribed.value = data.isSubscribed
    }
  } catch (err) {
    console.error('检查订阅状态失败:', err)
  }
}

// 订阅
const subscribe = async () => {
  const currentUserId = getCurrentUserId()
  if (!currentUserId) {
    toast.info('请先登录')
    return
  }
  
  const channelId = getUserId()
  if (!channelId) return
  
  try {
    const response = await fetch('http://localhost:3000/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriber_id: currentUserId,
        channel_id: channelId
      })
    })
    const data = await response.json()
    if (data.success) {
      isSubscribed.value = true
      subscribers.value = (subscribers.value || 0) + 1
      toast.success('订阅成功')
    }
  } catch (err) {
    console.error('订阅失败:', err)
    toast.error('订阅失败')
  }
}

// 取消订阅
const unsubscribe = async () => {
  const currentUserId = getCurrentUserId()
  if (!currentUserId) {
    toast.info('请先登录')
    return
  }
  
  const channelId = getUserId()
  if (!channelId) return
  
  try {
    const response = await fetch(`http://localhost:3000/api/subscriptions?subscriber_id=${currentUserId}&channel_id=${channelId}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (data.success) {
      isSubscribed.value = false
      subscribers.value = Math.max(0, (subscribers.value || 0) - 1)
      toast.success('已取消订阅')
    }
  } catch (err) {
    console.error('取消订阅失败:', err)
    toast.error('取消订阅失败')
  }
}

// 获取用户订阅列表
const fetchSubscriptions = async () => {
  const userId = getUserId()
  if (!userId) return
  
  subscriptionsLoading.value = true
  try {
    const response = await fetch(`http://localhost:3000/api/subscriptions?user_id=${userId}`)
    const data = await response.json()
    if (data.success) {
      subscriptions.value = data.subscriptions || []
    }
  } catch (err) {
    console.error('获取订阅列表失败:', err)
  } finally {
    subscriptionsLoading.value = false
  }
}

// 跳转到用户个人中心
const goToUser = (userId) => {
  router.push(`/user/${userId}`)
}

import { watch } from 'vue'
watch(activeTab, (newTab) => {
  if (newTab === 'subscriptions' && subscriptions.value.length === 0) {
    fetchSubscriptions()
  }
})

onMounted(async () => {
  loading.value = true
  await fetchUserProfile()
  await fetchUserVideos()
  await fetchSubscriberCount()
  await checkSubscription()
  loading.value = false
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

.subscriptions-section {
  min-height: 300px;
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
  cursor: pointer;
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

.subscribe-btn {
  background: var(--primary);
  color: white;
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 500;
  transition: var(--transition);
}

.subscribe-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}

.subscribed-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface2);
  color: var(--text-muted);
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 500;
  transition: var(--transition);
}

.subscribed-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.subscribed-btn:hover svg {
  display: none;
}

.subscribed-btn:hover::before {
  content: '取消订阅';
}

.loading, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
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

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px;
  text-align: center;
  color: var(--text-muted);
}

.loading-state svg, .error-state svg {
  margin-bottom: 24px;
  opacity: 0.5;
}

.error-state h2 {
  color: var(--text);
  margin-bottom: 8px;
}

.error-state p {
  margin-bottom: 24px;
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
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
}
</style>
