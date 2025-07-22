import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import * as bookingService from "../services/bookingService";
import { paymentService } from "../services/paymentService";
import { X, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const GenericBooking = ({
  serviceType,
  serviceProvider,
  packages,
  onBookingSuccess,
  selectedPackage,
}: {
  serviceType: string;
  serviceProvider: any;
  packages: any[];
  onBookingSuccess?: (booking: any) => void;
  selectedPackage?: any;
}) => {
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    packageId: selectedPackage?.id || '',
    eventType: '',
    eventLocation: '',
    specialRequests: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackageState, setSelectedPackage] = useState<any>(null);
  const [latestBooking, setLatestBooking] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Pre-select package when selectedPackage changes
  useEffect(() => {
    if (selectedPackage && selectedPackage.id) {
      setBookingForm((prev) => ({ ...prev, packageId: selectedPackage.id }));
    }
  }, [selectedPackage]);

  // Booking logic function
  const handleCreateBooking = async () => {
    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(false);
    try {
      const { date, time, packageId, eventType, eventLocation, specialRequests } = bookingForm;
      if (!date || !time || !packageId || !eventType || !eventLocation) {
        setBookingError('Please fill all required booking fields.');
        setBookingLoading(false);
        return;
      }
      const selectedPkg = packages.find((pkg: any) => pkg.id === packageId);
      if (!selectedPkg) {
        setBookingError('Selected package not found.');
        setBookingLoading(false);
        return;
      }
      const bookingData: any = {
        serviceProviderId: serviceProvider?.user?.id || serviceProvider?.id,
        packageId,
        eventDate: date,
        eventTime: time,
        eventLocation,
        eventType,
        totalAmount: selectedPkg.basePrice,
        serviceType,
      };
      if (specialRequests && specialRequests.trim() !== '') {
        bookingData.specialRequests = specialRequests;
      }
      const allowedFields = [
        'serviceProviderId',
        'packageId',
        'eventDate',
        'eventTime',
        'eventLocation',
        'eventType',
        'totalAmount',
        'specialRequests',
        'serviceType',
      ];
      const bookingDataFiltered = Object.fromEntries(
        Object.entries(bookingData).filter(([key]) => allowedFields.includes(key))
      );
      await bookingService.createBooking(bookingDataFiltered);
      setBookingSuccess(true);
      toast.success(
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>
            Booking Complete!
          </div>
          <div>Your booking has been successfully placed.<br />Check your dashboard for details.</div>
        </div>,
        {
          icon: <CheckCircle className="w-8 h-8 text-green-400" />,
          duration: 6000,
        }
      );
      if (onBookingSuccess) onBookingSuccess(bookingDataFiltered);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  // Open booking modal for a package
  const openBookingModal = (pkg: any) => {
    setSelectedPackage(pkg);
    setBookingForm((prev) => ({
      ...prev,
      packageId: pkg.id,
    }));
    setShowBookingModal(true);
    setBookingError('');
    setBookingSuccess(false);
  };

  // Close modal and reset form
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedPackage(null);
    setBookingForm({
      date: '',
      time: '',
      packageId: '',
      eventType: '',
      eventLocation: '',
      specialRequests: '',
    });
    setBookingError('');
    setBookingSuccess(false);
  };

  // Fetch latest booking for this provider after booking success
  useEffect(() => {
    if (bookingSuccess && (serviceProvider?.user?.id || serviceProvider?.id)) {
      bookingService.getBookings().then((data: any) => {
        const bookings = Array.isArray(data?.data) ? data.data : [];
        const myBooking = bookings
          .filter((b: any) => b.serviceProviderId === (serviceProvider?.user?.id || serviceProvider?.id) && b.packageId === selectedPackageState?.id)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        setLatestBooking(myBooking);
        setPaymentStatus(myBooking?.paymentStatus || '');
      });
    }
  }, [bookingSuccess, serviceProvider, selectedPackageState]);

  // Payment handler
  const handlePayNow = async () => {
    if (!latestBooking) return;
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const res = await paymentService.initializeKhaltiPayment(latestBooking.id);
      const paymentUrl = res?.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setPaymentError('Failed to get payment URL.');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to initialize payment.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // On mount, check for pidx in URL and verify payment if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pidx = params.get('pidx');
    if (pidx) {
      setVerifying(true);
      paymentService.verifyKhaltiPayment(pidx)
        .then((res: any) => {
          if (res?.success) {
            toast.success('Payment verified successfully!');
            setPaymentStatus('paid');
          } else {
            toast.error('Payment verification failed.');
          }
        })
        .catch(() => {
          toast.error('Payment verification failed.');
        })
        .finally(() => {
          setVerifying(false);
          const url = new URL(window.location.href);
          url.searchParams.delete('pidx');
          window.history.replaceState({}, document.title, url.pathname);
        });
    }
  }, []);

  // Manual verify payment handler
  const handleManualVerify = async () => {
    if (!latestBooking?.khaltiTransactionId) {
      toast.error('No payment transaction to verify.');
      return;
    }
    setVerifying(true);
    try {
      const res = await paymentService.verifyKhaltiPayment(latestBooking.khaltiTransactionId);
      if (res?.success) {
        toast.success('Payment verified successfully!');
        setPaymentStatus('paid');
      } else {
        toast.error('Payment verification failed.');
      }
    } catch {
      toast.error('Payment verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  // Booking Modal UI
  return (
    <>
      <Dialog open={showBookingModal} onClose={closeBookingModal} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-auto">
            <Dialog.Title className="text-2xl font-bold mb-4 text-slate-800">Book {selectedPackageState?.name}</Dialog.Title>
            {bookingError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{bookingError}</div>}
            {bookingSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">Booking successful!</div>}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleCreateBooking();
                if (!bookingError) closeBookingModal();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold mb-1">Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-slate-300 rounded-xl"
                  value={bookingForm.date}
                  onChange={e => setBookingForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Time</label>
                <input
                  type="time"
                  className="w-full p-3 border border-slate-300 rounded-xl"
                  value={bookingForm.time}
                  onChange={e => setBookingForm(f => ({ ...f, time: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Event Type</label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-xl"
                  value={bookingForm.eventType}
                  onChange={e => setBookingForm(f => ({ ...f, eventType: e.target.value }))}
                  placeholder="e.g. Wedding, Birthday"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Event Location</label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-xl"
                  value={bookingForm.eventLocation}
                  onChange={e => setBookingForm(f => ({ ...f, eventLocation: e.target.value }))}
                  placeholder="e.g. Kathmandu"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Special Requests (optional)</label>
                <textarea
                  className="w-full p-3 border border-slate-300 rounded-xl"
                  value={bookingForm.specialRequests}
                  onChange={e => setBookingForm(f => ({ ...f, specialRequests: e.target.value }))}
                  placeholder="Any special requests?"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
            <button
              onClick={closeBookingModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </Dialog>

      {/* After booking modal, show latest booking and payment status */}
      {latestBooking && (
        <div className="max-w-xl mx-auto my-8 p-6 bg-white rounded-xl shadow border">
          <div className="mb-2 font-bold text-lg">Latest Booking</div>
          <div className="mb-1">Event Date: {latestBooking.eventDate}</div>
          <div className="mb-1">Event Time: {latestBooking.eventTime}</div>
          <div className="mb-1">Total Amount: Rs. {latestBooking.totalAmount}</div>
          <div className="mb-1">Payment Status: <span className="font-semibold">{paymentStatus || latestBooking.paymentStatus}</span></div>
          {latestBooking.status === 'confirmed_awaiting_payment' && (paymentStatus || latestBooking.paymentStatus) !== 'paid' && (
            <>
              <button
                className="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2"
                onClick={handlePayNow}
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Redirecting...' : 'Pay Now'}
              </button>
              <button
                className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={handleManualVerify}
                disabled={verifying}
              >
                {verifying ? 'Verifying...' : 'Verify Payment'}
              </button>
            </>
          )}
          {paymentError && <div className="text-red-600 mt-2">{paymentError}</div>}
        </div>
      )}
    </>
  );
};

export default GenericBooking; 