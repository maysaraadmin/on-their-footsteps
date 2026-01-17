import api from './api'

export const progress = {
  getProgress: (characterId) => api.get(`/progress/${characterId}`),
  updateProgress: (characterId, data) => api.post(`/progress/${characterId}`, data),
  updateBookmark: (characterId, bookmarked) => api.put(`/progress/${characterId}`, { bookmarked }),
  getSummary: () => api.get('/progress/summary'),
  getStats: () => api.get('/progress/stats'),
}