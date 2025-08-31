import api from './api';

// Utility to remove empty, null, or undefined fields
function removeEmptyFields(obj) {
  if (obj instanceof FormData) return obj; // Don't process FormData
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
}

const createProfile = async (data) => {
  if (data instanceof FormData) {
    // File upload
    return fetch('/api/venue/profile', {
      method: 'POST',
      body: data,
      // Do not set Content-Type header; browser will set it
      credentials: 'include',
    }).then(res => res.json());
  } else {
    // JSON
    return fetch('/api/venue/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    }).then(res => res.json());
  }
};

export const venueService = {
  async getMyProfile() {
    const response = await api.get('/venues/profile/me');
    return response.data.data;
  },
  createProfile,
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