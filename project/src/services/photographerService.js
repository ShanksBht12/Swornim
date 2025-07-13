import api from './api';

// Utility to remove empty, null, or undefined fields
function removeEmptyFields(obj) {
  if (obj instanceof FormData) return obj; // Don't process FormData
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
}

export const photographerService = {
  async searchPhotographers(params = {}) {
    // params can include search, page, limit, etc.
    const response = await api.get('/photographers/search', { params });
    return response.data.data;
  },
  async getMyProfile() {
    const response = await api.get('/photographers/profile/me');
    return response.data.data;
  },
  async createProfile(data) {
    const response = await api.post('/photographers/profile', data);
    return response.data.data;
  },
  async updateProfile(data) {
    const cleaned = removeEmptyFields(data);
    const response = await api.put('/photographers/profile', cleaned);
    return response.data.data;
  },
  async getPhotographerById(id) {
    const response = await api.get(`/photographers/${id}`);
    return response.data.data;
  },
}; 