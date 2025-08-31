// paymentService.js
import api from './api';

function getAuthHeaders() {
  const token = localStorage.getItem('swornim_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const packageService = {
  // Fetch packages for a service provider by userId
  getPackages: async (userId) => {
    const res = await api.get(`/packages?service_provider_id=${userId}`);
    return res.data; // Backend returns an array directly
  },
  // Create a new package
  createPackage: async (data) => {
    const res = await api.post('/packages', data);
    return res.data;
  },

  // Update a package
  updatePackage: async (id, data) => {
    const res = await api.put(`/packages/${id}`, data);
    return res.data;
  },

  // Delete a package
  deletePackage: async (id) => {
    const res = await api.delete(`/packages/${id}`);
    return res.data;
  },
  // Add other package-related methods here as needed
};