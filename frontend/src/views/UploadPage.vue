<template>
  <div class="page-container">
    <Navbar />
    
    <div class="container upload-container" v-if="authStore.isLoggedIn">
      <div class="upload-header">
        <h1>上传视频</h1>
        <p>分享你的精彩内容</p>
      </div>

      <div v-if="message" :class="['message', messageType]">{{ message }}</div>

      <div class="upload-form">
        <div class="upload-row">
          <!-- Video Upload -->
          <div class="upload-area video-upload-area" @click="triggerFileInput" @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.prevent="onDrop" :class="{ dragover: isDragover }">
            <input type="file" ref="fileInput" @change="onFileSelected" accept="video/*" hidden>
            
            <div v-if="!videoFile" class="upload-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <h3>点击或拖拽上传视频</h3>
              <p>支持 MP4, AVI, MOV 等格式</p>
            </div>
            
            <div v-else class="file-info">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              <div class="file-details">
                <h4>{{ videoFile.name }}</h4>
                <p>{{ formatFileSize(videoFile.size) }}</p>
              </div>
              <button class="remove-btn" @click.stop="removeVideo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Thumbnail Upload -->
          <div class="upload-area thumbnail-upload-area" @click="triggerThumbnailInput" :class="{ 'has-thumbnail': thumbnailPreview }">
            <input type="file" ref="thumbnailInput" @change="onThumbnailSelected" accept="image/*" hidden>
            
            <div v-if="!thumbnailPreview && !autoThumbnailPreview" class="upload-placeholder thumbnail-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <h4>上传封面</h4>
              <p>支持 JPG, PNG 格式</p>
            </div>
            
            <div v-else class="thumbnail-preview">
              <img :src="thumbnailPreview || autoThumbnailPreview" alt="封面预览" />
              <button class="remove-thumbnail-btn" @click.stop="removeThumbnail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Hidden video for thumbnail extraction -->
        <video ref="videoRef" style="display:none" @loadeddata="extractVideoFrame"></video>

        <div class="upload-progress" v-if="uploadProgress > 0">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <p>上传中... {{ uploadProgress }}%</p>
        </div>

        <div class="form-section">
          <h3>视频信息</h3>
          
          <div class="form-group">
            <label class="form-label">标题 *</label>
            <input type="text" v-model="formData.title" class="form-input" placeholder="给视频起个标题" required>
          </div>

          <div class="form-group">
            <label class="form-label">简介</label>
            <textarea v-model="formData.description" class="form-input" rows="4" placeholder="描述一下你的视频内容"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">分类</label>
              <select v-model="formData.category" class="form-input">
                <option value="">请选择分类</option>
                <option value="movie">电影</option>
                <option value="anime">动漫</option>
                <option value="drama">剧集</option>
                <option value="variety">综艺</option>
                <option value="music">音乐</option>
                <option value="documentary">纪录片</option>
                <option value="sports">体育</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">画质</label>
              <select v-model="formData.quality" class="form-input">
                <option value="4K">4K</option>
                <option value="1080P">1080P</option>
                <option value="720P">720P</option>
                <option value="480P">480P</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">标签（用逗号分隔）</label>
            <input type="text" v-model="tagsInput" class="form-input" placeholder="例如: 科幻, 冒险, 动作">
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" @click="resetForm">重置</button>
          <button class="btn btn-primary" @click="handleUpload" :disabled="!canUpload || uploading">
            {{ uploading ? '上传中...' : '发布视频' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="login-prompt">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <h2>请先登录</h2>
      <p>登录后才能上传视频</p>
      <router-link to="/login?redirect=upload" class="btn btn-primary">立即登录</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import { useAuthStore } from '@/stores/auth'
import { useVideoStore } from '@/stores/video'

const router = useRouter()
const authStore = useAuthStore()
const videoStore = useVideoStore()

const fileInput = ref(null)
const thumbnailInput = ref(null)
const videoFile = ref(null)
const videoRef = ref(null)
const isDragover = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const message = ref('')
const messageType = ref('')
const thumbnailFile = ref(null)
const thumbnailPreview = ref('')
const autoThumbnailPreview = ref('')

const formData = ref({
  title: '',
  description: '',
  category: '',
  quality: '1080P'
})

const tagsInput = ref('')

const canUpload = computed(() => {
  return videoFile.value && formData.value.title.trim()
})

const formatFileSize = (bytes) => {
  if (bytes >= 1073741824) {
    return (bytes / 1073741824).toFixed(2) + ' GB'
  } else if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(2) + ' MB'
  }
  return (bytes / 1024).toFixed(2) + ' KB'
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const triggerThumbnailInput = () => {
  thumbnailInput.value.click()
}

const onFileSelected = (e) => {
  const file = e.target.files[0]
  if (file) {
    videoFile.value = file
    autoThumbnailPreview.value = ''
    thumbnailFile.value = null
    // Extract first frame as thumbnail
    extractVideoFrameFromFile(file)
  }
}

const extractVideoFrameFromFile = (file) => {
  const video = videoRef.value
  if (!video) return
  
  const url = URL.createObjectURL(file)
  video.src = url
  video.load()
}

const extractVideoFrame = () => {
  const video = videoRef.value
  if (!video) return
  
  // Wait for video to be ready
  if (video.readyState < 2) {
    video.addEventListener('loadeddata', captureFrame, { once: true })
    return
  }
  
  captureFrame()
}

const captureFrame = () => {
  const video = videoRef.value
  if (!video) return
  
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  
  // Convert to base64
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
  autoThumbnailPreview.value = dataUrl
  
  // Clean up
  URL.revokeObjectURL(video.src)
}

const onThumbnailSelected = (e) => {
  const file = e.target.files[0]
  if (file) {
    thumbnailFile.value = file
    thumbnailPreview.value = URL.createObjectURL(file)
    autoThumbnailPreview.value = ''
  }
}

const onDragOver = () => {
  isDragover.value = true
}

const onDragLeave = () => {
  isDragover.value = false
}

const onDrop = (e) => {
  isDragover.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) {
    videoFile.value = file
    autoThumbnailPreview.value = ''
    thumbnailFile.value = null
    extractVideoFrameFromFile(file)
  }
}

const removeVideo = () => {
  videoFile.value = null
  autoThumbnailPreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeThumbnail = () => {
  thumbnailFile.value = null
  thumbnailPreview.value = ''
  if (thumbnailInput.value) {
    thumbnailInput.value.value = ''
  }
}

// Helper function to convert base64 to Blob
const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64.split(',')[1])
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

const handleUpload = async () => {
  if (!canUpload.value) return
  
  uploading.value = true
  uploadProgress.value = 0
  message.value = ''
  
  const formDataToSend = new FormData()
  formDataToSend.append('video', videoFile.value)
  formDataToSend.append('title', formData.value.title)
  formDataToSend.append('description', formData.value.description)
  formDataToSend.append('category', formData.value.category)
  formDataToSend.append('quality', formData.value.quality)
  formDataToSend.append('tags', JSON.stringify(tagsInput.value.split(',').map(t => t.trim()).filter(t => t)))
  formDataToSend.append('user_id', authStore.user.id)
  
  // Add thumbnail if user uploaded custom one or auto-generated
  if (thumbnailFile.value) {
    formDataToSend.append('thumbnail', thumbnailFile.value)
  } else if (autoThumbnailPreview.value) {
    // Convert base64 to blob and append
    const thumbBlob = base64ToBlob(autoThumbnailPreview.value, 'image/jpeg')
    const thumbFile = new File([thumbBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
    formDataToSend.append('thumbnail', thumbFile)
  }
  
  // Simulate progress
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += Math.random() * 10
    }
  }, 500)
  
  const result = await videoStore.uploadVideo(formDataToSend)
  
  clearInterval(progressInterval)
  uploadProgress.value = 100
  
  if (result.success) {
    messageType.value = 'success'
    message.value = '视频上传成功！正在跳转...'
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } else {
    messageType.value = 'error'
    message.value = result.message
  }
  
  uploading.value = false
}

const resetForm = () => {
  videoFile.value = null
  thumbnailFile.value = null
  thumbnailPreview.value = ''
  autoThumbnailPreview.value = ''
  formData.value = {
    title: '',
    description: '',
    category: '',
    quality: '1080P'
  }
  tagsInput.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  if (thumbnailInput.value) {
    thumbnailInput.value.value = ''
  }
}
</script>

<style scoped>
.upload-container {
  padding-top: 100px;
  padding-bottom: 60px;
  max-width: 800px;
}

.upload-header {
  text-align: center;
  margin-bottom: 40px;
}

.upload-header h1 {
  font-size: 2.5rem;
  margin-bottom: 12px;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.upload-header p {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.upload-form {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 32px;
}

.upload-row {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 16px;
  margin-bottom: 24px;
}

.upload-area {
  border: 2px dashed var(--surface2);
  border-radius: var(--radius);
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
}

.video-upload-area {
  padding: 48px;
}

.upload-area:hover,
.upload-area.dragover {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.05);
}

.thumbnail-upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-upload-area.has-thumbnail {
  padding: 0;
  border-style: solid;
}

.thumbnail-placeholder {
  padding: 20px;
}

.thumbnail-placeholder svg {
  color: var(--text-muted);
  margin-bottom: 8px;
}

.thumbnail-placeholder h4 {
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.thumbnail-placeholder p {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.thumbnail-preview {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 120px;
}

.thumbnail-preview img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: calc(var(--radius) - 2px);
}

.remove-thumbnail-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-thumbnail-btn:hover {
  background: rgba(239, 68, 68, 0.8);
}

.upload-placeholder svg {
  color: var(--text-muted);
  margin-bottom: 16px;
}

.upload-placeholder h3 {
  margin-bottom: 8px;
}

.upload-placeholder p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-info svg {
  color: var(--primary);
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-details h4 {
  word-break: break-all;
}

.file-details p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.remove-btn {
  padding: 8px;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 50%;
  color: var(--error);
  border: none;
  cursor: pointer;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.upload-progress {
  margin-bottom: 24px;
}

.progress-bar {
  height: 8px;
  background: var(--surface2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--gradient);
  transition: width 0.3s ease;
}

.upload-progress p {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--surface2);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px;
  text-align: center;
  color: var(--text-muted);
}

.login-prompt svg {
  margin-bottom: 24px;
  opacity: 0.5;
}

.login-prompt h2 {
  color: var(--text);
  margin-bottom: 8px;
}

.login-prompt p {
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .upload-area {
    padding: 32px 16px;
  }
}
</style>
