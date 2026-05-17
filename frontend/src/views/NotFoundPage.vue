<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-message">抱歉，您访问的页面不存在或已被移除</p>
      
      <div class="error-actions">
        <router-link to="/" class="btn btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          返回首页
        </router-link>
        
        <button class="btn btn-secondary" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          返回上一页
        </button>
      </div>
      
      <div class="quick-links">
        <p>您可以尝试：</p>
        <ul>
          <li><router-link to="/category">浏览分类</router-link></li>
          <li><router-link to="/search">搜索视频</router-link></li>
          <li><router-link to="/ai-create">AI 创作</router-link></li>
        </ul>
      </div>
    </div>
    
    <div class="error-decoration">
      <div class="floating-emoji">🎬</div>
      <div class="floating-emoji">🎥</div>
      <div class="floating-emoji">📺</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 40px 20px;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  z-index: 1;
  animation: fadeInUp 0.6s ease forwards;
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 16px;
  text-shadow: 0 0 80px rgba(99, 102, 241, 0.3);
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
}

.error-message {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin-bottom: 32px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 48px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  text-decoration: none;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--gradient);
  color: white;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--surface2);
}

.btn-secondary:hover {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.quick-links {
  text-align: left;
  background: var(--surface);
  padding: 24px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.quick-links p {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.quick-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.quick-links li {
  margin-bottom: 8px;
}

.quick-links a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.quick-links a:hover {
  color: var(--secondary);
}

/* 装饰元素 */
.error-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.floating-emoji {
  position: absolute;
  font-size: 3rem;
  animation: float 6s ease-in-out infinite;
  opacity: 0.15;
}

.floating-emoji:nth-child(1) {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.floating-emoji:nth-child(2) {
  top: 20%;
  right: 15%;
  animation-delay: 2s;
  font-size: 4rem;
}

.floating-emoji:nth-child(3) {
  bottom: 15%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .error-code {
    font-size: 5rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 250px;
  }
}
</style>
