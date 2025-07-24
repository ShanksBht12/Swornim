import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @ts-ignore
import { getBookingById } from '../../../services/bookingService.js';
// @ts-ignore
import { paymentService } from '../../../services/paymentService.js';

const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLLS = 15; // 30 seconds total (15 * 2s)

const PaymentSuccessHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'verifying' | 'success' | 'error' | 'timeout'>('loading');
  const [error, setError] = useState('');
  const [pollCount, setPollCount] = useState(0);
  const timerRef = useRef<any>(null);
  const verificationDone = useRef(false);
  const isRedirecting = useRef(false); // Add flag to prevent multiple redirects

  const bookingId = searchParams.get('bookingId');
  const pidx = searchParams.get('pidx');
  const paymentStatus = searchParams.get('status');

  // Cleanup function
  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const verifyPayment = async () => {
    if (!pidx) {
      setStatus('error');
      setError('Missing payment information (pidx).');
      return false;
    }

    try {
      console.log('Verifying payment with pidx:', pidx);
      setStatus('verifying');
      
      const verificationResult = await paymentService.verifyKhaltiPayment(pidx);
      console.log('Payment verification result:', verificationResult);
      
      if (verificationResult.success) {
        console.log('Payment verified successfully');
        return true;
      } else {
        setStatus('error');
        setError(verificationResult.message || 'Payment verification failed');
        return false;
      }
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setStatus('error');
      setError('Payment verification failed: ' + (err.message || 'Unknown error'));
      return false;
    }
  };

  const checkBookingStatus = async () => {
    if (!bookingId || isRedirecting.current) {
      return false;
    }

    try {
      console.log('Checking booking status for:', bookingId);
      const booking = await getBookingById(bookingId);
      console.log('Booking data:', booking);
      
      if (booking && booking.data) {
        const bookingData = booking.data;
        
        // Check if booking is confirmed and paid
        if (bookingData.payment_status === 'paid' && bookingData.qr_code) {
          console.log('Booking is confirmed with QR code, redirecting...');
          isRedirecting.current = true; // Set flag to prevent duplicate redirects
          cleanup(); // Clean up timers before redirect
          navigate(`/events/ticket/${bookingId}`, { replace: true });
          return true;
        } else if (bookingData.payment_status === 'paid') {
          console.log('Booking is paid but no QR code yet, continuing to poll...');
          return false; // Continue polling
        } else {
          console.log('Booking not yet paid, payment_status:', bookingData.payment_status);
          return false; // Continue polling
        }
      } else {
        console.log('Booking not found or invalid response');
        return false;
      }
    } catch (err: any) {
      console.error('Error checking booking status:', err);
      return false;
    }
  };

  const startPolling = () => {
    if (isRedirecting.current) return; // Don't start polling if already redirecting
    
    console.log('Starting polling for booking status...');
    setStatus('loading');
    setPollCount(0);
    
    const poll = async () => {
      if (isRedirecting.current) return; // Stop if redirecting
      
      const success = await checkBookingStatus();
      if (success || isRedirecting.current) {
        cleanup();
        return;
      }

      setPollCount(prev => {
        const newCount = prev + 1;
        if (newCount >= MAX_POLLS) {
          cleanup();
          setStatus('timeout');
          return newCount;
        }
        return newCount;
      });
    };

    // Initial check
    poll();
    
    // Set up interval only if not redirecting
    if (!isRedirecting.current) {
      timerRef.current = setInterval(() => {
        if (isRedirecting.current) {
          cleanup();
          return;
        }
        poll();
      }, POLL_INTERVAL);
    }
  };

  useEffect(() => {
    const handlePaymentFlow = async () => {
      // Prevent running if already redirecting
      if (isRedirecting.current) return;
      
      console.log('Payment success handler started with params:', {
        bookingId,
        pidx,
        paymentStatus
      });

      // Check if we have required parameters
      if (!bookingId || !pidx) {
        setStatus('error');
        setError('Missing required payment information.');
        return;
      }

      // Check if payment status indicates failure
      if (paymentStatus === 'Canceled' || paymentStatus === 'Failed') {
        setStatus('error');
        setError(`Payment ${paymentStatus.toLowerCase()}. Please try again.`);
        return;
      }

      // Step 1: Verify payment with Khalti (only once)
      if (!verificationDone.current) {
        verificationDone.current = true;
        const paymentVerified = await verifyPayment();
        
        if (!paymentVerified || isRedirecting.current) {
          return; // Error already set in verifyPayment or redirecting
        }
      }

      // Step 2: Start polling for booking confirmation
      if (!isRedirecting.current) {
        startPolling();
      }
    };

    handlePaymentFlow();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [bookingId, pidx, paymentStatus, navigate]);

  const handleRetry = () => {
    if (isRedirecting.current) return; // Don't retry if redirecting
    
    verificationDone.current = false;
    setError('');
    cleanup();
    
    // Restart the flow
    const handlePaymentFlow = async () => {
      if (!bookingId || !pidx) {
        setStatus('error');
        setError('Missing required payment information.');
        return;
      }

      const paymentVerified = await verifyPayment();
      if (paymentVerified && !isRedirecting.current) {
        startPolling();
      }
    };

    handlePaymentFlow();
  };

  const handleGoToDashboard = () => {
    cleanup(); // Clean up before navigation
    isRedirecting.current = true;
    navigate('/dashboard', { replace: true });
  };

  // Render different states
  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button 
              onClick={handleGoToDashboard}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'timeout') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-xl font-bold text-yellow-600 mb-2">Processing Timeout</h2>
          <p className="text-gray-600 mb-4">
            Your payment was successful, but ticket confirmation is taking longer than expected.
            Please check your dashboard in a few minutes.
          </p>
          <div className="space-y-2">
            <button 
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Check Again
            </button>
            <button 
              onClick={handleGoToDashboard}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading states
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow-md">
      <div className="text-center">
        <div className="text-6xl mb-4">
          {status === 'verifying' ? '🔄' : '⏳'}
        </div>
        <h2 className="text-xl font-bold text-blue-600 mb-2">
          {status === 'verifying' ? 'Verifying Payment' : 'Processing Ticket'}
        </h2>
        <p className="text-gray-600 mb-4">
          {status === 'verifying' 
            ? 'Please wait while we verify your payment...' 
            : `Generating your ticket... (${pollCount}/${MAX_POLLS})`
          }
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        {status === 'loading' && pollCount > 5 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-3">
              This is taking longer than usual. Your payment was successful, 
              and your ticket will be ready shortly.
            </p>
            <button 
              onClick={handleGoToDashboard}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Go to Dashboard (Ticket will be available there)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessHandler;