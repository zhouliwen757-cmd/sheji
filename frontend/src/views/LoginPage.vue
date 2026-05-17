<template>
  <div class="page-container login-page">
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
        
        <div v-if="message" :class="['message', messageType]">{{ message }}</div>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label" for="email">
              账号
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
              <input type="text" id="email" v-model="formData.email" class="form-input" placeholder="请输入账号" required>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="password">
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
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="formData.password" 
                class="form-input" 
                placeholder="请输入您的密码"
                @input="checkPasswordStrength(formData.password)"
                required>
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
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
              <input type="checkbox" v-model="formData.remember">
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>
          
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
        
        <div class="social-login">
          <div class="divider">或</div>
          <div class="social-buttons">
            <button class="social-btn">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
            <button class="social-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formData = ref({
  email: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const loading = ref(false)
const message = ref('')
const messageType = ref('')

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
  message.value = ''
  loading.value = true
  
  const result = await authStore.login(formData.value.email, formData.value.password)
  
  if (result.success) {
    messageType.value = 'success'
    message.value = '登录成功！正在跳转...'
    const redirect = route.query.redirect || '/'
    setTimeout(() => {
      router.push(redirect)
    }, 1000)
  } else {
    messageType.value = 'error'
    message.value = result.message
  }
  
  loading.value = false
}

onMounted(() => {
  // If already logged in, redirect
  if (authStore.isLoggedIn) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }
})
</script>

<style scoped>
.login-page {
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
  background-clip: text;
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

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid var(--surface2);
  border-radius: 12px;
  background: var(--bg);
  color: var(--text);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
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

.btn-primary {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-login {
  margin-top: 32px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--surface2);
}

.social-buttons {
  display: flex;
  gap: 12px;
}

.social-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--surface2);
  border-radius: 12px;
  background: transparent;
  color: var(--text);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.social-btn span {
  font-size: 0.85rem;
}

.social-btn:hover {
  background: var(--surface2);
  border-color: var(--primary);
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
