// event_ticket_booking.service.js
// Complete file with multi-ticket functionality
const EventTicketBooking = require('./event_ticket_booking.model');
const Event = require('../event/event.model');
const paymentService = require('../payment/payment.service');
const { v4: uuidv4 } = require('uuid');

function generateQRCode() {
  return uuidv4();
}

// Helper function to generate individual ticket data
function generateTicketInstances(bookingId, quantity) {
  const tickets = [];
  for (let i = 1; i <= quantity; i++) {
    tickets.push({
      ticketNumber: i,
      qrCode: `${bookingId}-T${i}`,
      status: 'active', // active, checked_in, cancelled
      checkedInAt: null,
      checkedInBy: null
    });
  }
  return tickets;
}

// UPDATED: Enhanced booking creation with multi-ticket support
exports.createBookingWithPayment = async (body, userId) => {
  // Accept both camelCase and snake_case
  const event_id = body.event_id || body.eventId;
  const ticket_type = body.ticket_type || body.ticketType;
  const quantity = body.quantity || body.number_of_tickets;
  const payment_method = body.payment_method || body.paymentMethod;
  const ticket_holder_details = body.ticket_holder_details || body.ticketHolderDetails;
  const special_requests = body.special_requests || body.specialRequests;

  // 1. Validate event
  const event = await Event.findByPk(event_id);
  if (!event || event.status !== 'published' || event.visibility !== 'public') {
    return { error: 'Event not available for booking', status: 400 };
  }

  // 2. Check ticket availability (implement logic as needed)
  // TODO: Check event.maxCapacity - ticketsSold >= quantity

  // 3. Calculate price
  const price_per_ticket = event.ticketPrice;
  const total_amount = price_per_ticket * quantity;

  // 4. Create booking with payment_status: 'pending' and enhanced ticket tracking
  const booking = await EventTicketBooking.create({
    event_id, 
    user_id: userId, 
    ticket_type, 
    quantity, 
    price_per_ticket, 
    total_amount,
    payment_status: 'pending', 
    booking_status: 'confirmed',
    ticket_holder_details: {
      ...ticket_holder_details,
      // Store individual ticket instances in existing JSONB field
      ticketInstances: generateTicketInstances(null, quantity), // Will update with actual booking ID
      originalQuantity: quantity,
      createdAt: new Date().toISOString()
    },
    special_requests,
  });

  // 5. Update ticket instances with actual booking ID
  const ticketInstances = generateTicketInstances(booking.id, quantity);
  await booking.update({
    qr_code: booking.id, // Main booking QR code
    ticket_holder_details: {
      ...booking.ticket_holder_details,
      ticketInstances
    }
  });

  // 6. Initiate payment with real payment service (e.g., Khalti/eSewa)
  // This should return a payment URL/token for the frontend
  const paymentInit = await paymentService.initializeKhaltiPayment(booking.id, userId);
  if (!paymentInit || !paymentInit.paymentUrl) {
    return { error: 'Failed to initiate payment', status: 500 };
  }

  // 7. Return booking ID and payment URL/token to frontend
  return { 
    success: true, 
    bookingId: booking.id, 
    paymentUrl: paymentInit.paymentUrl, 
    ticketCount: quantity,
    status: 201 
  };
};

// UNCHANGED: Payment verification
exports.verifyPaymentAndConfirmBooking = async (bookingId, userId) => {
  // Call payment service to verify payment
  const paymentVerified = await paymentService.verifyKhaltiPayment(bookingId, userId);
  if (!paymentVerified || !paymentVerified.success) {
    return { error: 'Payment not verified', status: 402 };
  }
  // Update booking to paid and generate QR code
  const booking = await EventTicketBooking.findByPk(bookingId);
  if (!booking) {
    return { error: 'Booking not found', status: 404 };
  }
  const qr_code = generateQRCode();
  await booking.update({ payment_status: 'paid', qr_code });
  return { success: true, data: booking, qrCode: qr_code };
};

// UNCHANGED: Process payment for booking
exports.processPaymentForBooking = async (bookingId, paymentMethod, paymentDetails) => {
  const booking = await EventTicketBooking.findByPk(bookingId);
  if (!booking) {
    return { error: 'Booking not found', status: 404 };
  }

  // Process payment with the specified method (call your real payment service)
  const paymentResult = await paymentService.processPayment(bookingId, paymentMethod, paymentDetails);

  if (paymentResult.success) {
    await booking.update({
      payment_status: 'paid',
      payment_method: paymentMethod,
      payment_date: new Date(),
      qr_code: generateQRCode()
    });
  }

  return paymentResult;
};

// NEW: Multi-ticket PDF generation
exports.downloadTicket = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await EventTicketBooking.findByPk(bookingId);
    if (!booking || booking.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const event = await Event.findByPk(booking.event_id);

    // Get ticket instances from existing JSONB field
    const ticketInstances = booking.ticket_holder_details?.ticketInstances || [];
    const ticketQuantity = ticketInstances.length || booking.quantity || 1;
    
    console.log(`Generating ${ticketQuantity} tickets for booking ${bookingId}`);

    const PDFDocument = require('pdfkit');
    const QRCode = require('qrcode');

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      bufferPages: true,
      info: {
        Title: `Event Tickets - ${event?.title || 'Event'} (${ticketQuantity} tickets)`,
        Author: 'Swornim Events',
        Subject: 'Official Event Tickets',
        Keywords: 'ticket, event, admission'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=swornim-tickets-${bookingId}-${ticketQuantity}pcs.pdf`);
    doc.pipe(res);

    // Generate tickets based on stored instances
    for (let i = 0; i < ticketQuantity; i++) {
      if (i > 0) {
        doc.addPage();
      }

      const ticketInstance = ticketInstances[i] || {
        ticketNumber: i + 1,
        qrCode: `${booking.id}-T${i + 1}`,
        status: 'active'
      };

      await generateSingleTicketPage(doc, booking, event, ticketInstance, ticketQuantity, req.user);
    }

    doc.end();

  } catch (err) {
    console.error('Error generating ticket PDF:', err);
    next(err);
  }
};

// NEW: Helper function to generate single ticket page
async function generateSingleTicketPage(doc, booking, event, ticketInstance, totalTickets, user) {
  const QRCode = require('qrcode');
  const qrDataUrl = await QRCode.toDataURL(ticketInstance.qrCode, { width: 200, margin: 1 });

  // Page styling constants
  const pageWidth = doc.page.width;
  const margin = 40;
  const contentWidth = pageWidth - 2 * margin;
  const primaryBlue = '#2563EB';
  const darkText = '#0F172A';
  const grayText = '#64748B';
  const lightGray = '#F8FAFC';
  const successGreen = '#10B981';
  const borderGray = '#E2E8F0';

  let currentY = 40;

  // Header Section
  doc.fillColor(darkText)
     .fontSize(32)
     .font('Helvetica-Bold')
     .text('SWORNIM', margin, currentY);

  doc.fontSize(14)
     .font('Helvetica')
     .fillColor(grayText)
     .text('Your Event Ally', margin, currentY + 35);

  // Ticket number and status
  doc.fontSize(12)
     .fillColor(primaryBlue)
     .text(`Ticket ${ticketInstance.ticketNumber} of ${totalTickets}`, margin, currentY + 55);

  // Status badge
  const statusColor = ticketInstance.status === 'checked_in' ? '#EF4444' : successGreen;
  const statusText = ticketInstance.status === 'checked_in' ? 'USED' : 'VALID';
  
  const badgeX = pageWidth - margin - 130;
  doc.roundedRect(badgeX, currentY, 130, 30, 15)
     .fillAndStroke(statusColor, statusColor);
  
  doc.fillColor('white')
     .fontSize(12)
     .font('Helvetica-Bold')
     .text(statusText, badgeX + 35, currentY + 8);

  currentY += 80;

  // Main content area
  doc.strokeColor(borderGray)
     .lineWidth(1)
     .moveTo(margin, currentY)
     .lineTo(pageWidth - margin, currentY)
     .stroke();

  currentY += 30;

  // Ticket container
  const ticketHeight = 580;
  doc.roundedRect(margin, currentY, contentWidth, ticketHeight, 20)
     .fillAndStroke('white', borderGray);

  // Event title
  const titleY = currentY + 20;
  doc.roundedRect(margin + 10, titleY, contentWidth - 20, 70, 15)
     .fillAndStroke(lightGray, borderGray);

  const eventTitle = event?.title || 'Event Title';
  doc.fillColor(darkText)
     .fontSize(24)
     .font('Helvetica-Bold')
     .text(eventTitle, margin + 25, titleY + 15, {
       width: contentWidth - 50,
       ellipsis: true
     });

  // Two column layout
  const contentY = titleY + 90;
  const leftColumnWidth = (contentWidth - 40) / 2;
  const rightColumnX = margin + 25 + leftColumnWidth + 20;

  // Left column - Event details
  let leftY = contentY;
  doc.fillColor(grayText)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('EVENT DETAILS', margin + 25, leftY);

  leftY += 25;

  // Event information
  const eventDate = event?.eventDate ? new Date(event.eventDate) : new Date();
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const eventDetails = [
    ['Date:', formattedDate],
    ['Time:', event?.eventTime || 'TBA'],
    ['Venue:', event?.venue || 'Venue TBA'],
    ['Type:', booking.ticket_type || 'General']
  ];

  eventDetails.forEach(([label, value]) => {
    doc.fillColor(darkText)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(label, margin + 25, leftY);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(value, margin + 25, leftY + 15, {
         width: leftColumnWidth
       });
    
    leftY += 35;
  });

  // Ticket specific info
  leftY += 20;
  doc.fillColor(grayText)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('TICKET INFO', margin + 25, leftY);

  leftY += 20;

  const ticketInfo = [
    ['Ticket #:', `${ticketInstance.ticketNumber}/${totalTickets}`],
    ['Holder:', user.name || 'Guest'],
    ['Booking:', booking.id.substring(0, 8) + '...']
  ];

  ticketInfo.forEach(([label, value]) => {
    doc.fillColor(darkText)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(label, margin + 25, leftY);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(value, margin + 80, leftY);
    
    leftY += 18;
  });

  // Right column - QR Code
  let rightY = contentY;
  doc.fillColor(grayText)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('ADMISSION QR CODE', rightColumnX, rightY);

  rightY += 25;

  // QR Code container
  const qrBoxSize = 160;
  doc.roundedRect(rightColumnX, rightY, qrBoxSize, qrBoxSize, 10)
     .fillAndStroke(lightGray, borderGray);

  // QR Code image
  const qrSize = 120;
  const qrX = rightColumnX + (qrBoxSize - qrSize) / 2;
  const qrY = rightY + (qrBoxSize - qrSize) / 2;
  doc.image(qrDataUrl, qrX, qrY, { width: qrSize, height: qrSize });

  rightY += qrBoxSize + 15;

  // QR instructions
  doc.fillColor(grayText)
     .fontSize(10)
     .font('Helvetica')
     .text('Present this code at entrance', rightColumnX, rightY, {
       width: qrBoxSize,
       align: 'center'
     });

  rightY += 30;

  // Ticket reference
  doc.fillColor(grayText)
     .fontSize(11)
     .font('Helvetica-Bold')
     .text('REFERENCE', rightColumnX, rightY);

  doc.fillColor(primaryBlue)
     .fontSize(9)
     .font('Helvetica')
     .text(ticketInstance.qrCode, rightColumnX, rightY + 15, {
       width: qrBoxSize
     });

  // Check-in status
  if (ticketInstance.checkedInAt) {
    rightY += 40;
    doc.fillColor('#EF4444')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('CHECKED IN:', rightColumnX, rightY);
    
    doc.fontSize(8)
       .font('Helvetica')
       .text(new Date(ticketInstance.checkedInAt).toLocaleString(), rightColumnX, rightY + 12);
  }

  // Terms section
  const separatorY = currentY + ticketHeight - 100;
  for (let i = margin + 20; i < pageWidth - margin - 20; i += 8) {
    doc.circle(i, separatorY, 1)
       .fillAndStroke(grayText, grayText);
  }

  const termsY = separatorY + 15;
  doc.fillColor(grayText)
     .fontSize(10)
     .font('Helvetica-Bold')
     .text('TERMS: Non-transferable • One person only • ID required • No refunds', margin + 25, termsY, {
       width: contentWidth - 50
     });

  // Watermark
  doc.save();
  doc.translate(pageWidth / 2, doc.page.height / 2);
  doc.rotate(-45);
  doc.fillOpacity(0.05)
     .fillColor(primaryBlue)
     .fontSize(50)
     .font('Helvetica-Bold')
     .text(`T${ticketInstance.ticketNumber}`, -30, -15);
  doc.restore();
}

// UPDATED: Enhanced check-in with multi-ticket support
exports.checkInAttendee = async (req, res, next) => {
  try {
    const { bookingId } = req.params; // Scanned QR code
    const userId = req.user.id;
    
    console.log('Check-in attempt:', { scannedValue: bookingId, organizerId: userId });

    // Parse QR code format: "booking-uuid-T1", "booking-uuid-T2", etc.
    let actualBookingId = bookingId;
    let ticketNumber = null;
    
    const ticketMatch = bookingId.match(/^(.+)-T(\d+)$/);
    if (ticketMatch) {
      actualBookingId = ticketMatch[1];
      ticketNumber = parseInt(ticketMatch[2]);
    }
    
    // Find booking
    let booking = await EventTicketBooking.findByPk(actualBookingId);
    if (!booking) {
      booking = await EventTicketBooking.findOne({ where: { qr_code: actualBookingId } });
    }
    
    if (!booking) {
      return res.status(404).json({ data: null, message: 'Ticket not found' });
    }

    // Verify organizer authorization
    const event = await Event.findByPk(booking.event_id);
    if (!event) {
      return res.status(404).json({ data: null, message: 'Event not found' });
    }
    
    const eventOrganizerId = event.organizer_id || event.organizerId;
    if (eventOrganizerId !== userId) {
      return res.status(403).json({ data: null, message: 'Not authorized' });
    }
    
    // Validate payment status
    if (booking.payment_status !== 'paid') {
      return res.status(400).json({ 
        data: booking, 
        message: 'Payment not completed' 
      });
    }
    
    if (['cancelled', 'refunded'].includes(booking.status)) {
      return res.status(400).json({ 
        data: booking, 
        message: `Ticket is ${booking.status}` 
      });
    }

    // Get ticket instances from JSONB field
    const ticketDetails = booking.ticket_holder_details || {};
    let ticketInstances = ticketDetails.ticketInstances || [];
    
    // If no instances exist, create them (backward compatibility)
    if (ticketInstances.length === 0) {
      ticketInstances = [];
      for (let i = 1; i <= booking.quantity; i++) {
        ticketInstances.push({
          ticketNumber: i,
          qrCode: `${booking.id}-T${i}`,
          status: 'active',
          checkedInAt: null,
          checkedInBy: null
        });
      }
    }

    // Find the specific ticket
    let targetTicket = null;
    if (ticketNumber) {
      targetTicket = ticketInstances.find(t => t.ticketNumber === ticketNumber);
      if (!targetTicket) {
        return res.status(400).json({
          data: null,
          message: `Ticket ${ticketNumber} not found in this booking`
        });
      }
    } else {
      // Find first available ticket
      targetTicket = ticketInstances.find(t => t.status === 'active');
      if (!targetTicket) {
        return res.status(400).json({
          data: booking,
          message: 'All tickets have been used',
          alreadyCheckedIn: true
        });
      }
    }

    // Check if already used
    if (targetTicket.status === 'checked_in') {
      return res.status(400).json({
        data: booking,
        message: `Ticket ${targetTicket.ticketNumber} already checked in`,
        alreadyCheckedIn: true,
        checkedInAt: targetTicket.checkedInAt
      });
    }

    // Perform check-in
    targetTicket.status = 'checked_in';
    targetTicket.checkedInAt = new Date().toISOString();
    targetTicket.checkedInBy = userId;

    // Count checked in tickets
    const checkedInCount = ticketInstances.filter(t => t.status === 'checked_in').length;
    const allCheckedIn = checkedInCount === booking.quantity;

    // Update booking
    await booking.update({
      ticket_holder_details: {
        ...ticketDetails,
        ticketInstances,
        lastCheckedInAt: new Date().toISOString(),
        checkedInCount
      },
      status: allCheckedIn ? 'attended' : 'confirmed'
    });

    console.log('Check-in successful:', {
      bookingId: booking.id,
      ticketNumber: targetTicket.ticketNumber,
      checkedInCount,
      totalTickets: booking.quantity
    });
    
    res.json({ 
      data: booking,
      message: `Ticket ${targetTicket.ticketNumber} checked in successfully`,
      ticketNumber: targetTicket.ticketNumber,
      totalTickets: booking.quantity,
      checkedInCount,
      allTicketsUsed: allCheckedIn
    });
    
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({
      data: null,
      message: 'Server error during check-in'
    });
  }
};

// NEW: Get detailed ticket status
exports.getTicketStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await EventTicketBooking.findByPk(bookingId);
    
    if (!booking || booking.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const ticketDetails = booking.ticket_holder_details || {};
    const ticketInstances = ticketDetails.ticketInstances || [];
    const checkedInCount = ticketInstances.filter(t => t.status === 'checked_in').length;

    res.json({
      data: {
        bookingId: booking.id,
        totalTickets: booking.quantity,
        checkedInCount,
        ticketInstances: ticketInstances.map(t => ({
          ticketNumber: t.ticketNumber,
          status: t.status,
          checkedInAt: t.checkedInAt,
          qrCode: t.qrCode
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};