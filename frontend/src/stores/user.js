import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useUserStore = defineStore('user', () => {
  // State
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Fetch user profile
  async function fetchProfile(userId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.user.getProfile(userId)
      
      if (response.success) {
        profile.value = response.user
        return response.user
      }
      
      error.value = response.message || '获取用户信息失败'
      return null
    } catch (err) {
      error.value = err.message || '获取用户信息失败'
      console.error('Failed to fetch profile:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update profile
  async function updateProfile(userId, data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.user.updateProfile(userId, data)
      
      if (response.success) {
        profile.value = { ...profile.value, ...response.user }
        return { success: true, message: '更新成功' }
      }
      
      error.value = response.message || '更新失败'
      return { success: false, message: response.message || '更新失败' }
    } catch (err) {
      error.value = err.message || '更新失败'
      return { success: false, message: err.message || '更新失败' }
    } finally {
      loading.value = false
    }
  }

  // Get subscriber count
  async function getSubscriberCount(userId) {
    try {
      const response = await api.user.getSubscribers(userId)
      return response.count || 0
    } catch (err) {
      console.error('Failed to get subscriber count:', err)
      return 0
    }
  }

  // Clear profile
  function clearProfile() {
    profile.value = null
    error.value = null
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    getSubscriberCount,
    clearProfile
  }
})
