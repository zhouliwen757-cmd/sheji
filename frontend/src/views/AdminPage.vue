<template>
  <div class="page-container">
    
    <div class="admin-container">
      <div class="admin-header">
        <h1>管理后台</h1>
        <p>异世界 视频平台管理系统</p>
      </div>
      
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon users">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalUsers }}</span>
            <span class="stat-label">总用户数</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon videos">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalVideos }}</span>
            <span class="stat-label">视频总数</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon comments">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalComments }}</span>
            <span class="stat-label">评论总数</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.activeUsers }}</span>
            <span class="stat-label">活跃用户</span>
          </div>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="admin-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <component :is="tab.icon" />
          {{ tab.label }}
        </button>
      </div>
      
      <!-- Users Management -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="content-header">
          <h2>用户管理</h2>
          <span class="count-badge">{{ users.length }} 个用户</span>
        </div>
        
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>
        
        <div v-else class="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>注册时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar-small">{{ user.username?.charAt(0).toUpperCase() }}</div>
                    <span>{{ user.username }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="['role-badge', user.role?.toLowerCase()]">
                    {{ user.role === 'ADMIN' ? '管理员' : '普通用户' }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" @click="editUserRole(user)" title="修改角色">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="btn-icon danger" @click="handleDeleteUser(user)" title="删除用户">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Videos Management -->
      <div v-if="activeTab === 'videos'" class="tab-content">
        <div class="content-header">
          <h2>视频管理</h2>
          <span class="count-badge">{{ videos.length }} 个视频</span>
        </div>
        
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>
        
        <div v-else-if="videos.length === 0" class="empty-state">
          <p>暂无视频数据</p>
        </div>
        
        <div v-else class="video-list">
          <div v-for="video in videos" :key="video.id" class="video-item">
            <img :src="video.thumbnail_url || '/placeholder.png'" class="video-thumb" />
            <div class="video-info">
              <h4>{{ video.title }}</h4>
              <div class="video-tags">
                <span :class="['category-tag', video.category]">{{ getCategoryLabel(video.category) }}</span>
                <span :class="['status-tag', video.status]">{{ getStatusLabel(video.status) }}</span>
                <span class="quality-tag">{{ video.quality }}</span>
              </div>
              <p>{{ video.description?.slice(0, 80) }}{{ video.description?.length > 80 ? '...' : '' }}</p>
              <span class="video-meta">{{ formatDate(video.created_at) }} · {{ video.views || 0 }} 次播放</span>
            </div>
            <div class="video-actions">
              <button class="btn-icon" @click="editVideo(video)" title="编辑视频">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn-icon danger" @click="handleDeleteVideo(video)" title="删除视频">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Comments Management -->
      <div v-if="activeTab === 'comments'" class="tab-content">
        <div class="content-header">
          <h2>评论管理</h2>
          <span class="count-badge">{{ comments.length }} 条评论</span>
        </div>
        
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>
        
        <div v-else-if="comments.length === 0" class="empty-state">
          <p>暂无评论数据</p>
        </div>
        
        <div v-else class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-user">{{ comment.user_name || '匿名用户' }}</div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-footer">
              <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
              <button class="btn-icon danger" @click="handleDeleteComment(comment)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Role Modal -->
    <div v-if="showRoleModal" class="modal-overlay" @click.self="showRoleModal = false">
      <div class="modal">
        <h3>修改用户角色</h3>
        <div class="form-group">
          <label>选择角色</label>
          <select v-model="selectedRole">
            <option value="USER">普通用户</option>
            <option value="ADMIN">管理员</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showRoleModal = false">取消</button>
          <button class="btn btn-primary" @click="saveUserRole">保存</button>
        </div>
      </div>
    </div>

    <!-- Edit Video Modal -->
    <div v-if="showVideoModal" class="modal-overlay" @click.self="showVideoModal = false">
      <div class="modal modal-lg">
        <h3>编辑视频</h3>
        <div class="form-group">
          <label>视频标题</label>
          <input type="text" v-model="editingVideo.title" class="form-input" placeholder="输入视频标题" />
        </div>
        <div class="form-group">
          <label>视频描述</label>
          <textarea v-model="editingVideo.description" class="form-input" rows="4" placeholder="输入视频描述"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>分类</label>
            <select v-model="editingVideo.category" class="form-input">
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="editingVideo.status" class="form-input">
              <option v-for="s in videoStatuses" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>画质</label>
            <select v-model="editingVideo.quality" class="form-input">
              <option v-for="q in qualities" :key="q" :value="q">{{ q }}</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showVideoModal = false">取消</button>
          <button class="btn btn-primary" @click="saveVideo">保存修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAllUsers, updateUserRole, deleteUser, getAllVideos, updateVideo, deleteVideo, getAllComments, deleteComment, getAdminStats } from '@/api/admin'

const router = useRouter()

const activeTab = ref('users')
const loading = ref(false)
const showRoleModal = ref(false)
const showVideoModal = ref(false)
const selectedUser = ref(null)
const selectedRole = ref('USER')
const selectedVideo = ref(null)
const editingVideo = ref({
  title: '',
  description: '',
  category: 'movie',
  status: 'approved',
  quality: '1080P'
})

const categories = [
  { value: 'movie', label: '电影' },
  { value: 'anime', label: '动漫' },
  { value: 'drama', label: '剧集' },
  { value: 'variety', label: '综艺' },
  { value: 'music', label: '音乐' },
  { value: 'documentary', label: '纪录片' },
  { value: 'sports', label: '体育' },
  { value: 'education', label: '教育' },
  { value: 'other', label: '其他' }
]

const videoStatuses = [
  { value: 'approved', label: '已通过' },
  { value: 'pending', label: '待审核' },
  { value: 'rejected', label: '已拒绝' }
]

const qualities = ['480P', '720P', '1080P', '2K', '4K']

const stats = reactive({
  totalUsers: 0,
  totalVideos: 0,
  totalComments: 0,
  activeUsers: 0
})

const users = ref([])
const videos = ref([])
const comments = ref([])

// Icon components - define before tabs
const UsersIcon = {
  render: () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: 9, cy: 7, r: 4 }),
    h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
    h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
  ])
}

const VideoIcon = {
  render: () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('polygon', { points: '23 7 16 12 23 17 23 7' }),
    h('rect', { x: 1, y: 5, width: 15, height: 14, rx: 2, ry: 2 })
  ])
}

const CommentIcon = {
  render: () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('path', { d: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' })
  ])
}

const tabs = [
  { key: 'users', label: '用户管理', icon: UsersIcon },
  { key: 'videos', label: '视频管理', icon: VideoIcon },
  { key: 'comments', label: '评论管理', icon: CommentIcon }
]

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}

const getCategoryLabel = (category) => {
  const cat = categories.find(c => c.value === category)
  return cat ? cat.label : category || '其他'
}

const getStatusLabel = (status) => {
  const s = videoStatuses.find(item => item.value === status)
  return s ? s.label : status || '未知'
}

const fetchStats = async () => {
  try {
    const res = await getAdminStats()
    console.log('Stats response:', res)
    if (res.success) {
      Object.assign(stats, res.stats)
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err)
  }
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await getAllUsers()
    if (res.success) {
      users.value = res.users
    }
  } catch (err) {
    console.error('Failed to fetch users:', err)
  } finally {
    loading.value = false
  }
}

const fetchVideos = async () => {
  loading.value = true
  try {
    const res = await getAllVideos()
    if (res.success) {
      videos.value = res.videos
    }
  } catch (err) {
    console.error('Failed to fetch videos:', err)
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  loading.value = true
  try {
    const res = await getAllComments()
    if (res.success) {
      comments.value = res.comments
    }
  } catch (err) {
    console.error('Failed to fetch comments:', err)
  } finally {
    loading.value = false
  }
}

// Watch for tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'videos' && videos.value.length === 0) {
    fetchVideos()
  } else if (newTab === 'comments' && comments.value.length === 0) {
    fetchComments()
  }
})

const editUserRole = (user) => {
  selectedUser.value = user
  selectedRole.value = user.role || 'USER'
  showRoleModal.value = true
}

const saveUserRole = async () => {
  try {
    const res = await updateUserRole(selectedUser.value.id, selectedRole.value)
    if (res.success) {
      await fetchUsers()
      showRoleModal.value = false
    }
  } catch (err) {
    console.error('Failed to update role:', err)
  }
}

const handleDeleteUser = async (user) => {
  if (!confirm(`确定要删除用户 "${user.username}" 吗？`)) return
  try {
    await deleteUser(user.id)
    await fetchUsers()
    await fetchStats()
  } catch (err) {
    alert(err.response?.data?.message || '删除失败')
  }
}

const handleDeleteVideo = async (video) => {
  try {
    await deleteVideo(video.id)
    await fetchVideos()
    await fetchStats()
  } catch (err) {
    alert(err.response?.data?.message || '删除失败')
  }
}

const editVideo = (video) => {
  selectedVideo.value = video
  editingVideo.value = {
    title: video.title || '',
    description: video.description || '',
    category: video.category || 'movie',
    status: video.status || 'approved',
    quality: video.quality || '1080P'
  }
  showVideoModal.value = true
}

const saveVideo = async () => {
  try {
    const res = await updateVideo(selectedVideo.value.id, editingVideo.value)
    if (res.success) {
      await fetchVideos()
      showVideoModal.value = false
    }
  } catch (err) {
    alert(err.response?.data?.message || '更新失败')
  }
}

const handleDeleteComment = async (comment) => {
  if (!confirm('确定要删除这条评论吗？')) return
  try {
    await deleteComment(comment.id)
    await fetchComments()
  } catch (err) {
    alert('删除失败')
  }
}

onMounted(async () => {
  await fetchStats()
  await fetchUsers()
})
</script>

<style>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 48px;
}

.admin-header {
  margin-bottom: 32px;
}

.admin-header h1 {
  font-size: 2rem;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.admin-header p {
  color: var(--text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.users { background: rgba(99, 102, 241, 0.15); color: var(--primary); }
.stat-icon.videos { background: rgba(236, 72, 153, 0.15); color: var(--secondary); }
.stat-icon.comments { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.stat-icon.active { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.95rem;
}

.tab-btn:hover {
  background: var(--surface);
  color: var(--text);
}

.tab-btn.active {
  background: var(--gradient);
  color: white;
}

.tab-content {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 24px;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.content-header h2 {
  font-size: 1.25rem;
}

.count-badge {
  padding: 4px 12px;
  background: var(--surface2);
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-muted);
}

/* Table */
.data-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.85rem;
  text-transform: uppercase;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.role-badge.admin {
  background: rgba(236, 72, 153, 0.15);
  color: var(--secondary);
}

.role-badge.user {
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: var(--surface2);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.btn-icon:hover {
  background: var(--primary);
  color: white;
}

.btn-icon.danger:hover {
  background: #ef4444;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--surface2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Video List */
.video-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--surface2);
  border-radius: var(--radius-sm);
}

.video-thumb {
  width: 120px;
  height: 68px;
  object-fit: cover;
  border-radius: 6px;
  background: var(--bg);
}

.video-info {
  flex: 1;
}

.video-info h4 {
  font-size: 1rem;
  margin-bottom: 4px;
}

.video-info p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.video-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.video-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.category-tag,
.status-tag,
.quality-tag {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.category-tag.movie { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.category-tag.anime { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
.category-tag.drama { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.category-tag.variety { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.category-tag.music { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
.category-tag.documentary { background: rgba(132, 90, 50, 0.15); color: #8b5a2b; }
.category-tag.sports { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.category-tag.education { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
.category-tag.other { background: rgba(107, 114, 128, 0.15); color: #6b7280; }

.status-tag.approved { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.status-tag.pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.status-tag.rejected { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

.quality-tag {
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary);
}

.video-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.modal-lg {
  width: 600px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
  font-size: 0.95rem;
  transition: var(--transition);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  padding: 16px;
  background: var(--surface2);
  border-radius: var(--radius-sm);
}

.comment-user {
  font-weight: 600;
  margin-bottom: 8px;
}

.comment-content {
  color: var(--text);
  margin-bottom: 8px;
  line-height: 1.5;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-time {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 24px;
  width: 400px;
  max-width: 90%;
}

.modal h3 {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .admin-container {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
