// paymentService.js
import api from './api';

function getAuthHeaders() {
  const token = localStorage.getItem('swornim_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const paymentService = {
  // Initialize Khalti payment for a booking
  initializeKhaltiPayment: async (bookingId) => {
    // Get current URL to construct proper return URL
    const currentUrl = window.location.origin;
    const returnUrl = `${currentUrl}/client-dashboard?tab=bookings&payment=success`;
    const failureUrl = `${currentUrl}/client-dashboard?tab=bookings&payment=failed`;
    
    const payload = {
      bookingId,
      returnUrl,
      failureUrl
    };
    
    const res = await api.post(`/payments/${bookingId}/init-khalti`, payload, { 
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