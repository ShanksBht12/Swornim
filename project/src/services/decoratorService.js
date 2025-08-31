import api from './api';

// Utility to remove empty, null, or undefined fields
function removeEmptyFields(obj) {
  if (obj instanceof FormData) return obj; // Don't process FormData
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
}

export const decoratorService = {
  async getMyProfile() {
    const response = await api.get('/decorators/profile/me');
    return response.data.data;
  },
  async createProfile(data) {
    const response = await api.post('/decorators/profile', data);
    return response.data.data;
  },
  async updateProfile(data) {
    const cleaned = removeEmptyFields(data);
    const response = await api.put('/decorators/profile', cleaned);
    return response.data.data;
  },
  async searchDecorators(params = {}) {
    const response = await api.get('/decorators/search', { params });
    return response.data.data;
  },
  async getDecoratorById(id) {
    const response = await api.get(`/decorators/${id}`);
    return response.data.data;
  },
  addPortfolioImage: async (file) => {
    const formData = new FormData();
    formData.append("portfolioImage", file);
    return fetch('/api/decorators/portfolio/images', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(res => res.json());
  },
}; 