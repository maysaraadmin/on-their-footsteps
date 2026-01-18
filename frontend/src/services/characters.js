import api from './api'

export const characters = {
  getAll: (params) => api.get('/characters', { params }),
  getById: (id) => api.get(`/characters/${id}`),
  search: (query, limit = 20) => api.get('/characters/search', { params: { q: query, limit } }),
  getRelated: (id) => api.get(`/characters/${id}/related`),
  getCategories: () => api.get('/content/categories'),
  getFeatured: (limit = 6, category = null) => {
    if (category) {
      return api.get(`/content/featured/${category}`, { params: { limit } })
    }
    return api.get('/content/featured/general', { params: { limit } })
  },
  getByCategory: (category, limit = 12) => api.get('/characters/category', { params: { category, limit } }),
  getByEra: (era, limit = 12) => api.get('/characters/era', { params: { era, limit } }),
}