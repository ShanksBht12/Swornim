import api from './api';

// Utility to remove empty, null, or undefined fields
function removeEmptyFields(obj) {
  if (obj instanceof FormData) return obj; // Don't process FormData
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
}

export const venueService = {
  async getMyProfile() {
    const response = await api.get('/venues/profile/me');
    return response.data.data;
  },
  async createProfile(data) {
    const response = await api.post('/venues/profile', data);
    return response.data.data;
  },
  async updateProfile(data) {
    const cleaned = removeEmptyFields(data);
    const response = await api.put('/venues/profile', cleaned);
    return response.data.data;
  },
  async searchVenues(params = {}) {
    const response = await api.get('/venues/search', { params });
    return response.data.data;
  },
  async getVenueById(id) {
    const response = await api.get(`/venues/${id}`);
    return response.data.data;
  },
}; 