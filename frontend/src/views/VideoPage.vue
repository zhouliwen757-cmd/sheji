<template>
  <div class="page-container">
    <Navbar />
    
    <div class="main-container" v-if="video">
      <div class="video-section">
        <!-- Video Player -->
        <div class="video-wrapper">
          <div 
            class="video-player-container" 
            ref="playerContainer"
            @mousemove="showControls"
            @mouseleave="hideControlsDelayed"
            @dblclick="toggleFullscreen"
          >
            <video 
              ref="videoPlayer"
              :src="video.video_url" 
              :poster="video.thumbnail_url"
              @click="togglePlay"
              @timeupdate="onTimeUpdate"
              @loadedmetadata="onLoadedMetadata"
              @play="isPlaying = true"
              @pause="isPlaying = false"
              @ended="onVideoEnded"
              @waiting="isBuffering = true"
              @canplay="isBuffering = false"
            ></video>
            
            <!-- Loading Spinner -->
            <div class="video-loading" v-if="isBuffering">
              <div class="spinner"></div>
            </div>
            
            <!-- Big Play Button (when paused) -->
            <div class="big-play-btn" v-if="!isPlaying && !isBuffering" @click="togglePlay">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            
            <!-- Custom Controls -->
            <div class="custom-controls" :class="{ visible: controlsVisible || !isPlaying }">
              <!-- Progress Bar -->
              <div class="progress-container" @click="seekTo">
                <div class="progress-bar">
                  <div class="progress-buffered" :style="{ width: bufferedPercent + '%' }"></div>
                  <div class="progress-played" :style="{ width: progressPercent + '%' }">
                    <div class="progress-handle"></div>
                  </div>
                </div>
              </div>
              
              <!-- Control Buttons -->
              <div class="controls-row">
                <div class="controls-left">
                  <button class="control-btn" @click="togglePlay">
                    <svg v-if="isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <rect x="6" y="4" width="4" height="16"/>
                      <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                  
                  <!-- Volume -->
                  <div class="volume-control">
                    <button class="control-btn" @click="toggleMute">
                      <svg v-if="isMuted || volume === 0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <line x1="23" y1="9" x2="17" y2="15"/>
                        <line x1="17" y1="9" x2="23" y2="15"/>
                      </svg>
                      <svg v-else-if="volume < 0.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </svg>
                      <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </svg>
                    </button>
                    <input 
                      type="range" 
                      class="volume-slider" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      :value="isMuted ? 0 : volume"
                      @input="setVolume"
                    />
                  </div>
                  
                  <span class="time-display">
                    {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
                  </span>
                </div>
                
                <div class="controls-right">
                  <!-- Playback Speed -->
                  <div class="speed-control">
                    <button class="control-btn speed-btn" @click="showSpeedMenu = !showSpeedMenu">
                      {{ playbackSpeed }}x
                    </button>
                    <div class="speed-menu" v-if="showSpeedMenu">
                      <div 
                        v-for="speed in playbackSpeeds" 
                        :key="speed"
                        :class="{ active: playbackSpeed === speed }"
                        @click="setPlaybackSpeed(speed)"
                      >
                        {{ speed }}x
                      </div>
                    </div>
                  </div>
                  
                  <!-- Picture-in-Picture -->
                  <button class="control-btn" @click="togglePiP" v-if="supportsPiP">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <rect x="12" y="9" width="8" height="6" rx="1"/>
                    </svg>
                  </button>
                  
                  <!-- Fullscreen -->
                  <button class="control-btn" @click="toggleFullscreen">
                    <svg v-if="!isFullscreen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                    </svg>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="video-controls">
            <h1 class="video-title">{{ video.title }}</h1>
            <div class="video-meta">
              <div class="meta-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {{ videoStore.formatViews(video.views) }} 次观看
              </div>
              <div class="meta-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {{ formatTime(duration) }}
              </div>
              <div class="video-actions">
                <button class="action-btn" :class="{ liked: isLiked }" @click="toggleLike">
                  <svg width="18" height="18" viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {{ likes }}
                </button>
                <button class="action-btn" :class="{ favorited: isFavorited }" @click="toggleFavorite">
                  <svg width="18" height="18" viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {{ isFavorited ? '已收藏' : '收藏' }}
                </button>
                <button class="action-btn" @click="shareVideo">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  分享
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Video Info -->
        <div class="video-info-section">
          <div class="author-info">
            <div class="author-avatar" @click="goToUserProfile">
              {{ getInitial(video.uploader_nickname || video.uploader_name || 'U') }}
            </div>
            <div class="author-details" @click="goToUserProfile">
              <h4>{{ video.uploader_nickname || video.uploader_name || '未知用户' }}</h4>
              <p>{{ subscribers }} 粉丝 · 发布于 {{ formatDate(video.created_at) }}</p>
            </div>
            <button class="btn btn-primary subscribe-btn" v-if="!isSubscribed" @click="subscribe">订阅</button>
            <button class="btn btn-secondary subscribed-btn" v-else @click="unsubscribe">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              已订阅
            </button>
          </div>

          <div class="video-description">
            <h3>视频简介</h3>
            <p>{{ video.description || '暂无描述' }}</p>
          </div>

          <div class="video-tags" v-if="video.tags && video.tags.length">
            <span class="tag" v-for="tag in video.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
          <h3>评论 ({{ comments.length }})</h3>
          <div class="comment-form">
            <div class="comment-avatar" v-if="isLoggedIn">
              {{ currentUser?.nickname?.charAt(0) || currentUser?.username?.charAt(0) || 'U' }}
            </div>
            <div class="comment-input-wrapper">
              <textarea v-model="newComment" placeholder="登录后发表评论..." rows="3" :disabled="!isLoggedIn"></textarea>
              <button class="btn btn-primary" @click="submitComment" :disabled="!newComment.trim() || !isLoggedIn">
                发布评论
              </button>
            </div>
          </div>
          <div class="comments-list" v-if="comments.length > 0">
            <div class="comment-item" v-for="comment in comments" :key="comment.id">
              <img v-if="comment.avatar_url" :src="comment.avatar_url" class="comment-avatar-img" />
              <div v-else class="comment-avatar">
                {{ getInitial(comment.user_name || 'U') }}
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.user_name || '匿名用户' }}</span>
                  <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
              </div>
            </div>
          </div>
          <div v-else class="no-comments">
            还没有评论，快来抢沙发吧！
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <h3>相关推荐</h3>
        <div class="related-videos">
          <VideoCard v-for="v in relatedVideos" :key="v.id" :video="v" />
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import VideoCard from '@/components/VideoCard.vue'
import { useVideoStore } from '@/stores/video'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const videoStore = useVideoStore()
const authStore = useAuthStore()
const toast = useToast()

const video = ref(null)

// 登录状态和用户信息 - 直接从 localStorage 获取
const currentUser = computed(() => {
  try {
    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (userStr && token) {
      return JSON.parse(userStr)
    }
  } catch (e) {}
  return null
})
const isLoggedIn = computed(() => !!currentUser.value)
const videoPlayer = ref(null)
const playerContainer = ref(null)

// Player state
const isPlaying = ref(false)
const isBuffering = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const bufferedPercent = ref(0)
const isFullscreen = ref(false)
const controlsVisible = ref(true)
const showSpeedMenu = ref(false)
const playbackSpeed = ref(1)
const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

// Feature support
const supportsPiP = ref(false)

// Other state
const isLiked = ref(false)
const likes = ref(0)
const isSubscribed = ref(false)
const subscribers = ref(0)
const isFavorited = ref(false)
const comments = ref([])
const newComment = ref('')
const relatedVideos = ref([])

let controlsTimeout = null

const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const getInitial = (name) => {
  return (name || 'U').charAt(0).toUpperCase()
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Player Controls
const togglePlay = () => {
  if (!videoPlayer.value) return
  if (isPlaying.value) {
    videoPlayer.value.pause()
  } else {
    videoPlayer.value.play()
  }
}

const onTimeUpdate = () => {
  if (!videoPlayer.value) return
  currentTime.value = videoPlayer.value.currentTime
  
  // Update buffered
  if (videoPlayer.value.buffered.length > 0) {
    bufferedPercent.value = (videoPlayer.value.buffered.end(0) / duration.value) * 100
  }
}

const onLoadedMetadata = () => {
  if (!videoPlayer.value) return
  duration.value = videoPlayer.value.duration
  
  // Restore saved position
  const savedTime = localStorage.getItem(`video_progress_${route.params.id}`)
  if (savedTime) {
    videoPlayer.value.currentTime = parseFloat(savedTime)
  }
}

const onVideoEnded = () => {
  isPlaying.value = false
  localStorage.removeItem(`video_progress_${route.params.id}`)
}

const seekTo = (e) => {
  if (!videoPlayer.value || duration.value === 0) return
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  videoPlayer.value.currentTime = percent * duration.value
}

const toggleMute = () => {
  if (!videoPlayer.value) return
  isMuted.value = !isMuted.value
  videoPlayer.value.muted = isMuted.value
}

const setVolume = (e) => {
  if (!videoPlayer.value) return
  const newVolume = parseFloat(e.target.value)
  volume.value = newVolume
  videoPlayer.value.volume = newVolume
  isMuted.value = newVolume === 0
}

const setPlaybackSpeed = (speed) => {
  if (!videoPlayer.value) return
  playbackSpeed.value = speed
  videoPlayer.value.playbackRate = speed
  showSpeedMenu.value = false
}

const toggleFullscreen = async () => {
  if (!playerContainer.value) return
  
  try {
    if (!document.fullscreenElement) {
      await playerContainer.value.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  } catch (err) {
    console.error('Fullscreen error:', err)
  }
}

const togglePiP = async () => {
  if (!videoPlayer.value) return
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    } else {
      await videoPlayer.value.requestPictureInPicture()
    }
  } catch (err) {
    console.error('PiP error:', err)
  }
}

const showControls = () => {
  controlsVisible.value = true
  clearTimeout(controlsTimeout)
}

const hideControlsDelayed = () => {
  if (isPlaying.value) {
    controlsTimeout = setTimeout(() => {
      controlsVisible.value = false
    }, 3000)
  }
}

// Keyboard shortcuts
const handleKeydown = (e) => {
  if (!videoPlayer.value) return
  
  switch (e.key) {
    case ' ':
    case 'k':
      e.preventDefault()
      togglePlay()
      break
    case 'ArrowLeft':
      e.preventDefault()
      videoPlayer.value.currentTime = Math.max(0, currentTime.value - 5)
      break
    case 'ArrowRight':
      e.preventDefault()
      videoPlayer.value.currentTime = Math.min(duration.value, currentTime.value + 5)
      break
    case 'ArrowUp':
      e.preventDefault()
      volume.value = Math.min(1, volume.value + 0.1)
      videoPlayer.value.volume = volume.value
      break
    case 'ArrowDown':
      e.preventDefault()
      volume.value = Math.max(0, volume.value - 0.1)
      videoPlayer.value.volume = volume.value
      break
    case 'f':
      toggleFullscreen()
      break
    case 'm':
      toggleMute()
      break
  }
}

// Save progress periodically
const saveProgress = () => {
  if (currentTime.value > 10) {
    localStorage.setItem(`video_progress_${route.params.id}`, currentTime.value.toString())
  }
}

const toggleLike = async () => {
  const userId = getUserId()
  if (!userId) {
    toast.info('请先登录')
    return
  }

  try {
    if (isLiked.value) {
      // Remove like
      const response = await fetch(`http://localhost:3000/api/likes?user_id=${userId}&video_id=${route.params.id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        isLiked.value = false
        likes.value = Math.max(0, likes.value - 1)
      }
    } else {
      // Add like
      const response = await fetch('http://localhost:3000/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          video_id: route.params.id
        })
      })
      const data = await response.json()
      if (data.success) {
        isLiked.value = true
        likes.value += 1
      }
    }
  } catch (err) {
    console.error('Like error:', err)
    toast.error('操作失败')
  }
}

// 检查点赞状态
const checkLike = async () => {
  const userId = getUserId()
  if (!userId) return

  try {
    const response = await fetch(`http://localhost:3000/api/likes/check?user_id=${userId}&video_id=${route.params.id}`)
    const data = await response.json()
    if (data.success) {
      isLiked.value = data.isLiked
    }
  } catch (err) {
    console.error('Check like error:', err)
  }
}

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

const toggleFavorite = async () => {
  const userId = getUserId()
  if (!userId) {
    toast.info('请先登录')
    return
  }

  try {
    if (isFavorited.value) {
      // Remove from favorites
      const response = await fetch(`http://localhost:3000/api/favorites?user_id=${userId}&video_id=${route.params.id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        isFavorited.value = false
      }
    } else {
      // Add to favorites
      const response = await fetch('http://localhost:3000/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          video_id: route.params.id
        })
      })
      const data = await response.json()
      if (data.success) {
        isFavorited.value = true
      }
    }
  } catch (err) {
    console.error('Favorite error:', err)
    toast.error('操作失败')
  }
}

const checkFavorite = async () => {
  const userId = getUserId()
  if (!userId) return

  try {
    const response = await fetch(`http://localhost:3000/api/favorites/check?user_id=${userId}&video_id=${route.params.id}`)
    const data = await response.json()
    if (data.success) {
      isFavorited.value = data.isFavorited
    }
  } catch (err) {
    console.error('Check favorite error:', err)
  }
}

const shareVideo = async () => {
  const url = window.location.href
  if (navigator.share) {
    await navigator.share({
      title: video.value?.title,
      url: url
    })
  } else {
    await navigator.clipboard.writeText(url)
    toast.success('链接已复制到剪贴板')
  }
}

// 订阅作者
const subscribe = async () => {
  const userId = getUserId()
  if (!userId) {
    toast.info('请先登录')
    return
  }

  const channelId = video.value?.user_id
  if (!channelId) return

  try {
    const response = await fetch('http://localhost:3000/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriber_id: userId,
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
    console.error('Subscribe error:', err)
    toast.error('订阅失败')
  }
}

// 取消订阅
const unsubscribe = async () => {
  const userId = getUserId()
  if (!userId) {
    toast.info('请先登录')
    return
  }

  const channelId = video.value?.user_id
  if (!channelId) return

  try {
    const response = await fetch(`http://localhost:3000/api/subscriptions?subscriber_id=${userId}&channel_id=${channelId}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (data.success) {
      isSubscribed.value = false
      subscribers.value = Math.max(0, (subscribers.value || 0) - 1)
      toast.success('已取消订阅')
    }
  } catch (err) {
    console.error('Unsubscribe error:', err)
    toast.error('取消订阅失败')
  }
}

// 检查订阅状态
const checkSubscription = async () => {
  const userId = getUserId()
  if (!userId) return

  const channelId = video.value?.user_id
  if (!channelId) return

  try {
    const response = await fetch(`http://localhost:3000/api/subscriptions/check?subscriber_id=${userId}&channel_id=${channelId}`)
    const data = await response.json()
    if (data.success) {
      isSubscribed.value = data.isSubscribed
    }
  } catch (err) {
    console.error('Check subscription error:', err)
  }
}

// 获取订阅者数量
const fetchSubscriberCount = async () => {
  const channelId = video.value?.user_id
  if (!channelId) return

  try {
    const response = await fetch(`http://localhost:3000/api/users/${channelId}/subscribers`)
    const data = await response.json()
    if (data.success) {
      subscribers.value = data.count
    }
  } catch (err) {
    console.error('Fetch subscriber count error:', err)
  }
}

// 跳转到用户个人中心
const goToUserProfile = () => {
  const userId = video.value?.user_id
  if (userId) {
    router.push(`/user/${userId}`)
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  const userId = getUserId()
  if (!userId) {
    toast.info('请先登录后再评论')
    return
  }

  try {
    const response = await fetch(`http://localhost:3000/api/videos/${route.params.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newComment.value,
        user_id: userId
      })
    })
    const data = await response.json()
    
    if (data.success) {
      comments.value.unshift(data.comment)
      newComment.value = ''
    } else {
      toast.error(data.message || '发表评论失败')
    }
  } catch (err) {
    console.error('Submit comment error:', err)
    toast.error('发表评论失败')
  }
}

const fetchComments = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/videos/${route.params.id}/comments`)
    const data = await response.json()
    if (data.success) {
      comments.value = data.comments
    }
  } catch (err) {
    console.error('Fetch comments error:', err)
  }
}

onMounted(async () => {
  // Check PiP support
  supportsPiP.value = 'pictureInPictureEnabled' in document
  
  // Add keyboard listener
  window.addEventListener('keydown', handleKeydown)
  
  const videoId = route.params.id
  const result = await videoStore.fetchVideo(videoId)
  if (result) {
    video.value = result
    // 使用视频的实际点赞数，如果没有则随机生成
    likes.value = result.likes_count || Math.floor(Math.random() * 10000)
    // 获取订阅者数量
    await fetchSubscriberCount()
  }
  
  // Fetch comments
  await fetchComments()
  
  // Check if favorited
  await checkFavorite()
  
  // Check like status
  await checkLike()
  
  // Check subscription status
  await checkSubscription()
  
  // Fetch related videos
  await videoStore.fetchVideos({ limit: 6 })
  relatedVideos.value = videoStore.videos.filter(v => v.id !== parseInt(videoId)).slice(0, 4)
  
  // Save progress every 10 seconds
  progressInterval.value = setInterval(saveProgress, 10000)
})

// 用于清理的 interval ID
const progressInterval = ref(null)

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  clearTimeout(controlsTimeout)
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
  }
})
</script>

<style scoped>
.main-container {
  display: flex;
  padding: 24px 48px;
  gap: 24px;
}

.video-section {
  flex: 1;
}

.video-wrapper {
  background: var(--surface);
  border-radius: var(--radius);
  overflow: hidden;
}

.video-player-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
}

.video-player-container video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

/* Custom Controls */
.video-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.big-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  z-index: 10;
}

.big-play-btn:hover {
  background: var(--primary);
  transform: translate(-50%, -50%) scale(1.1);
}

.custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 20px 16px 12px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 20;
}

.custom-controls.visible {
  opacity: 1;
}

.progress-container {
  padding: 8px 0;
  cursor: pointer;
  margin-bottom: 8px;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.progress-container:hover .progress-bar {
  height: 6px;
}

.progress-buffered {
  position: absolute;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
}

.progress-played {
  position: absolute;
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.progress-handle {
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  transform: translateX(50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s;
}

.progress-container:hover .progress-handle {
  opacity: 1;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: var(--transition);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 4px;
}

.volume-slider {
  width: 0;
  opacity: 0;
  transition: all 0.3s;
  accent-color: var(--primary);
  cursor: pointer;
}

.volume-control:hover .volume-slider {
  width: 80px;
  opacity: 1;
}

.time-display {
  color: white;
  font-size: 0.85rem;
  margin-left: 8px;
}

.speed-control {
  position: relative;
}

.speed-btn {
  font-size: 0.85rem;
  padding: 4px 10px;
}

.speed-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 8px;
  padding: 8px 0;
  margin-bottom: 8px;
  min-width: 80px;
}

.speed-menu div {
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  font-size: 0.85rem;
  text-align: center;
  transition: var(--transition);
}

.speed-menu div:hover {
  background: rgba(255, 255, 255, 0.1);
}

.speed-menu div.active {
  color: var(--primary);
}

.video-controls {
  padding: 16px 20px;
  background: var(--surface2);
}

.video-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.video-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: var(--text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.action-btn:hover {
  background: rgba(99, 102, 241, 0.2);
}

.action-btn.liked {
  background: rgba(236, 72, 153, 0.2);
  color: var(--secondary);
}

.action-btn.favorited {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.video-info-section {
  padding: 24px 0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--surface);
  border-radius: var(--radius);
  margin-bottom: 20px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.author-details h4 {
  font-weight: 600;
  margin-bottom: 4px;
}

.author-details p {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.author-avatar,
.author-details {
  cursor: pointer;
}

.author-info .btn {
  margin-left: auto;
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

.video-description {
  padding: 16px;
  background: var(--surface);
  border-radius: var(--radius);
  margin-bottom: 16px;
}

.video-description h3 {
  font-size: 1rem;
  margin-bottom: 12px;
}

.video-description p {
  color: var(--text-muted);
  line-height: 1.6;
}

.video-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 6px 12px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--primary);
}

.comments-section {
  padding: 24px 0;
}

.comments-section h3 {
  margin-bottom: 20px;
}

.comment-form {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-input-wrapper textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--surface2);
  border-radius: 12px;
  background: var(--bg);
  color: var(--text);
  resize: vertical;
  font-family: inherit;
}

.comment-input-wrapper textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.comment-avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.no-comments {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

.comment-content {
  flex: 1;
  padding: 12px;
  background: var(--surface);
  border-radius: var(--radius);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  font-size: 0.9rem;
}

.comment-time {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.comment-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.sidebar {
  width: 350px;
  flex-shrink: 0;
}

.sidebar h3 {
  margin-bottom: 16px;
}

.related-videos {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px;
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

@media (max-width: 1024px) {
  .main-container {
    flex-direction: column;
    padding: 24px 20px;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .related-videos {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
