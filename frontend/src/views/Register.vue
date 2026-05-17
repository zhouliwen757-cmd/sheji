<template>
  <div class="register-page">
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
          <h2>创建账户</h2>
          <p>加入 StreamVibe，开启您的视频之旅。只需几步，即可享受海量优质内容。</p>
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-text">填写基本信息</div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-text">验证邮箱地址</div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-text">开始探索精彩内容</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="register-right">
        <div class="register-header">
          <h1>注册新账户</h1>
          <p>已有账户？<router-link to="/login">立即登录</router-link></p>
        </div>
        
        <div v-if="message.text" :class="['message', message.type]">
          {{ message.text }}
        </div>
        
        <form @submit.prevent="handleRegister">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">用户名 <span class="required">*</span></label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input v-model="form.username" type="text" class="form-input with-icon" placeholder="请输入用户名" required>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">昵称</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <input v-model="form.nickname" type="text" class="form-input with-icon" placeholder="您的公开昵称">
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">邮箱地址 <span class="required">*</span></label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input v-model="form.email" type="email" class="form-input with-icon" placeholder="请输入邮箱地址" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">密码 <span class="required">*</span></label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input v-model="form.password" @input="checkPasswordStrength" :type="showPassword ? 'text' : 'password'" class="form-input with-icon" placeholder="至少8位字符" required minlength="8">
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
              <div class="password-strength">
                <div v-for="i in 4" :key="i" :class="['strength-bar', strengthLevel >= i ? strengthClass : '']"></div>
              </div>
              <div v-if="strengthText" :class="['strength-text', strengthClass]">{{ strengthText }}</div>
            </div>
            
            <div class="form-group">
              <label class="form-label">确认密码 <span class="required">*</span></label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" class="form-input with-icon" placeholder="再次输入密码" required>
                <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                  <svg v-if="!showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">手机号码</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
              <input v-model="form.phone" type="tel" class="form-input with-icon" placeholder="可选，用于找回密码">
            </div>
          </div>
          
          <div class="form-check">
            <input v-model="form.agreeTerms" type="checkbox" id="terms" required>
            <label for="terms">
              我已阅读并同意 <a href="#">《服务条款》</a> 和 <a href="#">《隐私政策》</a>
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
import api from '../api'

const router = useRouter()

const form = ref({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  agreeTerms: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const message = ref({ text: '', type: '' })
const strengthLevel = ref(0)
const strengthClass = ref('')
const strengthText = ref('')

const checkPasswordStrength = () => {
  const password = form.value.password
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
  
  strengthLevel.value = strength
  
  const classes = ['', 'weak', 'medium', 'medium', 'strong']
  const texts = ['', '弱', '中等', '强', '非常强']
  strengthClass.value = classes[strength]
  strengthText.value = password.length >= 8 ? texts[strength] : ''
}

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    message.value = { text: '两次输入的密码不一致', type: 'error' }
    return
  }
  
  if (form.value.password.length < 8) {
    message.value = { text: '密码长度至少为8位字符', type: 'error' }
    return
  }
  
  loading.value = true
  message.value = { text: '', type: '' }
  
  try {
    await api.register({
      username: form.value.username,
      nickname: form.value.nickname || form.value.username,
      email: form.value.email,
      password: form.value.password,
      phone: form.value.phone || null
    })
    
    message.value = { text: '注册成功！正在跳转登录...', type: 'success' }
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    message.value = {
      text: error.message || '注册失败，请稍后重试',
      type: 'error'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
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

.steps {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  display: flex;
  align-items: center;
  gap: 16px;
}

.step-number {
  width: 36px;
  height: 36px;
  background: var(--gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.step-text {
  font-size: 0.95rem;
  color: var(--text-muted);
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-check {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
}

.form-check input {
  width: 20px;
  height: 20px;
  accent-color: var(--primary);
  margin-top: 2px;
}

.form-check label {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.form-check a {
  color: var(--primary);
  text-decoration: none;
}

.form-check a:hover {
  text-decoration: underline;
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

.password-strength {
  margin-top: 8px;
  display: flex;
  gap: 4px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--surface2);
  border-radius: 2px;
  transition: background 0.3s ease;
}

.strength-bar.weak { background: var(--error); }
.strength-bar.medium { background: var(--accent); }
.strength-bar.strong { background: var(--success); }

.strength-text {
  font-size: 0.8rem;
  margin-top: 4px;
}

.strength-text.weak { color: var(--error); }
.strength-text.medium { color: var(--accent); }
.strength-text.strong { color: var(--success); }

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
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
