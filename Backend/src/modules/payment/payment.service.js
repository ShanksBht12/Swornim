const PaymentTransaction = require('./payment.model');
const Booking = require('../booking/booking.model');
const EventTicketBooking = require('../event_ticket_booking/event_ticket_booking.model');
const EventTicketPaymentTransaction = require('../event_ticket_booking/event_ticket_payment_transaction.model');
const User = require('../user/user.model');
const { AppConfig } = require('../../config/config');
const axios = require('axios');

class PaymentService {
  // Initialize Khalti payment for a booking
  async initializeKhaltiPayment(bookingId, userId) {
    try {
      console.log('Payment initialization request:', { bookingId, userId });
      // First, try classic Booking model
      let booking = await Booking.findOne({
        where: {
          id: bookingId,
          clientId: userId,
          status: ['pending_provider_confirmation', 'confirmed_awaiting_payment', 'confirmed_paid'],
          paymentStatus: ['pending', 'failed']
        }
      });
      // If not found, try EventTicketBooking model
      if (!booking) {
        booking = await EventTicketBooking.findOne({
          where: {
            id: bookingId,
            user_id: userId,
            status: ['pending', 'confirmed', 'cancelled', 'attended', 'no_show', 'refunded'], // Only valid ENUM values
            payment_status: ['pending', 'failed']
          }
        });
        if (!booking) {
          // Log the actual booking status for debugging
          const debugBooking = await EventTicketBooking.findOne({ where: { id: bookingId } });
          console.log('Debug booking info:', {
            bookingId,
            userId,
            found: !!debugBooking,
            status: debugBooking?.status,
            paymentStatus: debugBooking?.payment_status,
            user_id: debugBooking?.user_id
          });
          throw {
            code: 404,
            message: "Booking not found or payment already processed",
            status: "BOOKING_NOT_FOUND"
          };
        }
        // For event ticket bookings, use EventTicketPaymentTransaction
        // Fetch user info for customer_info
        const user = await User.findByPk(userId);
        const customerName = user?.name || 'Customer';
        const customerEmail = user?.email || '';
        const customerPhone = user?.phone || '';
        const paymentTransaction = await EventTicketPaymentTransaction.create({
          booking_id: booking.id,
          amount: booking.total_amount,
          status: 'pending',
          payment_method: 'khalti'
        });

        // Prepare Khalti payment request for event ticket booking
        const khaltiRequestData = {
          return_url: 'https://khalti.com/payment-success', // Use your real homepage or thank you page
          website_url: AppConfig.frontendUrl,
          amount: Math.round(booking.total_amount * 100), // Khalti expects amount in paisa
          purchase_order_id: booking.id,
          purchase_order_name: `Swornim-event-ticket-booking`,
          customer_info: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone
          }
        };

        // Ensure the base URL is clean
        const baseUrl = AppConfig.khaltiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
        let khaltiData;
        try {
          console.log('Khalti API Request Data (event ticket):', khaltiRequestData);
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
          console.log('Khalti API Response (event ticket):', khaltiResponse.data);
          khaltiData = khaltiResponse.data;
          if (!khaltiData.pidx || !khaltiData.payment_url) {
            throw {
              code: 400,
              message: "Invalid response from Khalti API",
              status: "KHALTI_INVALID_RESPONSE"
            };
          }
        } catch (axiosError) {
          console.error('Khalti API error (event ticket):', axiosError.response?.data || axiosError.message);
          throw {
            code: axiosError.response?.status || 500,
            message: axiosError.response?.data?.message || "Failed to initialize Khalti payment",
            status: "KHALTI_INIT_FAILED"
          };
        }

        // Update payment transaction with Khalti response
        await paymentTransaction.update({
          khalti_transaction_id: khaltiData.pidx,
          khalti_payment_url: khaltiData.payment_url,
          khalti_response: khaltiData
        });

        return {
          success: true,
          paymentUrl: khaltiData.payment_url,
          pidx: khaltiData.pidx,
          transactionId: paymentTransaction.id,
          message: "Event ticket payment initialized successfully"
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
        return_url: 'http://localhost:5173/dashboard',
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

  // Verify Khalti payment callback - FIXED VERSION
  async verifyKhaltiPayment(pidx) {
    try {
      console.log('Verifying payment with pidx:', pidx);

      // Find payment transaction by Khalti transaction ID
      const paymentTransaction = await PaymentTransaction.findOne({
        where: { khaltiTransactionId: pidx }
      });

      if (!paymentTransaction) {
        // MAIN FIX: Return response instead of throwing error
        return {
          success: false,
          message: "Payment transaction not found - may be already processed",
          status: "TRANSACTION_NOT_FOUND"
        };
      }

      // MAIN FIX: Check if already verified to prevent re-processing
      if (paymentTransaction.status === 'completed') {
        return {
          success: true,
          transaction: paymentTransaction,
          message: "Payment already verified successfully",
          status: "ALREADY_VERIFIED"
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
        // MAIN FIX: Return response instead of throwing
        return {
          success: false,
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
      // MAIN FIX: Return response instead of throwing
      return {
        success: false,
        message: error.message || "Payment verification failed",
        status: "VERIFICATION_ERROR"
      };
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