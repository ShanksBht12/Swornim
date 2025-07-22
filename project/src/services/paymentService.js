// paymentService.js - UPDATED VERSION
import api from './api';

function getAuthHeaders() {
  const token = localStorage.getItem('swornim_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const paymentService = {
  // Initialize Khalti payment for a booking
  initializeKhaltiPayment: async (bookingId) => {
    // FIXED: Remove returnUrl and failureUrl from frontend
    // Let the backend handle the return URL configuration
    const res = await api.post(`/payments/${bookingId}/init-khalti`, {}, { 
      headers: getAuthHeaders() 
    });
    return res.data;
  },

  // Verify Khalti payment
  verifyKhaltiPayment: async (pidx) => {
    const res = await api.post('/payments/verify', { pidx }, { headers: getAuthHeaders() });
    return res.data;
  },

  // Get payment status for a booking
  getPaymentStatus: async (bookingId) => {
    const res = await api.get(`/payments/${bookingId}/status`, { headers: getAuthHeaders() });
    return res.data;
  },

  // Get payment history for the current user
  getPaymentHistory: async () => {
    const res = await api.get('/payments/history', { headers: getAuthHeaders() });
    return res.data;
  },

  // Update booking payment status
  updateBookingPaymentStatus: async (bookingId, status) => {
    const res = await api.patch(`/bookings/${bookingId}/payment-status`, 
      { paymentStatus: status }, 
      { headers: getAuthHeaders() }
    );
    return res.data;
  }
};