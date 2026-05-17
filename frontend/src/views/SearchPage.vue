<template>
  <div class="page-container">
    <Navbar />
    
    <div class="container">
      <div class="search-header">
        <h1>搜索结果</h1>
        <p v-if="query">"{{ query }}" 的搜索结果</p>
      </div>

      <div class="search-bar">
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

      <div class="category-filter">
        <button 
          v-for="cat in categories" 
          :key="cat.value"
          :class="['filter-btn', { active: selectedCategory === cat.value }]"
          @click="selectCategory(cat.value)"
        >
          {{ cat.label }}
        </button>
      </div>

      <div v-if="videoStore.loading" class="loading">
        <div class="spinner"></div>
        <p>搜索中...</p>
      </div>
      
      <div v-else-if="videoStore.videos.length === 0" class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <h3>未找到相关视频</h3>
        <p>请尝试其他关键词</p>
      </div>
      
      <div v-else class="video-grid">
        <VideoCard v-for="video in videoStore.videos" :key="video.id" :video="video" />
      </div>

      <div v-if="videoStore.videos.length > 0" class="load-more">
        <button class="btn btn-secondary" @click="loadMore" :disabled="loadingMore">
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import VideoCard from '@/components/VideoCard.vue'
import { useVideoStore } from '@/stores/video'

const route = useRoute()
const router = useRouter()
const videoStore = useVideoStore()

const searchQuery = ref('')
const query = ref('')
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

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  query.value = searchQuery.value
  router.push({ path: '/search', query: { q: searchQuery.value, category: selectedCategory.value } })
  await performSearch()
}

const selectCategory = async (category) => {
  selectedCategory.value = category
  if (query.value) {
    router.push({ path: '/search', query: { q: query.value, category } })
    await performSearch()
  }
}

const performSearch = async () => {
  if (!query.value) return
  await videoStore.searchVideos(query.value, selectedCategory.value !== 'all' ? selectedCategory.value : '')
}

const loadMore = async () => {
  loadingMore.value = true
  const nextPage = videoStore.pagination.page + 1
  await videoStore.searchVideos(query.value, selectedCategory.value !== 'all' ? selectedCategory.value : '', nextPage)
  loadingMore.value = false
}

onMounted(async () => {
  if (route.query.q) {
    query.value = route.query.q
    searchQuery.value = route.query.q
  }
  if (route.query.category) {
    selectedCategory.value = route.query.category
  }
  if (query.value) {
    await performSearch()
  }
})
</script>

<style scoped>
.search-header {
  padding: 60px 0 30px;
  text-align: center;
}

.search-header h1 {
  font-size: 2.5rem;
  margin-bottom: 12px;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-header p {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.search-bar {
  display: flex;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto 32px;
}

.search-bar .form-input {
  flex: 1;
  padding: 14px 20px;
  border-radius: 24px;
}

.category-filter {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: 20px;
  background: var(--surface);
  color: var(--text-muted);
  font-weight: 500;
  transition: var(--transition);
  border: none;
}

.filter-btn:hover {
  background: var(--surface2);
  color: var(--text);
}

.filter-btn.active {
  background: var(--gradient);
  color: white;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding-bottom: 60px;
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

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--text);
  margin-bottom: 8px;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-bottom: 60px;
}
</style>
