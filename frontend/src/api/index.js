import axios from 'axios'
import API_BASE from '@/config/api'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 启用跨域请求携带 cookies
  withCredentials: false
})

// 请求重试配置
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    // 添加 token
    const token = localStorage.getItem('streamvibe_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求 ID 方便追踪
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return config
  },
  error => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 统一处理成功响应
    if (response.data && response.data.success === false) {
      return Promise.reject(response.data)
    }
    return response.data
  },
  async error => {
    const originalRequest = error.config
    
    // 处理 401 未授权
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      // 清除本地存储
      localStorage.removeItem('streamvibe_token')
      localStorage.removeItem('streamvibe_user')
      
      // 提示用户登录
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      
      return Promise.reject(error)
    }
    
    // 处理 403 禁止访问
    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden', { 
        detail: { message: error.response.data?.message || '权限不足' }
      }))
    }
    
    // 处理网络错误
    if (!error.response) {
      const networkError = {
        success: false,
        message: '网络连接失败，请检查您的网络',
        code: 'NETWORK_ERROR'
      }
      return Promise.reject(networkError)
    }
    
    // 处理服务器错误
    if (error.response?.status >= 500) {
      const serverError = {
        success: false,
        message: '服务器开小差了，请稍后再试',
        code: 'SERVER_ERROR',
        status: error.response.status
      }
      return Promise.reject(serverError)
    }
    
    // 返回业务错误
    return Promise.reject(error.response?.data || error)
  }
)

// 封装请求方法
const request = {
  get: (url, params = {}, config = {}) => {
    return api.get(url, { params, ...config })
  },
  
  post: (url, data = {}, config = {}) => {
    return api.post(url, data, config)
  },
  
  put: (url, data = {}, config = {}) => {
    return api.put(url, data, config)
  },
  
  delete: (url, params = {}, config = {}) => {
    return api.delete(url, { params, ...config })
  },
  
  // 文件上传
  upload: (url, formData, onProgress = null) => {
    return api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent, progressEvent)
      } : undefined
    })
  }
}

export default {
  // 认证相关
  auth: {
    login: (data) => request.post('/auth/login', data),
    register: (data) => request.post('/auth/register', data),
    logout: () => request.post('/auth/logout'),
    refreshToken: () => request.post('/auth/refresh')
  },
  
  // 用户相关
  user: {
    getProfile: (id) => request.get(`/users/${id}`),
    updateProfile: (id, data) => request.put(`/users/${id}`, data),
    getCurrentUser: () => request.get('/user/me'),
    getSubscribers: (id) => request.get(`/users/${id}/subscribers`)
  },
  
  // 视频相关
  video: {
    getList: (params) => request.get('/videos', params),
    getDetail: (id) => request.get(`/videos/${id}`),
    upload: (formData, onProgress) => request.upload('/videos', formData, onProgress),
    uploadJson: (data) => request.post('/videos/json', data),
    delete: (id) => request.delete(`/videos/${id}`),
    search: (params) => request.get('/search', params),
    
    // 评论
    getComments: (id, params) => request.get(`/videos/${id}/comments`, params),
    addComment: (id, data) => request.post(`/videos/${id}/comments`, data),
    deleteComment: (videoId, commentId) => request.delete(`/videos/${videoId}/comments/${commentId}`)
  },
  
  // 收藏相关
  favorites: {
    getList: (params) => request.get('/favorites', params),
    check: (userId, videoId) => request.get('/favorites/check', { user_id: userId, video_id: videoId }),
    add: (data) => request.post('/favorites', data),
    remove: (params) => request.delete('/favorites', params)
  },
  
  // 点赞相关
  likes: {
    getList: (params) => request.get('/likes', params),
    check: (userId, videoId) => request.get('/likes/check', { user_id: userId, video_id: videoId }),
    add: (data) => request.post('/likes', data),
    remove: (params) => request.delete('/likes', params),
    getCount: (videoId) => request.get('/likes/count', { video_id: videoId })
  },
  
  // 订阅相关
  subscriptions: {
    getList: (params) => request.get('/subscriptions', params),
    check: (subscriberId, channelId) => request.get('/subscriptions/check', { subscriber_id: subscriberId, channel_id: channelId }),
    add: (data) => request.post('/subscriptions', data),
    remove: (params) => request.delete('/subscriptions', params)
  },
  
  // AI 相关
  ai: {
    getStatus: () => request.get('/ai/status'),
    setToken: (token) => request.post('/ai/set-token', { token }),
    createVideo: (data) => request.post('/ai/video', data),
    createImage: (data) => request.post('/ai/image', data),
    getJobStatus: (jobId) => request.get(`/ai/status/${jobId}`),
    getJobs: (params) => request.get('/ai/jobs', params)
  },
  
  // 管理后台
  admin: {
    getStats: () => request.get('/admin/stats'),
    getUsers: () => request.get('/admin/users'),
    updateUserRole: (id, role) => request.put(`/admin/users/${id}/role`, { role }),
    deleteUser: (id) => request.delete(`/admin/users/${id}`),
    getVideos: () => request.get('/admin/videos'),
    updateVideo: (id, data) => request.put(`/admin/videos/${id}`, data),
    deleteVideo: (id) => request.delete(`/admin/videos/${id}`),
    getComments: () => request.get('/admin/comments'),
    deleteComment: (id) => request.delete(`/admin/comments/${id}`),
    resetAdmin: () => request.post('/admin/reset')
  },
  
  // 直接暴露 request 方法用于特殊请求
  request
}
