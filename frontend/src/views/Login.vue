<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="login-left-content">
          <div class="brand">
            <div class="brand-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span class="brand-name">异世界</span>
          </div>
          <h2>欢迎回来</h2>
          <p>登录您的账户，继续探索精彩的视频世界。我们为您准备了海量优质内容，等待您的发现。</p>
          <div class="features">
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <span>海量高清视频资源</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span>个性化推荐系统</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span>与好友分享精彩内容</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-header">
          <h1>登录账户</h1>
          <p>还没有账户？<router-link to="/register">立即注册</router-link></p>
        </div>
        
        <div v-if="message.text" :class="['message', message.type]">
          {{ message.text }}
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">
              邮箱地址
              <span class="case-sensitive-hint">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                大小写敏感
              </span>
            </label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input v-model="form.email" type="email" class="form-input with-icon" placeholder="请输入您的邮箱" required>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              密码
              <span class="case-sensitive-hint">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                大小写敏感
              </span>
            </label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input 
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'" 
                class="form-input with-icon" 
                placeholder="请输入您的密码"
                @input="checkPasswordStrength(form.password)"
                required>
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <!-- 密码强度指示器 -->
            <div v-if="passwordStrength.level > 0" class="password-strength">
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :style="{ width: (passwordStrength.level * 33.33) + '%', backgroundColor: passwordStrength.color }"
                ></div>
              </div>
              <span class="strength-text" :style="{ color: passwordStrength.color }">
                密码强度: {{ passwordStrength.text }}
              </span>
            </div>
          </div>
          
          <div class="form-options">
            <label class="remember-me">
              <input v-model="form.remember" type="checkbox">
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>
          
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { useUserStore } from '../stores/user'
import { hashPassword } from '../utils/crypto'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  email: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const loading = ref(false)
const message = ref({ text: '', type: '' })
const passwordVisible = ref(false)

// 密码强度提示
const passwordStrength = ref({ level: 0, text: '', color: '' })

// 实时检查密码强度
const checkPasswordStrength = (password) => {
  if (!password) {
    passwordStrength.value = { level: 0, text: '', color: '' }
    return
  }
  
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  if (score <= 2) {
    passwordStrength.value = { level: 1, text: '弱', color: '#ef4444' }
  } else if (score <= 4) {
    passwordStrength.value = { level: 2, text: '中等', color: '#f59e0b' }
  } else {
    passwordStrength.value = { level: 3, text: '强', color: '#22c55e' }
  }
}

const handleLogin = async () => {
  loading.value = true
  message.value = { text: '', type: '' }
  
  try {
    // 对密码进行加密
    const hashedPassword = await hashPassword(form.value.password)
    
    const response = await api.login({
      email: form.value.email,
      password: hashedPassword
    })
    
    // 设置用户数据
    userStore.setUser(response.user, response.token)
    
    // 跳转到首页
    router.push('/')
  } catch (error) {
    message.value = {
      text: error.message || '登录失败，请检查您的账号和密码',
      type: 'error'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  background: var(--surface);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2)),
              url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80') center/cover;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px;
  position: relative;
}

.login-left::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(15, 15, 35, 0.7);
}

.login-left-content {
  position: relative;
  z-index: 1;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  background: var(--gradient);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-size: 1.8rem;
  font-weight: 700;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-left h2 {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.login-left p {
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1.8;
}

.features {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.login-right {
  flex: 1;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.login-header p {
  color: var(--text-muted);
}

.login-header a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.login-header a:hover {
  text-decoration: underline;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-muted);
}

.remember-me input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
}

.forgot-password {
  color: var(--primary);
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* 大小写敏感提示 */
.case-sensitive-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-left: 8px;
  font-weight: normal;
}

.case-sensitive-hint svg {
  opacity: 0.7;
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--surface2);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.password-toggle:hover {
  color: var(--text);
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    display: none;
  }
  
  .login-right {
    padding: 32px 24px;
  }
}
</style>
