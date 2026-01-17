import api from './api'

export const stats = {
  getStats: () => api.get('/stats'),
  getCharacterStats: (characterId) => api.get(`/stats/character/${characterId}`),
  getOverallStats: () => api.get('/stats/overall'),
  getProgressStats: () => api.get('/stats/progress'),
}
