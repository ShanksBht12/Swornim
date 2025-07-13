const PaymentTransaction = require('./payment.model');
const Booking = require('../booking/booking.model');
const { AppConfig } = require('../../config/config');
const axios = require('axios');

class PaymentService {
  // Initialize Khalti payment for a booking
  async initializeKhaltiPayment(bookingId, userId) {
    try {
      console.log('Payment initialization request:', { bookingId, userId });
      
      // First, let's check if the booking exists at all
      const allBookings = await Booking.findAll({
        where: { clientId: userId }
      });
      
      console.log('All bookings for user:', allBookings.map(b => ({
        id: b.id,
        status: b.status,
        paymentStatus: b.paymentStatus
      })));
      // Find the booking and verify ownership
      const booking = await Booking.findOne({
        where: {
          id: bookingId,
          clientId: userId,
          status: ['pending_provider_confirmation', 'confirmed_awaiting_payment', 'confirmed_paid'],
          paymentStatus: ['pending', 'failed']
        }
      });

      if (!booking) {
        // Log the actual booking status for debugging
        const debugBooking = await Booking.findOne({
          where: { id: bookingId }
        });
        
        console.log('Debug booking info:', {
          bookingId,
          userId,
          found: !!debugBooking,
          status: debugBooking?.status,
          paymentStatus: debugBooking?.paymentStatus,
          clientId: debugBooking?.clientId
        });
        
        throw {
          code: 404,
          message: "Booking not found or payment already processed",
          status: "BOOKING_NOT_FOUND"
        };
      }

      // Check if booking is in correct state for payment
      if (booking.status === 'pending_provider_confirmation') {
        throw {
          code: 400,
          message: "Booking must be confirmed by provider before payment can be processed",
          status: "BOOKING_NOT_CONFIRMED"
        };
      }

      // Create payment transaction record
      const paymentTransaction = await PaymentTransaction.create({
        bookingId: booking.id,
        amount: booking.totalAmount,
        status: 'pending',
        paymentMethod: 'khalti'
      });

      // Prepare Khalti payment request
      const khaltiRequestData = {
        return_url: 'https://khalti.com/',
        website_url: AppConfig.frontendUrl,
        amount: Math.round(booking.totalAmount * 100), // Khalti expects amount in paisa
        purchase_order_id: booking.id,
        purchase_order_name: `Swornim-${booking.serviceType}-booking`,
        customer_info: {
          name: booking.client?.name || 'Customer',
          email: booking.client?.email || '',
          phone: booking.client?.phone || ''
        }
      };

      // Ensure the base URL is clean
      const baseUrl = AppConfig.khaltiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
      
      let khaltiData;
      
      // Make request to Khalti API
      try {
        console.log('Khalti API Request Data:', khaltiRequestData);
        const khaltiResponse = await axios.post(
          `${baseUrl}/epayment/initiate/`,
          khaltiRequestData,
          {
            headers: {
              Authorization: `Key ${AppConfig.khaltiSecretKey}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log('Khalti API Response:', khaltiResponse.data);
        khaltiData = khaltiResponse.data;
        // Check if the response contains the expected data
        if (!khaltiData.pidx || !khaltiData.payment_url) {
          throw {
            code: 400,
            message: "Invalid response from Khalti API",
            status: "KHALTI_INVALID_RESPONSE"
          };
        }
      } catch (axiosError) {
        console.error('Khalti API error:', axiosError.response?.data || axiosError.message);
        console.error('Khalti API URL:', `${baseUrl}/epayment/initiate/`);
        console.error('Khalti API Request Data:', khaltiRequestData);
        throw {
          code: axiosError.response?.status || 500,
          message: axiosError.response?.data?.message || "Failed to initialize Khalti payment",
          status: "KHALTI_INIT_FAILED"
        };
      }

      // Update payment transaction with Khalti response
      await paymentTransaction.update({
        khaltiTransactionId: khaltiData.pidx,
        khaltiPaymentUrl: khaltiData.payment_url,
        khaltiResponse: khaltiData
      });

      return {
        success: true,
        paymentUrl: khaltiData.payment_url,
        pidx: khaltiData.pidx,
        transactionId: paymentTransaction.id,
        message: "Payment initialized successfully"
      };

    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  // Verify Khalti payment callback
  async verifyKhaltiPayment(pidx) {
    try {
      // Find payment transaction by Khalti transaction ID
      const paymentTransaction = await PaymentTransaction.findOne({
        where: { khaltiTransactionId: pidx }
      });

      if (!paymentTransaction) {
        throw {
          code: 404,
          message: "Payment transaction not found",
          status: "TRANSACTION_NOT_FOUND"
        };
      }

      // Ensure the base URL is clean
      const baseUrl = AppConfig.khaltiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
      
      let verificationData;
      
      // Verify payment with Khalti
      try {
        const verificationResponse = await axios.post(
          `${baseUrl}/epayment/lookup/`,
          { pidx },
          {
            headers: {
              Authorization: `Key ${AppConfig.khaltiSecretKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        verificationData = verificationResponse.data;
      } catch (axiosError) {
        console.error('Khalti verification error:', axiosError.response?.data || axiosError.message);
        throw {
          code: axiosError.response?.status || 500,
          message: "Failed to verify payment with Khalti",
          status: "VERIFICATION_FAILED"
        };
      }

      // Update payment transaction status
      const isPaymentSuccessful = verificationData.status === 'Completed';
      
      await paymentTransaction.update({
        status: isPaymentSuccessful ? 'completed' : 'failed',
        khaltiResponse: verificationData,
        completedAt: isPaymentSuccessful ? new Date() : null,
        failureReason: isPaymentSuccessful ? null : verificationData.message || 'Payment failed'
      });

      // Update booking payment status
      if (isPaymentSuccessful) {
        const booking = await Booking.findByPk(paymentTransaction.bookingId);
        if (booking) {
          await booking.update({
            paymentStatus: 'paid',
            status: 'confirmed_paid'
          });
        }
      }

      return {
        success: isPaymentSuccessful,
        transaction: paymentTransaction,
        khaltiData: verificationData,
        message: isPaymentSuccessful ? "Payment verified successfully" : "Payment verification failed"
      };

    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  // Get payment status for a booking
  async getPaymentStatus(bookingId, userId) {
    try {
      const booking = await Booking.findOne({
        where: {
          id: bookingId,
          clientId: userId
        },
        include: [{
          model: PaymentTransaction,
          as: 'paymentTransactions',
          order: [['createdAt', 'DESC']],
          limit: 1
        }]
      });

      if (!booking) {
        throw {
          code: 404,
          message: "Booking not found",
          status: "BOOKING_NOT_FOUND"
        };
      }

      return {
        bookingId: booking.id,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount,
        latestTransaction: booking.paymentTransactions[0] || null
      };

    } catch (error) {
      console.error('Get payment status error:', error);
      throw error;
    }
  }

  // Update payment status for a booking
  async updatePaymentStatus(bookingId, userId, updateData) {
    try {
      console.log('Update payment status request:', { bookingId, userId, updateData });
      
      // Find the booking and verify ownership
      const booking = await Booking.findOne({
        where: {
          id: bookingId,
          clientId: userId
        }
      });

      if (!booking) {
        throw {
          code: 404,
          message: "Booking not found",
          status: "BOOKING_NOT_FOUND"
        };
      }

      // Find the latest payment transaction for this booking
      const paymentTransaction = await PaymentTransaction.findOne({
        where: { bookingId },
        order: [['createdAt', 'DESC']]
      });

      if (!paymentTransaction) {
        throw {
          code: 404,
          message: "Payment transaction not found",
          status: "TRANSACTION_NOT_FOUND"
        };
      }

      // Update payment transaction
      const updateFields = {
        status: updateData.status,
        completedAt: updateData.status === 'completed' ? new Date() : null
      };

      if (updateData.pidx) {
        updateFields.khaltiTransactionId = updateData.pidx;
      }

      if (updateData.verified_at) {
        updateFields.verifiedAt = new Date(updateData.verified_at);
      }

      await paymentTransaction.update(updateFields);

      // Update booking status based on payment status
      let bookingStatus = booking.status;
      let paymentStatus = booking.paymentStatus;

      if (updateData.status === 'completed') {
        paymentStatus = 'paid';
        bookingStatus = 'confirmed_paid';
      } else if (updateData.status === 'failed') {
        paymentStatus = 'failed';
        // Keep booking status as is, don't change to failed
      } else if (updateData.status === 'pending') {
        paymentStatus = 'pending';
        // Keep booking status as is
      }

      await booking.update({
        paymentStatus,
        status: bookingStatus
      });

      console.log('Payment status updated successfully:', {
        bookingId,
        paymentStatus,
        bookingStatus,
        transactionStatus: updateData.status
      });

      return {
        success: true,
        bookingId: booking.id,
        paymentStatus,
        bookingStatus,
        transactionStatus: updateData.status,
        message: "Payment status updated successfully"
      };

    } catch (error) {
      console.error('Update payment status error:', error);
      throw error;
    }
  }

  // Get payment history for a user
  async getPaymentHistory(userId, userType) {
    try {
      const whereClause = userType === 'client' 
        ? { clientId: userId }
        : { serviceProviderId: userId };

      const bookings = await Booking.findAll({
        where: whereClause,
        include: [{
          model: PaymentTransaction,
          as: 'paymentTransactions',
          order: [['createdAt', 'DESC']]
        }],
        order: [['createdAt', 'DESC']]
      });

      return bookings.map(booking => ({
        bookingId: booking.id,
        serviceType: booking.serviceType,
        eventDate: booking.eventDate,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        transactions: booking.paymentTransactions
      }));

    } catch (error) {
      console.error('Get payment history error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService(); 