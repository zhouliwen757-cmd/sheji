import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Storage keys
  const TOKEN_KEY = 'streamvibe_token'
  const USER_KEY = 'streamvibe_user'

  // Initialize from localStorage
  function initAuth() {
    const savedUser = localStorage.getItem(USER_KEY)
    const savedToken = localStorage.getItem(TOKEN_KEY)
    
    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
        token.value = savedToken
      } catch (e) {
        console.error('Failed to parse stored auth data:', e)
        clearAuth()
      }
    }
    
    // Listen for unauthorized events
    window.addEventListener('auth:unauthorized', handleUnauthorized)
  }

  // Handle unauthorized access
  function handleUnauthorized() {
    clearAuth()
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
  }

  // Computed
  const isLoggedIn = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN' || user.value?.role === 'admin')
  const userId = computed(() => user.value?.id)
  const userName = computed(() => user.value?.username || user.value?.nickname || '用户')
  const userAvatar = computed(() => user.value?.avatar_url)

  // Login
  async function login(email, password) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.auth.login({ email, password })
      
      if (response.success) {
        user.value = response.user
        token.value = response.token
        
        // Save to localStorage
        localStorage.setItem(USER_KEY, JSON.stringify(response.user))
        if (response.token) {
          localStorage.setItem(TOKEN_KEY, response.token)
        }
        
        return { success: true, message: response.message || '登录成功' }
      }
      
      return { success: false, message: response.message || '登录失败' }
    } catch (err) {
      error.value = err.message || '登录失败'
      return { success: false, message: err.message || '登录失败' }
    } finally {
      loading.value = false
    }
  }

  // Register
  async function register(userData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.auth.register(userData)
      
      if (response.success) {
        return { success: true, message: response.message || '注册成功' }
      }
      
      return { success: false, message: response.message || '注册失败' }
    } catch (err) {
      error.value = err.message || '注册失败'
      return { success: false, message: err.message || '注册失败' }
    } finally {
      loading.value = false
    }
  }

  // Logout
  function logout() {
    clearAuth()
    router.push('/')
  }

  // Clear auth data
  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  // Get user initial
  function getUserInitial() {
    if (!user.value) return 'U'
    const name = user.value.username || user.value.nickname || 'U'
    return name.charAt(0).toUpperCase()
  }

  // Get user display name
  function getUserName() {
    if (!user.value) return '访客'
    return user.value.username || user.value.nickname || '用户'
  }

  // Update user profile
  async function updateProfile(data) {
    if (!user.value?.id) return { success: false, message: '未登录' }
    
    loading.value = true
    try {
      const response = await api.user.updateProfile(user.value.id, data)
      
      if (response.success) {
        user.value = { ...user.value, ...response.user }
        localStorage.setItem(USER_KEY, JSON.stringify(user.value))
        return { success: true, message: '更新成功' }
      }
      
      return { success: false, message: response.message || '更新失败' }
    } catch (err) {
      return { success: false, message: err.message || '更新失败' }
    } finally {
      loading.value = false
    }
  }

  // Check if user is logged in (for guards)
  function checkAuth() {
    return !!token.value
  }

  // Cleanup on unmount
  function cleanup() {
    window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }

  // Initialize on store creation
  initAuth()

  return {
    // State
    user,
    token,
    loading,
    error,
    
    // Computed
    isLoggedIn,
    isAdmin,
    userId,
    userName,
    userAvatar,
    
    // Actions
    login,
    logout,
    register,
    initAuth,
    updateProfile,
    getUserInitial,
    getUserName,
    checkAuth,
    clearAuth,
    cleanup
  }
})
