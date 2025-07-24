import api from './api';

// Utility to remove empty, null, or undefined fields
function removeEmptyFields(obj) {
  if (obj instanceof FormData) return obj; // Don't process FormData
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
}

export const catererService = {
  async getMyProfile() {
    const response = await api.get('/caterers/profile/me');
    return response.data.data;
  },
  async createProfile(data) {
    const response = await api.post('/caterers/profile', data);
    return response.data.data;
  },
  async updateProfile(data) {
    const cleaned = removeEmptyFields(data);
    const response = await api.put('/caterers/profile', cleaned);
    return response.data.data;
  },
  async searchCaterers(params = {}) {
    const response = await api.get('/caterers/search', { params });
    return response.data.data;
  },
  async getCatererById(id) {
    const response = await api.get(`/caterers/${id}`);
    return response.data.data;
  },
  addPortfolioImage: async (file) => {
    const formData = new FormData();
    formData.append("portfolioImage", file);
    return fetch('/api/caterers/portfolio/images', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(res => res.json());
  },
}; 