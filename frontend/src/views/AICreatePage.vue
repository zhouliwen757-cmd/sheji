<template>
  <div class="page-container">
    <Navbar />
    
    <div class="container">
      <div class="ai-create-header">
        <h1>AI 创作中心</h1>
        <p>输入创意描述，让 AI 为您生成精彩视频</p>
      </div>

      <div class="ai-create-content">
        <!-- 创建模式选择 -->
        <div class="mode-selector">
          <button 
            v-for="mode in modes" 
            :key="mode.value"
            :class="['mode-btn', { active: selectedMode === mode.value }]"
            @click="selectedMode = mode.value"
          >
            <span class="mode-icon">{{ mode.icon }}</span>
            <span class="mode-label">{{ mode.label }}</span>
          </button>
        </div>

        <!-- 提示词输入区 -->
        <div class="prompt-section">
          <label class="prompt-label">
            <span class="label-icon">✨</span>
            {{ selectedMode === 'video' ? '视频描述' : '图片描述' }}
          </label>
          <textarea 
            v-model="prompt" 
            :placeholder="getPlaceholder()"
            class="prompt-input"
            rows="4"
          ></textarea>
          <div class="prompt-tips">
            <span class="tip">提示：描述越详细，生成效果越好</span>
          </div>
        </div>

        <!-- 风格选择 -->
        <div class="style-section">
          <label class="style-label">选择风格</label>
          <div class="style-grid">
            <button 
              v-for="style in styles" 
              :key="style.value"
              :class="['style-btn', { active: selectedStyle === style.value }]"
              @click="selectedStyle = style.value"
            >
              {{ style.label }}
            </button>
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="action-section">
          <!-- 进度条 -->
          <div v-if="generating" class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: currentProgress + '%' }"></div>
            </div>
            <p class="progress-text">AI 正在创作中... {{ currentProgress }}%</p>
          </div>
          
          <!-- 错误提示 -->
          <div v-if="errorMessage" class="error-message">
            <span>⚠️ {{ errorMessage }}</span>
          </div>
          
          <button 
            class="generate-btn" 
            @click="generateContent"
            :disabled="!prompt.trim() || generating"
          >
            <span v-if="generating" class="btn-loader"></span>
            <span v-else>{{ selectedMode === 'video' ? '🎬 生成视频' : '🖼️ 生成图片' }}</span>
          </button>
        </div>

        <!-- 生成结果 -->
        <div v-if="resultUrl" class="result-section">
          <h3>{{ selectedMode === 'video' ? '视频生成成功！' : '图片生成成功！' }}</h3>
          <div class="result-preview">
            <video v-if="selectedMode === 'video'" :src="resultUrl" controls autoplay loop></video>
            <img v-else :src="resultUrl" alt="生成结果" />
          </div>
          <div class="result-actions">
            <button class="action-btn download" @click="downloadResult">
              <span>📥 下载</span>
            </button>
            <button class="action-btn share" @click="shareResult">
              <span>🔗 分享</span>
            </button>
            <button class="action-btn create-more" @click="createMore">
              <span>➕ 继续创作</span>
            </button>
          </div>
        </div>

        <!-- 历史记录 -->
        <div class="history-section">
          <h3>近期创作</h3>
          <div class="history-grid">
            <div v-for="item in history" :key="item.id" class="history-item" @click="viewHistory(item)">
              <div class="history-thumb">
                <img v-if="item.type === 'image'" :src="item.thumbnail" alt="缩略图" />
                <video v-else :src="item.thumbnail" muted></video>
                <span class="history-type">{{ item.type === 'video' ? '视频' : '图片' }}</span>
              </div>
              <p class="history-prompt">{{ item.prompt }}</p>
            </div>
            <div v-if="history.length === 0" class="history-empty">
              <span>暂无创作记录</span>
            </div>
          </div>
        </div>

        <!-- 示例提示 -->
        <div class="examples-section">
          <h3>💡 示例描述</h3>
          <div class="examples-grid">
            <div v-for="example in examples" :key="example.text" class="example-card" @click="useExample(example)">
              <span class="example-type">{{ example.type === 'video' ? '🎬' : '🖼️' }}</span>
              <p>{{ example.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'

const API_BASE = 'http://localhost:3000/api'

const selectedMode = ref('video')
const prompt = ref('')
const selectedStyle = ref('realistic')
const generating = ref(false)
const currentJobId = ref('')
const currentProgress = ref(0)
const resultUrl = ref('')
const errorMessage = ref('')
const aiEnabled = ref(false)
const aiStatus = ref('checking')

const modes = [
  { label: '文生视频', value: 'video', icon: '🎬' },
  { label: '文生图片', value: 'image', icon: '🖼️' }
]

const styles = [
  { label: '写实', value: 'realistic' },
  { label: '动漫', value: 'anime' },
  { label: '水墨', value: 'ink' },
  { label: '赛博朋克', value: 'cyberpunk' },
  { label: '油画', value: 'oil' },
  { label: '水彩', value: 'watercolor' }
]

const examples = [
  { type: 'video', text: '黄昏时分，一列复古蒸汽火车穿过被雪覆盖的森林，蒸汽从烟囱袅袅升起' },
  { type: 'video', text: '水墨晕染风格，大雨落在平静的湖面，涟漪向外扩散，远处山峦若隐若现' },
  { type: 'image', text: '工笔画风格，一枝白梅斜出画框，花瓣半开，背景留白' },
  { type: 'image', text: '赛博朋克风格的城市夜景，霓虹灯闪烁，高楼林立' }
]

const history = ref([])

// 检查 AI 服务状态
const checkAIStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/ai/status`)
    const data = await res.json()
    aiEnabled.value = data.enabled
    aiStatus.value = data.enabled ? 'ready' : 'disabled'
  } catch (e) {
    aiStatus.value = 'error'
  }
}

// 初始化 Cloud Token
const initCloudToken = async () => {
  try {
    if (window.connect_cloud_service) {
      const token = await window.connect_cloud_service()
      await fetch(`${API_BASE}/ai/set-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      aiEnabled.value = true
      aiStatus.value = 'ready'
    }
  } catch (e) {
    console.log('Cloud token init skipped')
  }
}

const getPlaceholder = () => {
  if (selectedMode.value === 'video') {
    return '描述您想生成的视频场景，例如：\n- 夕阳下的海边小镇，海浪轻拍沙滩\n- 未来城市的空中交通，飞行汽车穿梭其间\n- 森林深处的小溪，阳光穿过树叶洒落'
  }
  return '描述您想生成的图片，例如：\n- 一只可爱的橘猫在花园里打盹\n- 古典风格的中国建筑群\n- 科幻风格的太空站'
}

const useExample = (example) => {
  prompt.value = example.text
  if (example.type === 'image') {
    selectedMode.value = 'image'
  }
}

const generateContent = async () => {
  if (!prompt.value.trim()) return
  
  generating.value = true
  resultUrl.value = ''
  errorMessage.value = ''
  currentProgress.value = 0
  
  try {
    const endpoint = selectedMode.value === 'video' ? 'ai/video' : 'ai/image'
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt.value,
        style: selectedStyle.value
      })
    })
    
    const data = await res.json()
    
    if (!data.success) {
      errorMessage.value = data.message || '提交失败'
      generating.value = false
      return
    }
    
    currentJobId.value = data.job_id
    // 开始轮询状态
    pollJobStatus(data.job_id)
    
  } catch (error) {
    console.error('AI 生成失败:', error)
    errorMessage.value = '网络错误，请稍后重试'
    generating.value = false
  }
}

// 轮询任务状态
const pollJobStatus = async (jobId) => {
  const poll = async () => {
    try {
      const res = await fetch(`${API_BASE}/ai/status/${jobId}`)
      const data = await res.json()
      
      if (data.success) {
        currentProgress.value = data.progress || 0
        
        if (data.status === 'SUCCESS') {
          generating.value = false
          resultUrl.value = data.result_url
          // 添加到历史
          history.value.unshift({
            id: Date.now(),
            type: selectedMode.value,
            thumbnail: data.result_url,
            prompt: prompt.value
          })
          return
        } else if (data.status === 'FAILED') {
          generating.value = false
          errorMessage.value = data.error || '生成失败'
          return
        } else if (data.status === 'RUNNING' || data.status === 'PENDING') {
          // 继续轮询
          setTimeout(poll, 2000)
        }
      }
    } catch (e) {
      console.error('Poll error:', e)
    }
  }
  
  poll()
}

const downloadResult = () => {
  if (!resultUrl.value) return
  const a = document.createElement('a')
  a.href = resultUrl.value
  a.download = `ai-${selectedMode.value}-${Date.now()}`
  a.click()
}

const shareResult = () => {
  if (!resultUrl.value) return
  if (navigator.clipboard) {
    navigator.clipboard.writeText(resultUrl.value)
    alert('链接已复制到剪贴板')
  }
}

const createMore = () => {
  prompt.value = ''
  resultUrl.value = ''
  errorMessage.value = ''
  currentJobId.value = ''
  currentProgress.value = 0
}

const viewHistory = (item) => {
  resultUrl.value = item.thumbnail
  prompt.value = item.prompt
  selectedMode.value = item.type
}

onMounted(() => {
  checkAIStatus()
  initCloudToken()
})
</script>

<style scoped>
.ai-create-header {
  padding: 60px 0 40px;
  text-align: center;
}

.ai-create-header h1 {
  font-size: 2.5rem;
  margin-bottom: 12px;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ai-create-header p {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.ai-create-content {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 60px;
}

/* 模式选择 */
.mode-selector {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  background: var(--surface);
  border: 2px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
}

.mode-btn:hover {
  background: var(--surface2);
}

.mode-btn.active {
  border-color: var(--primary);
  background: rgba(139, 92, 246, 0.1);
}

.mode-icon {
  font-size: 1.5rem;
}

.mode-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
}

/* 提示词输入 */
.prompt-section {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 24px;
}

.prompt-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 12px;
}

.label-icon {
  font-size: 1.2rem;
}

.prompt-input {
  width: 100%;
  padding: 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
}

.prompt-input:focus {
  outline: none;
  border-color: var(--primary);
}

.prompt-input::placeholder {
  color: var(--text-muted);
}

.prompt-tips {
  margin-top: 12px;
}

.tip {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* 风格选择 */
.style-section {
  margin-bottom: 32px;
}

.style-label {
  display: block;
  font-weight: 600;
  margin-bottom: 16px;
}

.style-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.style-btn {
  padding: 10px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition);
}

.style-btn:hover {
  border-color: var(--primary);
  color: var(--text);
}

.style-btn.active {
  background: var(--gradient);
  border-color: transparent;
  color: white;
}

/* 生成按钮 */
.action-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
}

.progress-section {
  width: 100%;
  max-width: 400px;
}

.progress-bar {
  height: 8px;
  background: var(--surface2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  margin-top: 8px;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.error-message {
  padding: 12px 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius);
  color: #ef4444;
  font-size: 0.9rem;
}

.generate-btn {
  padding: 16px 48px;
  font-size: 1.2rem;
  font-weight: 600;
  background: var(--gradient);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 10px;
}

.generate-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 结果展示 */
.result-section {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 32px;
  margin-bottom: 40px;
  text-align: center;
}

.result-section h3 {
  font-size: 1.3rem;
  margin-bottom: 20px;
  color: #10b981;
}

.result-preview {
  max-width: 100%;
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 20px;
}

.result-preview video,
.result-preview img {
  max-width: 100%;
  max-height: 500px;
  border-radius: var(--radius);
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  padding: 10px 24px;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn.download {
  background: #10b981;
  color: white;
}

.action-btn.share {
  background: var(--surface2);
  color: var(--text);
}

.action-btn.create-more {
  background: var(--primary);
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
}

/* 历史记录 */
.history-section {
  margin-bottom: 40px;
}

.history-section h3 {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.history-item {
  background: var(--surface);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
}

.history-item:hover {
  transform: translateY(-4px);
}

.history-thumb {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.history-thumb img,
.history-thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-type {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.history-prompt {
  padding: 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

/* 示例 */
.examples-section h3 {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.example-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 16px;
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid transparent;
}

.example-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.example-type {
  font-size: 1.2rem;
  margin-bottom: 8px;
  display: block;
}

.example-card p {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
