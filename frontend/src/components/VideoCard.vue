<template>
  <div class="video-card" @click="goToVideo" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="video-thumbnail">
      <!-- 占位图 -->
      <div class="thumbnail-placeholder skeleton-shimmer" v-if="!imageLoaded"></div>
      
      <!-- 懒加载图片 -->
      <img 
        ref="thumbnailRef"
        :src="isVisible ? (video.thumbnail_url || defaultThumbnail) : ''" 
        :alt="video.title"
        @load="onImageLoad"
        @error="onImageError"
        :class="{ 'is-loaded': imageLoaded }"
      />
      
      <!-- 时长标签 -->
      <span class="video-duration">{{ video.duration || '00:00' }}</span>
      
      <!-- 播放按钮悬浮层 -->
      <div class="video-play-overlay" :class="{ 'is-visible': isHovered }">
        <div class="video-play-btn">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      
      <!-- 质量标签 -->
      <span v-if="video.quality" class="video-quality">{{ video.quality }}</span>
    </div>
    <div class="video-info">
      <h3 class="video-title">{{ video.title }}</h3>
      <div class="video-meta">
        <div class="video-author">
          <div class="video-author-avatar">
            {{ getInitial(video.uploader_name || video.uploader_nickname || 'U') }}
          </div>
          <span>{{ video.uploader_nickname || video.uploader_name || '未知用户' }}</span>
        </div>
        <div class="video-stats">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          {{ formatViews(video.views || 0) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  video: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['tag-click', 'favorite', 'like', 'share'])

const router = useRouter()
const thumbnailRef = ref(null)
const isHovered = ref(false)
const imageLoaded = ref(false)
const isVisible = ref(false)

const defaultThumbnail = 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80'

// 计算属性
const uploaderName = computed(() => {
  return props.video.uploader_nickname || props.video.uploader_name || '未知用户'
})

const videoTags = computed(() => {
  if (!props.video.tags) return []
  if (Array.isArray(props.video.tags)) return props.video.tags
  try {
    return JSON.parse(props.video.tags)
  } catch {
    return []
  }
})

// 生成随机渐变作为默认头像背景
const avatarStyle = computed(() => {
  const hue = (props.video.id * 37) % 360
  return {
    background: `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 40) % 360}, 70%, 60%))`
  }
})

// 懒加载监听
let observer = null

onMounted(() => {
  if (thumbnailRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            observer?.disconnect()
          }
        })
      },
      { rootMargin: '100px' }
    )
    observer.observe(thumbnailRef.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})

// 监听图片加载
const onImageLoad = () => {
  imageLoaded.value = true
}

const onImageError = () => {
  imageLoaded.value = true
}

// 方法
const getInitial = (name) => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}

const formatViews = (views) => {
  if (!views) return '0'
  if (views >= 100000000) {
    return (views / 100000000).toFixed(1) + '亿'
  } else if (views >= 10000) {
    return (views / 10000).toFixed(1) + '万'
  }
  return views.toLocaleString()
}

const goToVideo = () => {
  router.push(`/video/${props.video.id}`)
}

const goToUser = (e) => {
  e.stopPropagation()
  if (props.video.user_id) {
    router.push(`/user/${props.video.user_id}`)
  }
}
</script>

<style scoped>
.video-card {
  background: var(--surface);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
}

.video-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.video-thumbnail {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--surface2);
}

/* 占位图 */
.thumbnail-placeholder {
  position: absolute;
  inset: 0;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--surface) 25%,
    var(--surface2) 50%,
    var(--surface) 75%
  );
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.video-thumbnail img.is-loaded {
  opacity: 1;
}

.video-card:hover .video-thumbnail img.is-loaded {
  transform: scale(1.05);
}

/* 时长标签 */
.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  backdrop-filter: blur(4px);
}

/* 质量标签 */
.video-quality {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--primary);
  backdrop-filter: blur(4px);
}

/* 播放按钮悬浮层 */
.video-play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.video-play-overlay.is-visible {
  opacity: 1;
}

.video-play-btn {
  width: 56px;
  height: 56px;
  background: var(--gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.8);
  transition: transform 0.2s ease;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.video-play-overlay.is-visible .video-play-btn {
  transform: scale(1);
}

.video-play-btn svg {
  fill: white;
  margin-left: 4px;
}

/* 视频信息 */
.video-info {
  padding: 12px;
}

.video-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  color: var(--text);
}

.video-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.video-author {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;
}

.video-author:hover {
  color: var(--primary);
}

.video-author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
}

.author-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.views-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.likes-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--secondary);
}

/* 标签 */
.video-tags {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.video-tag {
  padding: 2px 8px;
  background: var(--surface2);
  border-radius: 12px;
  font-size: 0.7rem;
  color: var(--text-muted);
  transition: all 0.2s;
}

.video-tag:hover {
  background: var(--primary);
  color: white;
}
</style>
