<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <router-link to="/" class="nav-brand">
      <div class="nav-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <span>异世界</span>
    </router-link>
    
    <ul class="nav-links">
      <li>
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          首页
        </router-link>
      </li>
      <li>
        <router-link to="/category" class="nav-link" :class="{ active: $route.path === '/category' }">
          分类
        </router-link>
      </li>
      <li>
        <router-link to="/favorites" class="nav-link" :class="{ active: $route.path === '/favorites' }">
          我的收藏
        </router-link>
      </li>
      <li>
        <router-link to="/ai-create" class="nav-link ai-link" :class="{ active: $route.path === '/ai-create' }">
          <span class="ai-icon">✨</span>
          AI 创作
        </router-link>
      </li>
    </ul>
    
    <div class="nav-actions">
      <!-- 主题切换 -->
      <button class="theme-toggle" @click="handleToggleTheme" :title="isDark() ? '切换到浅色模式' : '切换到深色模式'">
        <!-- 太阳图标 (浅色模式) -->
        <svg v-if="isDark()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <!-- 月亮图标 (深色模式) -->
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
      
      <!-- 搜索栏 -->
      <div class="nav-search">
        <input 
          type="text" 
          v-model="searchQuery" 
          @keyup.enter="handleSearch"
          placeholder="搜索视频..."
          class="nav-search-input"
        >
        <button class="nav-search-btn" @click="handleSearch">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>
      
      <router-link to="/upload" class="upload-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>上传</span>
      </router-link>
      
      <div class="avatar-dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
        <div style="display: flex; align-items: center;">
          <div class="user-avatar">
            {{ getUserInitial() }}
          </div>
          <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
        
        <div class="dropdown-menu" :class="{ active: showDropdown }">
          <!-- Guest Dropdown -->
          <div v-if="!isLoggedIn">
            <div class="dropdown-login-section">
              <button class="dropdown-login-btn" @click="goToLogin">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                登录 / Sign In
              </button>
              <p class="dropdown-register-hint">
                还没有账号？<router-link to="/register">立即注册</router-link>
              </p>
            </div>
            <div class="dropdown-body">
              <div class="dropdown-item" @click="goToProfile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                个人中心
              </div>
              <div class="dropdown-item" @click="goToFavorites">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                我的收藏
              </div>
            </div>
          </div>
          
          <!-- User Dropdown -->
          <div v-else-if="isLoggedIn">
            <div class="dropdown-header">
              <div class="dropdown-user-info">
                <div class="dropdown-avatar">
                  {{ getUserInitial() }}
                </div>
                <div class="dropdown-user-details">
                  <div class="dropdown-username">{{ getUserName() }}</div>
                  <div class="dropdown-user-email">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>{{ authStore.user?.email || '' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="dropdown-body">
              <div class="dropdown-item" @click="goToProfile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                个人中心
              </div>
              <div class="dropdown-item" @click="goToFavorites">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                我的收藏
              </div>
              <!-- Admin Link -->
              <div v-if="isAdmin" class="dropdown-item admin-item" @click="goToAdmin">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                管理后台
              </div>
            </div>
            <div class="dropdown-footer">
              <button class="dropdown-logout" @click="handleLogout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const authStore = useAuthStore()
const { theme, isDark, toggleTheme, initTheme } = useTheme()

const showDropdown = ref(false)
const isScrolled = ref(false)
const searchQuery = ref('')

const isLoggedIn = computed(() => authStore.isLoggedIn)

const isAdmin = computed(() => {
  return authStore.user?.role === 'ADMIN'
})

const getUserInitial = () => {
  return authStore.getUserInitial()
}

const getUserName = () => {
  return authStore.getUserName()
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
  }
}

const goToAdmin = () => {
  router.push('/admin')
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const goToLogin = () => {
  router.push('/login')
}

const goToProfile = () => {
  if (isLoggedIn.value) {
    router.push('/profile')
  } else {
    router.push('/login?redirect=profile')
  }
}

const goToFavorites = () => {
  if (isLoggedIn.value) {
    router.push('/favorites')
  } else {
    router.push('/login?redirect=favorites')
  }
}

const handleLogout = () => {
  authStore.logout()
  showDropdown.value = false
  router.push('/')
}

const handleToggleTheme = () => {
  toggleTheme()
}

onMounted(() => {
  initTheme()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
