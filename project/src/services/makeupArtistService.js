import api from './api';

// Utility to remove empty, null, or undefined fields
function removeEmptyFields(obj) {
  if (obj instanceof FormData) return obj; // Don't process FormData
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
}

export const makeupArtistService = {
  async getMyProfile() {
    const response = await api.get('/makeup-artists/profile/me');
    return response.data.data;
  },
  async createProfile(data) {
    const response = await api.post('/makeup-artists/profile', data);
    return response.data.data;
  },
  async updateProfile(data) {
    const cleaned = removeEmptyFields(data);
    const response = await api.put('/makeup-artists/profile', cleaned);
    return response.data.data;
  },
  async searchMakeupArtists(params = {}) {
    const response = await api.get('/makeup-artists/search', { params });
    return response.data.data;
  },
  async getMakeupArtistById(id) {
    const response = await api.get(`/makeup-artists/${id}`);
    return response.data.data;
  },
}; 