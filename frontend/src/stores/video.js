import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useVideoStore = defineStore('video', () => {
  // State
  const videos = ref([])
  const currentVideo = ref(null)
  const loading = ref(false)
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref(null)
  
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Computed
  const hasMore = computed(() => pagination.value.page < pagination.value.totalPages)
  const videoCount = computed(() => videos.value.length)
  const currentCategory = ref('all')

  // Get all videos
  async function fetchVideos(params = {}) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.video.getList(params)
      
      if (response.success) {
        videos.value = response.videos || []
        pagination.value = response.pagination || {
          page: 1, limit: 20, total: 0, totalPages: 0
        }
        return videos.value
      }
      
      error.value = response.message || '获取视频列表失败'
      return []
    } catch (err) {
      error.value = err.message || '获取视频列表失败'
      console.error('Failed to fetch videos:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Load more videos (pagination)
  async function loadMoreVideos(params = {}) {
    if (!hasMore.value || loading.value) return []
    
    loading.value = true
    try {
      const nextPage = pagination.value.page + 1
      const response = await api.video.getList({
        ...params,
        page: nextPage
      })
      
      if (response.success) {
        videos.value = [...videos.value, ...(response.videos || [])]
        pagination.value = response.pagination
        return response.videos
      }
      
      return []
    } catch (err) {
      console.error('Failed to load more videos:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Get single video
  async function fetchVideo(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.video.getDetail(id)
      
      if (response.success) {
        currentVideo.value = response.video
        return response.video
      }
      
      error.value = response.message || '获取视频详情失败'
      return null
    } catch (err) {
      error.value = err.message || '获取视频详情失败'
      console.error('Failed to fetch video:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Search videos
  async function searchVideos(query, category = '') {
    loading.value = true
    error.value = null
    currentCategory.value = category || 'all'
    
    try {
      const response = await api.video.search({
        q: query,
        category: category || undefined
      })
      
      if (response.success) {
        videos.value = response.videos || []
        pagination.value = response.pagination || {
          page: 1, limit: 20, total: 0, totalPages: 0
        }
        return videos.value
      }
      
      error.value = response.message || '搜索失败'
      return []
    } catch (err) {
      error.value = err.message || '搜索失败'
      console.error('Failed to search videos:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Upload video
  async function uploadVideo(formData) {
    uploading.value = true
    uploadProgress.value = 0
    error.value = null
    
    try {
      const response = await api.video.upload(formData, (percent) => {
        uploadProgress.value = percent
      })
      
      if (response.success) {
        // Add new video to the beginning of the list
        videos.value.unshift(response.video)
        return { success: true, video: response.video }
      }
      
      error.value = response.message || '上传失败'
      return { success: false, message: response.message || '上传失败' }
    } catch (err) {
      error.value = err.message || '上传失败'
      console.error('Failed to upload video:', err)
      return { success: false, message: err.message || '上传失败' }
    } finally {
      uploading.value = false
      uploadProgress.value = 0
    }
  }

  // Delete video
  async function deleteVideo(id) {
    try {
      const response = await api.video.delete(id)
      
      if (response.success) {
        videos.value = videos.value.filter(v => v.id !== id)
        return { success: true }
      }
      
      return { success: false, message: response.message || '删除失败' }
    } catch (err) {
      return { success: false, message: err.message || '删除失败' }
    }
  }

  // Filter by category
  async function filterByCategory(category) {
    currentCategory.value = category
    return fetchVideos({ category: category === 'all' ? undefined : category })
  }

  // Clear videos
  function clearVideos() {
    videos.value = []
    pagination.value = { page: 1, limit: 20, total: 0, totalPages: 0 }
    currentVideo.value = null
    error.value = null
  }

  // Format view count
  function formatViews(views) {
    if (!views) return '0'
    if (views >= 100000000) {
      return (views / 100000000).toFixed(1) + '亿'
    } else if (views >= 10000) {
      return (views / 10000).toFixed(1) + '万'
    }
    return views.toLocaleString()
  }

  // Format duration
  function formatDuration(duration) {
    if (!duration) return '0:00'
    return duration
  }

  return {
    // State
    videos,
    currentVideo,
    loading,
    uploading,
    uploadProgress,
    error,
    pagination,
    currentCategory,
    
    // Computed
    hasMore,
    videoCount,
    
    // Actions
    fetchVideos,
    loadMoreVideos,
    fetchVideo,
    searchVideos,
    uploadVideo,
    deleteVideo,
    filterByCategory,
    clearVideos,
    formatViews,
    formatDuration
  }
})
