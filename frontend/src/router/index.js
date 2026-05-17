import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue')
  },
  {
    path: '/video/:id',
    name: 'Video',
    component: () => import('@/views/VideoPage.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfilePage.vue')
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('@/views/UserProfilePage.vue')
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('@/views/CategoryPage.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/SearchPage.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/FavoritesPage.vue')
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/UploadPage.vue')
  },
  {
    path: '/ai-create',
    name: 'AICreate',
    component: () => import('@/views/AICreatePage.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminPage.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for admin routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    const userStr = localStorage.getItem('streamvibe_user')
    if (!userStr) {
      next('/login?redirect=admin')
      return
    }
    try {
      const user = JSON.parse(userStr)
      if (user.role !== 'ADMIN') {
        alert('您没有管理员权限')
        next('/')
        return
      }
    } catch (e) {
      next('/login')
      return
    }
  }
  next()
})

export default router
