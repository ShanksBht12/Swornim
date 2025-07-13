import api from './api';

// Get auth headers (reuse logic from packageService)
function getAuthHeaders() {
  const token = localStorage.getItem('swornim_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Create a new booking
export async function createBooking(data) {
  const res = await api.post('/bookings', data, { headers: getAuthHeaders() });
  return res.data;
}

// Get all bookings for the current user
export async function getBookings() {
  const res = await api.get('/bookings', { headers: getAuthHeaders() });
  return res.data;
}

// Update booking status (accept, reject, start, complete)
export async function updateBookingStatus(bookingId, status, reason) {
  const body = reason ? { status, reason } : { status };
  const res = await api.patch(`/bookings/${bookingId}/status`, body, { headers: getAuthHeaders() });
  return res.data;
}

// Update a booking (e.g., reschedule)
export async function updateBooking(bookingId, data) {
  const res = await api.put(`/bookings/${bookingId}`, data, { headers: getAuthHeaders() });
  return res.data;
}

// Delete a booking
export async function deleteBooking(bookingId) {
  const res = await api.delete(`/bookings/${bookingId}`, { headers: getAuthHeaders() });
  return res.data;
}

// Cancel a booking with reason
export async function cancelBooking(bookingId, reason) {
  const res = await api.post(`/bookings/${bookingId}/cancel`, { reason }, { headers: getAuthHeaders() });
  return res.data;
} 