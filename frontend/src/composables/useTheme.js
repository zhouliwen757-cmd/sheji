import { ref, watch, onMounted } from 'vue'

const THEME_KEY = 'streamvibe_theme'

// 全局主题状态
const theme = ref('dark')
const isInitialized = ref(false)

export function useTheme() {
  // 初始化主题
  const initTheme = () => {
    if (isInitialized.value) return
    
    // 从 localStorage 读取保存的主题
    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme && ['dark', 'light'].includes(savedTheme)) {
      theme.value = savedTheme
    } else {
      // 检测系统偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'dark' // 默认深色主题
    }
    
    applyTheme()
    isInitialized.value = true
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        theme.value = e.matches ? 'dark' : 'light'
        applyTheme()
      }
    })
  }

  // 应用主题到 document
  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', theme.value)
    document.documentElement.classList.remove('theme-dark', 'theme-light')
    document.documentElement.classList.add(`theme-${theme.value}`)
  }

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem(THEME_KEY, theme.value)
    applyTheme()
  }

  // 设置特定主题
  const setTheme = (newTheme) => {
    if (['dark', 'light'].includes(newTheme)) {
      theme.value = newTheme
      localStorage.setItem(THEME_KEY, theme.value)
      applyTheme()
    }
  }

  // 是否为深色主题
  const isDark = () => theme.value === 'dark'

  return {
    theme,
    isDark,
    initTheme,
    toggleTheme,
    setTheme
  }
}
