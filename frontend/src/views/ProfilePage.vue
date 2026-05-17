<template>
  <div class="page-container">
    <Navbar />
    
    <div class="container profile-container" v-if="authStore.isLoggedIn">
      <!-- 头部信息 -->
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="triggerAvatarUpload">
            <img v-if="userProfile?.avatar_url" :src="userProfile.avatar_url" alt="头像" class="avatar-img">
            <div v-else class="profile-avatar">
              {{ authStore.getUserInitial() }}
            </div>
            <div class="avatar-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>
          <input type="file" ref="avatarInput" @change="handleAvatarUpload" accept="image/*" style="display: none">
        </div>
        <div class="profile-info">
          <h1>{{ userProfile?.nickname || authStore.getUserName() }}</h1>
          <p class="user-email">{{ authStore.user?.email }}</p>
          <p v-if="userProfile?.bio" class="user-bio">{{ userProfile.bio }}</p>
          <div class="profile-stats">
            <div class="stat-item" @click="activeTab = 'videos'">
              <span class="stat-value">{{ userProfile?.video_count || userVideos.length }}</span>
              <span class="stat-label">作品</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userProfile?.total_views || totalViews }}</span>
              <span class="stat-label">观看</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userProfile?.subscribers_count || 0 }}</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userProfile?.following_count || 0 }}</span>
              <span class="stat-label">关注</span>
            </div>
            <div class="stat-item" @click="activeTab = 'likes'">
              <span class="stat-value">{{ likesCount }}</span>
              <span class="stat-label">获赞</span>
            </div>
          </div>
        </div>
        <button class="btn btn-secondary" @click="editProfile">编辑资料</button>
      </div>

      <!-- 标签页 -->
      <div class="profile-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          :class="['tab-btn', { active: activeTab === tab.value }]"
          @click="handleTabChange(tab.value)"
        >
          <span class="tab-icon" v-html="tab.icon"></span>
          {{ tab.label }}
        </button>
      </div>

      <div class="profile-content">
        <!-- 我的作品 -->
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

        <!-- 我的收藏 -->
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

        <!-- 我的点赞 -->
        <div v-if="activeTab === 'likes'" class="likes-section">
          <div v-if="likesLoading" class="loading">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>
          
          <div v-else-if="likedVideos.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
            </div>
            <p>还没有点赞视频</p>
            <router-link to="/" class="btn btn-primary">去首页看看</router-link>
          </div>
          
          <div v-else class="video-grid">
            <VideoCard v-for="video in likedVideos" :key="video.id" :video="video" />
          </div>
        </div>

        <!-- 我的评论 -->
        <div v-if="activeTab === 'comments'" class="comments-section">
          <div v-if="commentsLoading" class="loading">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>
          
          <div v-else-if="userComments.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p>还没有评论</p>
            <router-link to="/" class="btn btn-primary">去首页看看</router-link>
          </div>
          
          <div v-else class="comments-list">
            <div v-for="comment in userComments" :key="comment.id" class="comment-item">
              <div class="comment-video-thumb" @click="goToVideo(comment.video_id)">
                <img v-if="comment.video_thumbnail" :src="comment.video_thumbnail" alt="视频封面">
                <div v-else class="thumb-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
              </div>
              <div class="comment-content">
                <div class="comment-video-title" @click="goToVideo(comment.video_id)">
                  {{ comment.video_title || '视频已删除' }}
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-meta">
                  <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
                  <span class="comment-likes">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                    {{ comment.likes_count || 0 }}
                  </span>
                  <button class="delete-comment-btn" @click="deleteComment(comment.id)">删除</button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <div v-if="commentsPagination.totalPages > 1" class="pagination">
            <button 
              class="page-btn" 
              :disabled="commentsPagination.page <= 1"
              @click="fetchComments(commentsPagination.page - 1)"
            >
              上一页
            </button>
            <span class="page-info">{{ commentsPagination.page }} / {{ commentsPagination.totalPages }}</span>
            <button 
              class="page-btn" 
              :disabled="commentsPagination.page >= commentsPagination.totalPages"
              @click="fetchComments(commentsPagination.page + 1)"
            >
              下一页
            </button>
          </div>
        </div>

        <!-- 我的订阅 -->
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
              <div class="channel-avatar" @click="goToUser(channel.channel_id)">
                <img v-if="channel.avatar_url" :src="channel.avatar_url" alt="头像">
                <span v-else>{{ channel.nickname?.charAt(0) || channel.username?.charAt(0) || 'U' }}</span>
              </div>
              <div class="channel-info">
                <h4 @click="goToUser(channel.channel_id)">{{ channel.nickname || channel.username }}</h4>
                <p>{{ channel.subscribers_count || 0 }} 粉丝 · {{ channel.video_count || 0 }} 作品</p>
              </div>
              <button class="unsubscribe-btn" @click="unsubscribeChannel(channel.channel_id)">
                已订阅
              </button>
            </div>
          </div>
        </div>

        <!-- 设置 -->
        <div v-if="activeTab === 'settings'" class="settings-section">
          <!-- 个人信息卡片 -->
          <div class="settings-card">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              个人信息
            </h3>
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input type="text" v-model="profileForm.username" class="form-input" disabled>
              <span class="form-hint">用户名不可修改</span>
            </div>
            <div class="form-group">
              <label class="form-label">昵称</label>
              <input type="text" v-model="profileForm.nickname" class="form-input" placeholder="输入昵称">
            </div>
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input type="email" v-model="profileForm.email" class="form-input" placeholder="输入邮箱">
            </div>
            <div class="form-group">
              <label class="form-label">手机号</label>
              <input type="tel" v-model="profileForm.phone" class="form-input" placeholder="输入手机号">
            </div>
            <div class="form-group">
              <label class="form-label">性别</label>
              <select v-model="profileForm.gender" class="form-input">
                <option value="secret">保密</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">生日</label>
              <input type="date" v-model="profileForm.birthday" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">个人简介</label>
              <textarea v-model="profileForm.bio" class="form-input form-textarea" placeholder="介绍一下自己..." rows="3"></textarea>
            </div>
            <button class="btn btn-primary" @click="saveProfile" :disabled="saving">
              {{ saving ? '保存中...' : '保存修改' }}
            </button>
          </div>

          <!-- 账号信息卡片 -->
          <div class="settings-card">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              账号安全
            </h3>
            <div class="form-group">
              <label class="form-label">当前密码</label>
              <input type="password" v-model="passwordForm.current" class="form-input" placeholder="输入当前密码">
            </div>
            <div class="form-group">
              <label class="form-label">新密码</label>
              <input type="password" v-model="passwordForm.new" class="form-input" placeholder="输入新密码">
            </div>
            <div class="form-group">
              <label class="form-label">确认新密码</label>
              <input type="password" v-model="passwordForm.confirm" class="form-input" placeholder="再次输入新密码">
            </div>
            <button class="btn btn-primary" @click="changePassword">修改密码</button>
          </div>

          <!-- 统计数据卡片 -->
          <div class="settings-card stats-card">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              数据统计
            </h3>
            <div class="stats-grid">
              <div class="stat-box">
                <span class="stat-number">{{ userProfile?.video_count || 0 }}</span>
                <span class="stat-text">作品数</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ userProfile?.total_views || 0 }}</span>
                <span class="stat-text">总播放</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ likesCount }}</span>
                <span class="stat-text">获赞数</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ userProfile?.subscribers_count || 0 }}</span>
                <span class="stat-text">粉丝数</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ userProfile?.following_count || 0 }}</span>
                <span class="stat-text">关注数</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ userProfile?.favorites_count || favorites.length }}</span>
                <span class="stat-text">收藏数</span>
              </div>
            </div>
            <div class="account-info">
              <p>注册时间：{{ formatDate(userProfile?.created_at) }}</p>
              <p v-if="userProfile?.last_login_time">最后登录：{{ formatDate(userProfile.last_login_time) }}</p>
            </div>
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

    <!-- Toast通知 -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import VideoCard from '@/components/VideoCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useVideoStore } from '@/stores/video'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const videoStore = useVideoStore()

// 状态
const activeTab = ref('videos')
const userProfile = ref(null)
const userVideos = ref([])
const favorites = ref([])
const favoritesLoading = ref(false)
const likedVideos = ref([])
const likesLoading = ref(false)
const subscriptions = ref([])
const subscriptionsLoading = ref(false)
const userComments = ref([])
const commentsLoading = ref(false)
const commentsPagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 })
const totalViews = ref(0)
const likesCount = ref(0)
const saving = ref(false)

// Toast通知
const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

// 表单数据
const profileForm = ref({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  bio: '',
  gender: 'secret',
  birthday: ''
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

// 头像上传
const avatarInput = ref(null)

const tabs = [
  { label: '我的作品', value: 'videos', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' },
  { label: '我的收藏', value: 'favorites', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
  { label: '我的点赞', value: 'likes', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>' },
  { label: '我的评论', value: 'comments', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
  { label: '我的订阅', value: 'subscriptions', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  { label: '设置', value: 'settings', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' }
]

// 获取用户完整信息
const fetchUserProfile = async () => {
  try {
    const token = authStore.token || localStorage.getItem('token')
    const response = await fetch('http://localhost:3000/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    if (data.success) {
      userProfile.value = data.user
      profileForm.value = {
        username: data.user.username || '',
        nickname: data.user.nickname || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        bio: data.user.bio || '',
        gender: data.user.gender || 'secret',
        birthday: data.user.birthday || ''
      }
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
  }
}

// 获取点赞数
const fetchLikesCount = async () => {
  const userId = authStore.user?.id
  if (!userId) return
  
  try {
    const response = await fetch(`http://localhost:3000/api/likes/count?user_id=${userId}`)
    const data = await response.json()
    if (data.success) {
      likesCount.value = data.count
    }
  } catch (err) {
    console.error('获取点赞数失败:', err)
  }
}

// 保存个人信息
const saveProfile = async () => {
  saving.value = true
  try {
    const token = authStore.token || localStorage.getItem('token')
    const response = await fetch('http://localhost:3000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileForm.value)
    })
    const data = await response.json()
    if (data.success) {
      userProfile.value = data.user
      showToast('资料已保存')
      // 更新本地存储的用户信息
      const user = { ...authStore.user, ...data.user }
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      showToast(data.message || '保存失败', 'error')
    }
  } catch (err) {
    console.error('保存失败:', err)
    showToast('保存失败', 'error')
  } finally {
    saving.value = false
  }
}

// 修改密码
const changePassword = async () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    showToast('两次输入的密码不一致', 'error')
    return
  }
  showToast('密码修改功能开发中', 'info')
  passwordForm.value = { current: '', new: '', confirm: '' }
}

// 编辑资料
const editProfile = () => {
  activeTab.value = 'settings'
}

// 头像上传
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  // 简单处理：直接使用本地URL预览
  const reader = new FileReader()
  reader.onload = async (e) => {
    const avatarUrl = e.target.result
    try {
      const token = authStore.token || localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar_url: avatarUrl })
      })
      const data = await response.json()
      if (data.success) {
        userProfile.value = { ...userProfile.value, avatar_url: avatarUrl }
        showToast('头像已更新')
      }
    } catch (err) {
      console.error('头像上传失败:', err)
      showToast('头像上传失败', 'error')
    }
  }
  reader.readAsDataURL(file)
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

// 获取点赞列表
const fetchLikes = async () => {
  const userId = authStore.user?.id
  if (!userId) return
  
  likesLoading.value = true
  try {
    const response = await fetch(`http://localhost:3000/api/likes?user_id=${userId}`)
    const data = await response.json()
    if (data.success) {
      likedVideos.value = data.videos || []
    }
  } catch (err) {
    console.error('获取点赞失败:', err)
  } finally {
    likesLoading.value = false
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
      showToast('已取消收藏')
    }
  } catch (err) {
    console.error('取消收藏失败:', err)
  }
}

// 获取评论列表
const fetchComments = async (page = 1) => {
  const userId = authStore.user?.id
  if (!userId) return
  
  commentsLoading.value = true
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}/comments?page=${page}&limit=20`)
    const data = await response.json()
    if (data.success) {
      userComments.value = data.comments || []
      commentsPagination.value = data.pagination
    }
  } catch (err) {
    console.error('获取评论失败:', err)
  } finally {
    commentsLoading.value = false
  }
}

// 删除评论
const deleteComment = async (commentId) => {
  if (!confirm('确定删除这条评论吗？')) return
  
  try {
    const token = authStore.token || localStorage.getItem('token')
    const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    if (data.success) {
      userComments.value = userComments.value.filter(c => c.id !== commentId)
      showToast('评论已删除')
    } else {
      showToast(data.message || '删除失败', 'error')
    }
  } catch (err) {
    console.error('删除评论失败:', err)
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
      showToast('已取消订阅')
    }
  } catch (err) {
    console.error('取消订阅失败:', err)
  }
}

// 跳转到视频
const goToVideo = (videoId) => {
  router.push(`/video/${videoId}`)
}

// 跳转到用户主页
const goToUser = (userId) => {
  router.push(`/user/${userId}`)
}

// 标签切换
const handleTabChange = (tab) => {
  activeTab.value = tab
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}月前`
  return `${Math.floor(days / 365)}年前`
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 监听标签切换
watch(activeTab, (newTab) => {
  if (newTab === 'favorites' && favorites.value.length === 0) fetchFavorites()
  if (newTab === 'likes' && likedVideos.value.length === 0) fetchLikes()
  if (newTab === 'subscriptions' && subscriptions.value.length === 0) fetchSubscriptions()
  if (newTab === 'comments' && userComments.value.length === 0) fetchComments()
})

onMounted(async () => {
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
  
  if (authStore.user) {
    // 获取用户完整信息
    await fetchUserProfile()
    
    // Fetch user videos
    await videoStore.fetchVideos({ user_id: authStore.user.id, limit: 100 })
    userVideos.value = videoStore.videos
    totalViews.value = userVideos.value.reduce((sum, v) => sum + (v.views || 0), 0)
    
    // 获取点赞数
    await fetchLikesCount()
  }
})
</script>

<style scoped>
.profile-container {
  padding-top: 100px;
  padding-bottom: 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 32px;
  background: var(--surface);
  border-radius: var(--radius);
  margin-bottom: 32px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
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

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  font-size: 1.8rem;
  margin-bottom: 4px;
}

.user-email {
  color: var(--text-muted);
  margin-bottom: 4px;
}

.user-bio {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 16px;
  line-height: 1.5;
}

.profile-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.3s;
}

.stat-item:hover {
  background: var(--surface2);
}

.stat-value {
  display: block;
  font-size: 1.3rem;
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
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  font-weight: 500;
  transition: var(--transition);
  border: none;
  white-space: nowrap;
}

.tab-icon {
  display: flex;
  align-items: center;
}

.tab-btn:hover {
  background: var(--surface);
  color: var(--text);
}

.tab-btn.active {
  background: var(--gradient);
  color: white;
}

.videos-grid, .video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.favorites-section, .likes-section, .subscriptions-section, .comments-section {
  min-height: 300px;
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

/* 评论列表样式 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--surface);
  border-radius: var(--radius);
  transition: var(--transition);
}

.comment-item:hover {
  background: var(--surface2);
}

.comment-video-thumb {
  width: 120px;
  height: 68px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
}

.comment-video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: var(--surface2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-video-title {
  font-weight: 500;
  margin-bottom: 8px;
  cursor: pointer;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-video-title:hover {
  color: var(--primary);
}

.comment-text {
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.comment-likes {
  display: flex;
  align-items: center;
  gap: 4px;
}

.delete-comment-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: var(--transition);
}

.delete-comment-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.page-btn {
  padding: 8px 16px;
  background: var(--surface);
  border: 1px solid var(--surface2);
  border-radius: var(--radius-sm);
  color: var(--text);
  cursor: pointer;
  transition: var(--transition);
}

.page-btn:hover:not(:disabled) {
  background: var(--surface2);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--text-muted);
}

/* 频道卡片样式 */
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
  overflow: hidden;
  cursor: pointer;
}

.channel-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.channel-info {
  flex: 1;
  min-width: 0;
}

.channel-info h4 {
  font-weight: 600;
  margin-bottom: 4px;
  cursor: pointer;
}

.channel-info h4:hover {
  color: var(--primary);
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

/* 设置页面样式 */
.settings-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.settings-card {
  padding: 24px;
  background: var(--surface);
  border-radius: var(--radius);
}

.settings-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--surface2);
}

.settings-card h3 svg {
  color: var(--primary);
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--surface2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 0.95rem;
  transition: var(--transition);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* 统计卡片 */
.stats-card {
  grid-column: 1 / -1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-box {
  text-align: center;
  padding: 16px;
  background: var(--surface2);
  border-radius: var(--radius-sm);
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.account-info {
  padding-top: 16px;
  border-top: 1px solid var(--surface2);
  font-size: 0.9rem;
  color: var(--text-muted);
}

.account-info p {
  margin-bottom: 8px;
}

.loading, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
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

/* Toast通知 */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  color: white;
  font-weight: 500;
  z-index: 9999;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.toast.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.toast.info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-stats {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .settings-section {
    grid-template-columns: 1fr;
  }
  
  .videos-grid, .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .comment-item {
    flex-direction: column;
  }
  
  .comment-video-thumb {
    width: 100%;
    height: 160px;
  }
}
</style>
