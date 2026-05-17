<template>
  <div class="page-container register-page">
    <div class="register-container">
      <div class="register-left">
        <div class="register-left-content">
          <div class="brand">
            <div class="brand-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span class="brand-name">异世界</span>
          </div>
          <h2>加入我们</h2>
          <p>创建一个账户，开启您的视频之旅。海量精彩内容，等您来发现。</p>
          <div class="features">
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <span>免费注册，即刻体验</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span>上传和分享您的视频</span>
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
              <span>关注喜欢的创作者</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="register-right">
        <div class="register-header">
          <h1>创建账户</h1>
          <p>已有账户？<router-link to="/login">立即登录</router-link></p>
        </div>
        
        <div v-if="message" :class="['message', messageType]">{{ message }}</div>
        
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label class="form-label" for="username">用户名</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input type="text" id="username" v-model="formData.username" class="form-input" placeholder="请输入用户名" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="nickname">昵称</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input type="text" id="nickname" v-model="formData.nickname" class="form-input" placeholder="请输入昵称（可选）">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="email">邮箱</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input type="email" id="email" v-model="formData.email" class="form-input" placeholder="请输入邮箱" required>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="password">密码</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input :type="showPassword ? 'text' : 'password'" id="password" v-model="formData.password" class="form-input" placeholder="请输入密码（至少8位）" required minlength="8">
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="phone">手机号</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
              <input type="tel" id="phone" v-model="formData.phone" class="form-input" placeholder="请输入手机号（可选）">
            </div>
          </div>
          
          <div class="form-terms">
            <label>
              <input type="checkbox" v-model="formData.acceptTerms" required>
              <span>我已阅读并同意<a href="#">服务条款</a>和<a href="#">隐私政策</a></span>
            </label>
          </div>
          
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  username: '',
  nickname: '',
  email: '',
  password: '',
  phone: '',
  acceptTerms: false
})

const showPassword = ref(false)
const loading = ref(false)
const message = ref('')
const messageType = ref('')

const handleRegister = async () => {
  message.value = ''
  
  if (!formData.value.acceptTerms) {
    messageType.value = 'error'
    message.value = '请阅读并同意服务条款和隐私政策'
    return
  }
  
  loading.value = true
  
  const result = await authStore.register({
    username: formData.value.username,
    nickname: formData.value.nickname,
    email: formData.value.email,
    password: formData.value.password,
    phone: formData.value.phone
  })
  
  if (result.success) {
    messageType.value = 'success'
    message.value = '注册成功！正在跳转...'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } else {
    messageType.value = 'error'
    message.value = result.message
  }
  
  loading.value = false
}
</script>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  background: var(--surface);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.register-left {
  flex: 1;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2)),
              url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80') center/cover;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px;
  position: relative;
}

.register-left::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(15, 15, 35, 0.7);
}

.register-left-content {
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

.register-left h2 {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.register-left p {
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

.register-right {
  flex: 1;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-height: 90vh;
  overflow-y: auto;
}

.register-header {
  margin-bottom: 32px;
}

.register-header h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.register-header p {
  color: var(--text-muted);
}

.register-header a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.register-header a:hover {
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

.form-terms {
  margin-bottom: 24px;
}

.form-terms label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.form-terms input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
}

.form-terms a {
  color: var(--primary);
  text-decoration: none;
}

.form-terms a:hover {
  text-decoration: underline;
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

@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
  }
  
  .register-left {
    display: none;
  }
  
  .register-right {
    padding: 32px 24px;
  }
}
</style>
