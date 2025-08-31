const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const EventTicketBooking = require('./event_ticket_booking.model');
const Event = require('../event/event.model');
const service = require('./event_ticket_booking.service');
const paymentService = require('../payment/payment.service');
const { v4: uuidv4 } = require('uuid');
const User = require('../user/user.model');
const fs = require('fs');
const path = require('path');

// Simple QR code generator (replace with real QR code logic if needed)
function generateQRCode() {
  return uuidv4();
}

exports.bookTickets = async (req, res, next) => {
  try {
    console.log('=== [DEBUG] bookTickets called ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    const result = await service.createBookingWithPayment(req.body, req.user.id);
    if (result.error) {
      console.log('Booking error:', result.error);
      return res.status(result.status || 400).json({ error: result.error });
    }
    console.log('Booking result:', result);
    res.status(result.status || 201).json(result);
  } catch (err) {
    console.error('Exception in bookTickets:', err);
    next(err);
  }
};

// Payment verification endpoint
exports.verifyPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const result = await service.verifyPaymentAndConfirmBooking(bookingId, req.user.id);
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getQRCode = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await EventTicketBooking.findByPk(bookingId);
    if (!booking || booking.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ qrCode: booking.qr_code });
  } catch (err) {
    next(err);
  }
};

// Booking history for user
exports.getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookings = await EventTicketBooking.findAll({ where: { user_id: userId } });
    res.json({ results: bookings });
  } catch (err) {
    next(err);
  }
};

// Organizer view of ticket sales for an event
exports.getEventBookings = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    // Optionally, check if req.user is the organizer of the event
    const bookings = await EventTicketBooking.findAll({ where: { event_id: eventId } });
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// Enhanced Professional Ticket PDF Generator
exports.downloadTicket = async (req, res, next) => {
  try {
    // Delegate to service which has multi-ticket support
    await service.downloadTicket(req, res, next);
  } catch (err) {
    console.error('Error in downloadTicket controller:', err);
    next(err);
  }
};

// GET /events/bookings/:bookingId/ - Get single booking
exports.getBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const booking = await EventTicketBooking.findByPk(bookingId);
    if (!booking || booking.user_id !== userId) {
      return res.status(404).json({ data: null, message: 'Booking not found' });
    }
    res.json({ data: booking });
  } catch (err) { next(err); }
};

// PATCH /events/bookings/:bookingId/ - Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const booking = await EventTicketBooking.findByPk(bookingId);
    if (!booking || booking.user_id !== userId) {
      return res.status(404).json({ data: null, message: 'Booking not found' });
    }
    if (booking.status === 'cancelled' || booking.status === 'refunded') {
      return res.status(400).json({ data: booking, message: 'Booking already cancelled or refunded' });
    }
    await booking.update({ status: 'cancelled', booking_status: 'cancelled' });
    res.json({ data: booking, message: 'Booking cancelled' });
  } catch (err) { next(err); }
};

// GET /events/bookings/organizer/ - Organizer bookings
exports.getOrganizerBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Find all bookings for events organized by this user
    const events = await Event.findAll({ where: { organizerId: userId } });
    const eventIds = events.map(e => e.id);
    const bookings = await EventTicketBooking.findAll({ where: { event_id: eventIds } });
    res.json({ results: bookings });
  } catch (err) { next(err); }
};

// POST /events/bookings/:bookingId/checkin/ - Check-in attendee
exports.checkInAttendee = async (req, res, next) => {
  try {
    // Delegate to service which has multi-ticket support
    await service.checkInAttendee(req, res, next);
  } catch (err) {
    console.error('Error in checkInAttendee controller:', err);
    next(err);
  }
};


exports.getTicketStatus = async (req, res, next) => {
  try {
    await service.getTicketStatus(req, res, next);
  } catch (err) {
    console.error('Error in getTicketStatus controller:', err);
    next(err);
  }
};

// GET /events/:eventId/booking-details/ - Event booking details (paginated)
exports.getEventBookingDetails = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: bookings } = await EventTicketBooking.findAndCountAll({
      where: { event_id: eventId },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({
      results: bookings,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      }
    });
  } catch (err) { next(err); }
};

// GET /events/:eventId/booking-analytics/ - Analytics
exports.getBookingAnalytics = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    // Example: count bookings by status
    const bookings = await EventTicketBooking.findAll({ where: { event_id: eventId } });
    const analytics = {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      attended: bookings.filter(b => b.status === 'attended').length,
      no_show: bookings.filter(b => b.status === 'no_show').length,
      refunded: bookings.filter(b => b.status === 'refunded').length,
    };
    res.json({ data: analytics });
  } catch (err) { next(err); }
};

// GET /events/available/ - Available events
exports.getAvailableEvents = async (req, res, next) => {
  try {
    // For demo: return all published/public events
    const events = await Event.findAll({ where: { status: 'published', visibility: 'public' } });
    res.json({ results: events });
  } catch (err) { next(err); }
};

// GET /events/search/ - Search events
exports.searchEvents = async (req, res, next) => {
  try {
    const { q } = req.query;
    // For demo: search by title or description
    const events = await Event.findAll({
      where: {
        status: 'published',
        visibility: 'public',
        ...(q ? { title: { $iLike: `%${q}%` } } : {})
      }
    });
    res.json({ results: events });
  } catch (err) { next(err); }
};

// POST /events/discount/apply/ - Apply discount code
exports.applyDiscountCode = async (req, res, next) => {
  try {
    // For demo: always return 0 discount
    res.json({ data: { discount: 0, message: 'No discount logic implemented' } });
  } catch (err) { next(err); }
};

// POST /events/bookings/:bookingId/payment/ - Process payment for a booking
exports.processPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { paymentMethod, paymentDetails } = req.body;
    // Process payment logic here (call service)
    const result = await service.processPaymentForBooking(bookingId, paymentMethod, paymentDetails);
    res.json({ data: result });
  } catch (err) { next(err); }
};