import api from './api';

export const eventOrganizerService = {
  // Get the current user's event organizer profile
  getMyProfile: async () => {
    const res = await api.get('/event-organizers/profile/me');
    return res.data.data;
  },

  // Create a new event organizer profile
  createProfile: async (data) => {
    if (data.profileImage instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      const res = await api.post('/event-organizers/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } else {
      const res = await api.post('/event-organizers/profile', data);
      return res.data.data;
    }
  },

  // Update event organizer profile
  updateProfile: async (data) => {
    if (data.profileImage instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      const res = await api.put('/event-organizers/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } else {
      const res = await api.put('/event-organizers/profile', data);
      return res.data.data;
    }
  },

  // Delete event organizer profile
  deleteProfile: async () => {
    const res = await api.delete('/event-organizers/profile');
    return res.data.data;
  },

  // Add portfolio image
  addPortfolioImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/event-organizers/portfolio/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
}; 