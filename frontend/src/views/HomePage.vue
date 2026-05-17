<template>
  <div class="page-container">
    
    <div class="container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>发现精彩视频</h1>
          <p>探索海量高清视频内容，发现属于你的精彩世界</p>
          <div class="hero-search">
            <input 
              type="text" 
              v-model="searchQuery" 
              @keyup.enter="handleSearch"
              placeholder="搜索视频..."
              class="form-input"
            >
            <button class="btn btn-primary" @click="handleSearch">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              搜索
            </button>
          </div>
        </div>
      </section>

      <!-- Categories -->
      <section class="categories-section">
        <div class="category-tabs">
          <button 
            v-for="cat in categories" 
            :key="cat.value"
            :class="['category-tab', { active: selectedCategory === cat.value }]"
            @click="selectCategory(cat.value)"
          >
            {{ cat.label }}
          </button>
        </div>
      </section>

      <!-- Video Grid -->
      <section class="videos-section">
        <h2 class="section-title">推荐视频</h2>
        
        <div v-if="videoStore.loading" class="loading">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="videoStore.videos.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/>
            <line x1="17" y1="2" x2="17" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="2" y1="7" x2="7" y2="7"/>
            <line x1="2" y1="17" x2="7" y2="17"/>
            <line x1="17" y1="17" x2="22" y2="17"/>
            <line x1="17" y1="7" x2="22" y2="7"/>
          </svg>
          <p>暂无视频</p>
        </div>
        
        <div v-else class="video-grid">
          <VideoCard v-for="video in videoStore.videos" :key="video.id" :video="video" />
        </div>

        <!-- Load More -->
        <div v-if="videoStore.videos.length > 0" class="load-more">
          <button class="btn btn-secondary" @click="loadMore" :disabled="loadingMore">
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import VideoCard from '@/components/VideoCard.vue'
import { useVideoStore } from '@/stores/video'

const router = useRouter()
const route = useRoute()
const videoStore = useVideoStore()

const searchQuery = ref('')
const selectedCategory = ref('all')
const loadingMore = ref(false)

const categories = [
  { label: '全部', value: 'all' },
  { label: '电影', value: 'movie' },
  { label: '动漫', value: 'anime' },
  { label: '剧集', value: 'drama' },
  { label: '综艺', value: 'variety' },
  { label: '音乐', value: 'music' },
  { label: '纪录片', value: 'documentary' },
  { label: '体育', value: 'sports' }
]

const fetchVideos = async () => {
  const params = {}
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  await videoStore.fetchVideos(params)
}

const selectCategory = (category) => {
  selectedCategory.value = category
  // 更新 URL 参数但不跳转
  if (category === 'all') {
    router.replace({ path: '/', query: {} })
  } else {
    router.replace({ path: '/', query: { category } })
  }
  fetchVideos()
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
  }
}

const loadMore = async () => {
  loadingMore.value = true
  const nextPage = videoStore.pagination.page + 1
  await videoStore.fetchVideos({ 
    page: nextPage,
    category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined
  })
  loadingMore.value = false
}

// 初始化时读取 URL 参数
const initFromQuery = () => {
  const categoryParam = route.query.category
  if (categoryParam && typeof categoryParam === 'string') {
    selectedCategory.value = categoryParam
  }
}

onMounted(() => {
  initFromQuery()
  fetchVideos()
})

// 监听路由变化
watch(() => route.query.category, (newCategory) => {
  if (newCategory && typeof newCategory === 'string') {
    selectedCategory.value = newCategory
    fetchVideos()
  } else if (!newCategory) {
    selectedCategory.value = 'all'
    fetchVideos()
  }
})
</script>

<style scoped>
.hero-section {
  padding: 60px 0;
  text-align: center;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 16px;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-content p {
  font-size: 1.2rem;
  color: var(--text-muted);
  margin-bottom: 32px;
}

.hero-search {
  display: flex;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.hero-search .form-input {
  flex: 1;
  padding: 14px 20px;
  border-radius: 24px;
}

.categories-section {
  margin-bottom: 32px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-tab {
  padding: 10px 20px;
  border-radius: 20px;
  background: var(--surface);
  color: var(--text-muted);
  font-weight: 500;
  transition: var(--transition);
  border: none;
}

.category-tab:hover {
  background: var(--surface2);
  color: var(--text);
}

.category-tab.active {
  background: var(--gradient);
  color: white;
}

.videos-section {
  padding-bottom: 60px;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 24px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.loading, .empty-state {
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

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
</style>
