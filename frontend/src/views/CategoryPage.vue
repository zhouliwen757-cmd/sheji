<template>
  <div class="page-container">
    <Navbar />
    
    <div class="container">
      <div class="category-header">
        <h1>视频分类</h1>
        <p>浏览不同类型的精彩视频</p>
      </div>

      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.value"
          class="category-card"
          @click="selectCategory(category)"
        >
          <div class="category-icon" :style="{ background: category.color }">
            <component :is="category.icon" />
          </div>
          <h3>{{ category.label }}</h3>
          <p>{{ category.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()

const MovieIcon = () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'white', 'stroke-width': 2 }, [
  h('rect', { x: 2, y: 2, width: 20, height: 20, rx: 2.18, ry: 2.18 }),
  h('line', { x1: 7, y1: 2, x2: 7, y2: 22 }),
  h('line', { x1: 17, y1: 2, x2: 17, y2: 22 })
])

const AnimeIcon = () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'white', 'stroke-width': 2 }, [
  h('circle', { cx: 12, cy: 12, r: 10 }),
  h('path', { d: 'M8 14s1.5 2 4 2 4-2 4-2' }),
  h('line', { x1: 9, y1: 9, x2: 9.01, y2: 9 }),
  h('line', { x1: 15, y1: 9, x2: 15.01, y2: 9 })
])

const MusicIcon = () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'white', 'stroke-width': 2 }, [
  h('path', { d: 'M9 18V5l12-2v13' }),
  h('circle', { cx: 6, cy: 18, r: 3 }),
  h('circle', { cx: 18, cy: 16, r: 3 })
])

const categories = [
  { 
    label: '电影', 
    value: 'movie',
    description: '热门电影、经典大片',
    color: 'linear-gradient(135deg, #667eea, #764ba2)',
    icon: MovieIcon
  },
  { 
    label: '动漫', 
    value: 'anime',
    description: '日漫、国漫、动画电影',
    color: 'linear-gradient(135deg, #f093fb, #f5576c)',
    icon: AnimeIcon
  },
  { 
    label: '剧集', 
    value: 'drama',
    description: '电视剧、网剧、综艺',
    color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    icon: () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'white', 'stroke-width': 2 }, [
      h('rect', { x: 2, y: 7, width: 20, height: 15, rx: 2, ry: 2 }),
      h('polyline', { points: '17 2 12 7 7 2' })
    ])
  },
  { 
    label: '音乐', 
    value: 'music',
    description: '音乐MV、现场演出',
    color: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    icon: MusicIcon
  },
  { 
    label: '纪录片', 
    value: 'documentary',
    description: '自然、历史、科技',
    color: 'linear-gradient(135deg, #fa709a, #fee140)',
    icon: () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'white', 'stroke-width': 2 }, [
      h('circle', { cx: 12, cy: 12, r: 10 }),
      h('line', { x1: 12, y1: 16, x2: 12, y2: 12 }),
      h('line', { x1: 12, y1: 8, x2: 12.01, y2: 8 })
    ])
  },
  { 
    label: '体育', 
    value: 'sports',
    description: '足球、篮球、电竞',
    color: 'linear-gradient(135deg, #a8edea, #fed6e3)',
    icon: () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'white', 'stroke-width': 2 }, [
      h('circle', { cx: 12, cy: 12, r: 10 }),
      h('path', { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' }),
      h('line', { x1: 2, y1: 12, x2: 22, y2: 12 })
    ])
  }
]

const selectCategory = (category) => {
  router.push({ path: '/', query: { category: category.value } })
}
</script>

<style scoped>
.category-header {
  padding: 60px 0;
  text-align: center;
}

.category-header h1 {
  font-size: 2.5rem;
  margin-bottom: 12px;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.category-header p {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding-bottom: 60px;
}

.category-card {
  padding: 32px;
  background: var(--surface);
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
  text-align: center;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.category-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.category-card h3 {
  font-size: 1.3rem;
  margin-bottom: 8px;
}

.category-card p {
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
