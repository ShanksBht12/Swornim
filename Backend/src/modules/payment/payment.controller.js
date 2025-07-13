const paymentService = require('./payment.service');
const { UserType } = require('../../config/constants');

// Initialize Khalti payment for a booking
async function initializeKhaltiPayment(req, res, next) {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id || req.loggedInUser?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        status: 'UNAUTHORIZED'
      });
    }

    const result = await paymentService.initializeKhaltiPayment(bookingId, userId);
    
    res.json({
      success: true,
      data: result,
      message: "Payment initialized successfully",
      status: "PAYMENT_INITIALIZED"
    });

  } catch (error) {
    console.error('Initialize payment error:', error);
    
    if (error.code) {
      return res.status(error.code).json({
        error: error.message,
        status: error.status
      });
    }
    
    next(error);
  }
}

// Verify Khalti payment callback
async function verifyKhaltiPayment(req, res, next) {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({
        error: 'Payment ID (pidx) is required',
        status: 'MISSING_PIDX'
      });
    }

    const result = await paymentService.verifyKhaltiPayment(pidx);
    
    res.json({
      success: result.success,
      data: result,
      message: result.message,
      status: result.success ? "PAYMENT_VERIFIED" : "PAYMENT_FAILED"
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    
    if (error.code) {
      return res.status(error.code).json({
        error: error.message,
        status: error.status
      });
    }
    
    next(error);
  }
}

// Get payment status for a booking
async function getPaymentStatus(req, res, next) {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id || req.loggedInUser?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        status: 'UNAUTHORIZED'
      });
    }

    const result = await paymentService.getPaymentStatus(bookingId, userId);
    
    res.json({
      success: true,
      data: result,
      message: "Payment status retrieved successfully",
      status: "PAYMENT_STATUS_RETRIEVED"
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    
    if (error.code) {
      return res.status(error.code).json({
        error: error.message,
        status: error.status
      });
    }
    
    next(error);
  }
}

// Get payment history for a user
async function getPaymentHistory(req, res, next) {
  try {
    const userId = req.user?.id || req.loggedInUser?.id;
    const userType = req.user?.userType === UserType.CLIENT ? 'client' : 'serviceProvider';

    if (!userId) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        status: 'UNAUTHORIZED'
      });
    }

    const result = await paymentService.getPaymentHistory(userId, userType);
    
    res.json({
      success: true,
      data: result,
      message: "Payment history retrieved successfully",
      status: "PAYMENT_HISTORY_RETRIEVED"
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    next(error);
  }
}

// Khalti payment callback endpoint (for webhook)
async function khaltiCallback(req, res, next) {
  try {
    const { pidx, status, amount, transaction_id } = req.body;

    console.log('Khalti callback received:', {
      pidx,
      status,
      amount,
      transaction_id
    });

    // Verify the payment
    const result = await paymentService.verifyKhaltiPayment(pidx);
    
    // Return success to Khalti
    res.json({
      success: true,
      message: "Payment processed successfully"
    });

  } catch (error) {
    console.error('Khalti callback error:', error);
    
    // Still return success to Khalti to prevent retries
    res.json({
      success: false,
      message: "Payment processing failed"
    });
  }
}

// Test Khalti configuration
async function testKhaltiConfig(req, res, next) {
  try {
    const { AppConfig } = require('../../config/config');
    const baseUrl = AppConfig.khaltiBaseUrl.replace(/\/$/, '');
    
    res.json({
      success: true,
      config: {
        khaltiBaseUrl: AppConfig.khaltiBaseUrl,
        cleanBaseUrl: baseUrl,
        fullInitiateUrl: `${baseUrl}/epayment/initiate/`,
        hasSecretKey: !!AppConfig.khaltiSecretKey,
        hasPublicKey: !!AppConfig.khaltiPublicKey,
        frontendUrl: AppConfig.frontendUrl
      },
      message: "Khalti configuration loaded successfully"
    });

  } catch (error) {
    console.error('Test Khalti config error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Update payment status for a booking
async function updatePaymentStatus(req, res, next) {
  try {
    const { bookingId } = req.params;
    const { status, pidx, verified_at } = req.body;
    const userId = req.user?.id || req.loggedInUser?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        status: 'UNAUTHORIZED'
      });
    }

    if (!status) {
      return res.status(400).json({
        error: 'Payment status is required',
        status: 'MISSING_STATUS'
      });
    }

    const result = await paymentService.updatePaymentStatus(bookingId, userId, {
      status,
      pidx,
      verified_at
    });
    
    res.json({
      success: true,
      data: result,
      message: "Payment status updated successfully",
      status: "PAYMENT_STATUS_UPDATED"
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    
    if (error.code) {
      return res.status(error.code).json({
        error: error.message,
        status: error.status
      });
    }
    
    next(error);
  }
}

// Payment success page (for Khalti redirect)
async function paymentSuccessPage(req, res, next) {
  try {
    const { bookingId, pidx } = req.query;
    
    console.log('Payment success page accessed:', { bookingId, pidx });
    
    // Create a simple HTML page that will work in WebView
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Success - Swornim</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            margin: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 100%;
        }
        .success-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        h1 {
            margin: 0 0 20px 0;
            font-size: 28px;
        }
        p {
            margin: 0 0 20px 0;
            font-size: 16px;
            line-height: 1.5;
        }
        .booking-id {
            background: rgba(255, 255, 255, 0.2);
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            font-family: monospace;
        }
        .pidx {
            background: rgba(255, 255, 255, 0.2);
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            font-family: monospace;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Your payment has been processed successfully.</p>
        ${bookingId ? `<div class="booking-id">Booking ID: ${bookingId}</div>` : ''}
        ${pidx ? `<div class="pidx">Transaction ID: ${pidx}</div>` : ''}
        <p>You can close this window and return to the app.</p>
    </div>
    <script>
        // Auto-close after 5 seconds
        setTimeout(function() {
            window.close();
        }, 5000);
        
        // Log the URL parameters for debugging
        console.log('Payment success page loaded with:', {
            bookingId: '${bookingId}',
            pidx: '${pidx}',
            url: window.location.href
        });
    </script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Payment success page error:', error);
    res.status(500).send('Payment success page error');
  }
}

module.exports = {
  initializeKhaltiPayment,
  verifyKhaltiPayment,
  getPaymentStatus,
  getPaymentHistory,
  updatePaymentStatus,
  khaltiCallback,
  testKhaltiConfig,
  paymentSuccessPage
}; 