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

// Book event tickets (for event ticket bookings)
export async function bookEventTickets(data) {
  // POST to /events/bookings/
  const res = await api.post('/events/bookings/', data, { headers: getAuthHeaders() });
  return res.data;
}

// Get a single event ticket booking by ID
export async function getBookingById(bookingId) {
  try {
    // First try event ticket booking endpoint
    const res = await api.get(`/events/bookings/${bookingId}/`, { 
      headers: getAuthHeaders() 
    });
    return res.data;
  } catch (error) {
    // If that fails, try regular booking endpoint
    try {
      const res = await api.get(`/bookings/${bookingId}`, { 
        headers: getAuthHeaders() 
      });
      return res.data;
    } catch (regularBookingError) {
      // If both fail, throw the original error
      throw error;
    }
  }
}

// Download ticket PDF
export async function downloadTicketPDF(bookingId) {
  try {
    const response = await api.get(`/events/bookings/${bookingId}/ticket/`, {
      headers: {
        ...getAuthHeaders(),
      },
      responseType: 'blob', // Important for PDF download
    });
    
    return response.data; // This will be a Blob
  } catch (error) {
    console.error('PDF download error:', error);
    throw new Error('Failed to download PDF');
  }
}

// Alternative PDF download using fetch (for more control)
export async function downloadTicketPDFWithFetch(bookingId) {
  const token = localStorage.getItem('swornim_token');
  
  try {
    const response = await fetch(`/api/events/bookings/${bookingId}/ticket/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('PDF download error:', error);
    throw new Error('Failed to download PDF');
  }
}

// Verify event ticket payment by bookingId
export async function verifyPaymentByBookingId(bookingId) {
  // Use POST, not GET, to match mobile app
  const res = await api.post(`/events/bookings/${bookingId}/payment/`, {}, { headers: getAuthHeaders() });
  return res.data;
}

// Process payment for event ticket booking (used for verification)
export async function processPaymentForBooking(bookingId, data) {
  const res = await api.post(`/events/bookings/${bookingId}/payment/`, data, { headers: getAuthHeaders() });
  return res.data;
}