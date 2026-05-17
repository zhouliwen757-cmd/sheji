// 统一 API 配置
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const apiConfig = {
  baseURL: API_BASE,
  timeout: 10000
}

export default API_BASE
