import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Set language
    const language = localStorage.getItem('language') || 'ar'
    config.headers['Accept-Language'] = language
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.'
    }
    
    return Promise.reject(error)
  }
)

// API Methods
export const characters = {
  getAll: (params) => api.get('/characters', { params }),
  getById: (id) => api.get(`/characters/${id}`),
  search: (query, limit = 20) => api.get('/characters/search', { params: { q: query, limit } }),
  getRelated: (id) => api.get(`/characters/${id}/related`),
  getCategories: () => api.get('/characters/categories'),
}

export const progress = {
  getProgress: (characterId) => api.get(`/progress/${characterId}`),
  updateProgress: (characterId, data) => api.post(`/progress/${characterId}`, data),
  updateBookmark: (characterId, bookmarked) => api.put(`/progress/${characterId}`, { bookmarked }),
  getSummary: () => api.get('/progress/summary'),
}

export const stats = {
  getStats: () => api.get('/stats'),
}

export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
}

export default api