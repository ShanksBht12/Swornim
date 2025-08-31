import api from './api';

export const eventService = {
  // Get all events for the current organizer
  getMyEvents: async () => {
    const res = await api.get('/events/my');
    return res.data.data;
  },

  // Get a single event by ID
  getEventById: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data.data;
  },

  // Get all events for clients
  getAllEvents: async () => {
    const res = await api.get('/events/search');
    return res.data;
  },

  // Create a new event (supports image and gallery upload)
  createEvent: async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'gallery' && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) formData.append('gallery', file);
        });
      } else if (key === 'location' && typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([locKey, locVal]) => {
          if (locVal !== undefined && locVal !== null && locVal !== '') {
            formData.append(`location[${locKey}]`, locVal);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        // fallback for other objects
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const res = await api.post('/events/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  // Update an event by ID (supports image and gallery upload)
  updateEvent: async (id, data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'gallery' && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) formData.append('gallery', file);
        });
      } else if (key === 'location' && typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([locKey, locVal]) => {
          if (locVal !== undefined && locVal !== null && locVal !== '') {
            formData.append(`location[${locKey}]`, locVal);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        // fallback for other objects
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const res = await api.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  // Delete an event by ID
  deleteEvent: async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
}; 