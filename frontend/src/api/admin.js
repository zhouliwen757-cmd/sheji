import axios from 'axios'
import API_BASE from '@/config/api'

// 创建带认证的 axios 实例
const authAxios = axios.create({
  baseURL: API_BASE
})

// 请求拦截器 - 自动添加 token
authAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ========== User Management ==========
export const getAllUsers = async () => {
  const response = await authAxios.get('/admin/users')
  return response.data
}

export const updateUserRole = async (userId, role) => {
  const response = await authAxios.put(`/admin/users/${userId}/role`, { role })
  return response.data
}

export const toggleUserStatus = async (userId, disabled) => {
  const response = await authAxios.put(`/admin/users/${userId}/status`, { disabled })
  return response.data
}

export const deleteUser = async (userId) => {
  const response = await authAxios.delete(`/admin/users/${userId}`)
  return response.data
}

// ========== Video Management ==========
export const getAllVideos = async () => {
  const response = await authAxios.get('/admin/videos')
  return response.data
}

export const updateVideo = async (videoId, data) => {
  const response = await authAxios.put(`/admin/videos/${videoId}`, data)
  return response.data
}

export const deleteVideo = async (videoId) => {
  const response = await authAxios.delete(`/admin/videos/${videoId}`)
  return response.data
}

// ========== Comment Management ==========
export const getAllComments = async () => {
  const response = await authAxios.get('/admin/comments')
  return response.data
}

export const deleteComment = async (commentId) => {
  const response = await authAxios.delete(`/admin/comments/${commentId}`)
  return response.data
}

// ========== Dashboard ==========
export const getAdminStats = async () => {
  const response = await authAxios.get('/admin/stats')
  return response.data
}
