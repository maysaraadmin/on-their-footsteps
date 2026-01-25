import axios from 'axios'
import ApiService from './apiService'
import { requestDeduplication } from '../utils/requestDeduplicator'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const MAX_RETRIES = 2
const RETRY_DELAY = 5000 // 5 seconds

// Create ApiService instance for dependency injection
const apiService = new ApiService()

// Create axios instance with base URL and timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  withCredentials: false, // Disable credentials for CORS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = apiService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Set language
    const language = apiService.getLanguage()
    config.headers['Accept-Language'] = language
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add retry logic for failed requests
const retryRequest = async (config, retryCount = 0) => {
  try {
    return await api(config)
  } catch (error) {
    if (retryCount >= MAX_RETRIES) {
      return Promise.reject(error)
    }
    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
    return retryRequest(config, retryCount + 1)
  }
}

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (response.data?.token) {
      apiService.setToken(response.data.token)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // If there's no response, it's a network error
    if (!error.response) {
      error.message = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.'
      return Promise.reject(error)
    }
    
    // Handle specific HTTP status codes
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        error.message = data?.message || 'طلب غير صالح. يرجى التحقق من البيانات المدخلة.'
        break
        
      case 401:
        // If we get a 401 and this isn't a retry request
        if (!originalRequest._retry && originalRequest.url !== '/api/auth/refresh') {
          originalRequest._retry = true
          try {
            // Try to refresh the token
            const response = await api.post('/api/auth/refresh')
            const { token } = response.data;
            
            // Update the token in storage and axios headers
            apiService.setToken(token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            
            // Retry the original request
            return api(originalRequest);
          } catch (refreshError) {
            // If refresh token fails, log the user out
            apiService.removeToken();
            apiService.removeUser();
            apiService.navigateToLogin();
            return Promise.reject(refreshError);
          }
        } else {
          // If we've already tried to refresh or it's the refresh endpoint itself
          apiService.removeToken();
          apiService.removeUser();
          apiService.navigateToLogin();
        }
        break;
      case 403:
        error.message = 'ليس لديك صلاحية للوصول إلى هذا المورد.'
        break;
      case 404:
        error.message = 'لم يتم العثور على المورد المطلوب.'
        break;
      case 429:
        error.message = 'لقد تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقًا.'
        break;
      case 500:
        error.message = 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.'
        break;
      default:
        error.message = error.response.data?.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
    }
    
    return Promise.reject(error)
  }
)

// Helper function to handle API calls with retry logic and deduplication
const apiRequest = async (method, url, data = null, config = {}) => {
  // Create request function for deduplication
  const requestFn = async () => {
    try {
      const response = await api({
        method,
        url,
        data,
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${apiService.getToken()}`,
        },
      })
      return response
    } catch (error) {
      // If it's a network error, try to retry
      if (!error.response) {
        return retryRequest({
          method,
          url,
          data,
          ...config,
          headers: {
            ...config.headers,
            'Authorization': `Bearer ${apiService.getToken()}`,
          },
        })
      }
      throw error
    }
  }

  // Use request deduplication
  return await requestDeduplication.executeRequest(requestFn, method, url, data, config)
}

export const characters = {
  getAll: (params) => apiRequest('get', '/characters', null, { params }),
  getById: (id) => apiRequest('get', `/characters/${id}`),
  search: (query, limit = 20) => apiRequest('get', '/characters/search', null, { params: { q: query, limit } }),
  getFeatured: (limit = 6, category = null) => {
    if (category) {
      return apiRequest('get', `/content/featured/${category}`, null, { params: { limit } })
    }
    return apiRequest('get', '/content/featured/general', null, { params: { limit } })
  },
  getCategories: () => apiRequest('get', '/content/categories'),
}

export const progress = {
  getProgress: (characterId) => apiRequest('get', `/progress/${characterId}`),
  updateProgress: (characterId, data) => apiRequest('put', `/progress/${characterId}`, data),
  updateBookmark: (characterId, bookmarked) => apiRequest('patch', `/progress/${characterId}/bookmark`, { bookmarked }),
  getSummary: () => apiRequest('get', '/progress/summary'),
}

export const stats = {
  getStats: () => apiRequest('get', '/stats'),
  getDashboard: () => apiRequest('get', '/stats/dashboard'),
  getLeaderboard: (limit = 10) => apiRequest('get', '/stats/leaderboard', null, { params: { limit } }),
}

export const auth = {
  login: (credentials) => apiRequest('post', '/auth/login', credentials),
  register: (userData) => apiRequest('post', '/auth/register', userData),
  logout: () => {
    apiService.removeToken()
    return apiRequest('post', '/auth/logout')
  },
  getProfile: () => apiRequest('get', '/auth/me'),
  refreshToken: () => apiRequest('post', '/auth/refresh'),
  forgotPassword: (email) => apiRequest('post', '/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiRequest('post', '/auth/reset-password', { token, password }),
}

export default api