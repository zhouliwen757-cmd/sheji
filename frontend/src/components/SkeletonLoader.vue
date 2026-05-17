<template>
  <div class="skeleton-loader" :class="[variant, { 'is-loaded': loaded }]">
    <!-- Video Card Skeleton -->
    <template v-if="variant === 'video-card'">
      <div class="skeleton-card">
        <div class="skeleton-thumbnail skeleton-shimmer"></div>
        <div class="skeleton-info">
          <div class="skeleton-title skeleton-shimmer"></div>
          <div class="skeleton-meta">
            <div class="skeleton-avatar skeleton-shimmer"></div>
            <div class="skeleton-channel skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- Video Grid Skeleton -->
    <template v-else-if="variant === 'video-grid'">
      <div 
        v-for="i in count" 
        :key="i" 
        class="skeleton-card"
        :style="{ animationDelay: `${i * 0.1}s` }"
      >
        <div class="skeleton-thumbnail skeleton-shimmer"></div>
        <div class="skeleton-info">
          <div class="skeleton-title skeleton-shimmer"></div>
          <div class="skeleton-meta">
            <div class="skeleton-avatar skeleton-shimmer"></div>
            <div class="skeleton-channel skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- Profile Skeleton -->
    <template v-else-if="variant === 'profile'">
      <div class="skeleton-profile">
        <div class="skeleton-avatar-large skeleton-shimmer"></div>
        <div class="skeleton-name skeleton-shimmer"></div>
        <div class="skeleton-bio skeleton-shimmer"></div>
      </div>
    </template>

    <!-- Comment Skeleton -->
    <template v-else-if="variant === 'comment'">
      <div 
        v-for="i in count" 
        :key="i" 
        class="skeleton-comment"
        :style="{ animationDelay: `${i * 0.05}s` }"
      >
        <div class="skeleton-comment-avatar skeleton-shimmer"></div>
        <div class="skeleton-comment-content">
          <div class="skeleton-comment-name skeleton-shimmer"></div>
          <div class="skeleton-comment-text skeleton-shimmer"></div>
        </div>
      </div>
    </template>

    <!-- Page Skeleton -->
    <template v-else-if="variant === 'page'">
      <div class="skeleton-page">
        <div class="skeleton-hero skeleton-shimmer"></div>
        <div class="skeleton-content">
          <div class="skeleton-grid">
            <div 
              v-for="i in count" 
              :key="i" 
              class="skeleton-card"
              :style="{ animationDelay: `${i * 0.08}s` }"
            >
              <div class="skeleton-thumbnail skeleton-shimmer"></div>
              <div class="skeleton-info">
                <div class="skeleton-title skeleton-shimmer"></div>
                <div class="skeleton-meta">
                  <div class="skeleton-avatar skeleton-shimmer"></div>
                  <div class="skeleton-channel skeleton-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Default/Inline Skeleton -->
    <template v-else>
      <div class="skeleton-inline" :style="{ width, height }">
        <div class="skeleton-shimmer"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'inline',
    validator: (value) => [
      'inline', 
      'video-card', 
      'video-grid', 
      'profile', 
      'comment',
      'page'
    ].includes(value)
  },
  count: {
    type: Number,
    default: 8
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '20px'
  },
  autoLoad: {
    type: Boolean,
    default: false
  }
})

const loaded = ref(false)

onMounted(() => {
  if (props.autoLoad) {
    // Simulate loading completion
    setTimeout(() => {
      loaded.value = true
    }, 500)
  }
})
</script>

<style scoped>
/* Base skeleton styles */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--surface) 25%,
    var(--surface2) 50%,
    var(--surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Video Card Skeleton */
.skeleton-card {
  background: var(--surface);
  border-radius: 12px;
  overflow: hidden;
  animation: fadeIn 0.3s ease-out forwards;
  opacity: 0;
}

.skeleton-thumbnail {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.skeleton-info {
  padding: 12px;
}

.skeleton-title {
  height: 20px;
  margin-bottom: 8px;
  width: 90%;
}

.skeleton-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-channel {
  height: 14px;
  width: 60%;
}

/* Profile Skeleton */
.skeleton-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
}

.skeleton-avatar-large {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  margin-bottom: 16px;
}

.skeleton-name {
  height: 24px;
  width: 150px;
  margin-bottom: 8px;
}

.skeleton-bio {
  height: 16px;
  width: 200px;
}

/* Comment Skeleton */
.skeleton-comment {
  display: flex;
  gap: 12px;
  padding: 12px;
  animation: fadeIn 0.3s ease-out forwards;
  opacity: 0;
}

.skeleton-comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-comment-content {
  flex: 1;
}

.skeleton-comment-name {
  height: 16px;
  width: 120px;
  margin-bottom: 8px;
}

.skeleton-comment-text {
  height: 14px;
  width: 80%;
}

/* Page Skeleton */
.skeleton-page {
  min-height: 100vh;
}

.skeleton-hero {
  height: 300px;
  margin-bottom: 32px;
}

.skeleton-content {
  padding: 0 24px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loaded state */
.is-loaded .skeleton-card,
.is-loaded .skeleton-comment {
  animation: none;
  opacity: 1;
}
</style>
