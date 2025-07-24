import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// @ts-ignore
import { eventService } from '../../../services/eventService.js';
// @ts-ignore
import { bookEventTickets } from '../../../services/bookingService.js';
import { Calendar, MapPin, Users, DollarSign, Ticket as TicketIcon, ImageIcon } from 'lucide-react';
// @ts-ignore
import { paymentService } from '../../../services/paymentService.js';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState('regular');
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    eventService.getEventById(id)
      .then((data: any) => setEvent(data))
      .catch(() => setError('Failed to load event details'))
      .finally(() => setLoading(false));

    // Payment verification logic
    const params = new URLSearchParams(window.location.search);
    const pidx = params.get('pidx');
    if (pidx) {
      setVerifyingPayment(true);
      paymentService.verifyKhaltiPayment(pidx)
        .then((res) => {
          // Try to get bookingId from response
          // @ts-ignore
          const bookingId = res?.data?.booking?.id || res?.booking?.id;
          if (bookingId) {
            navigate(`/ticket/${bookingId}`);
          } else {
            setBookingError('Payment verified but booking not found.');
          }
        })
        .catch(() => setBookingError('Payment verification failed.'))
        .finally(() => setVerifyingPayment(false));
    }
  }, [id, navigate]);

  const handleBookTickets = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');
    try {
      if (!event) throw new Error('Event not loaded');
      if (quantity < 1) throw new Error('Quantity must be at least 1');
      if (event.availableTickets !== undefined && quantity > event.availableTickets) {
        throw new Error('Not enough tickets available');
      }
      const res = await bookEventTickets({
        event_id: event.id,
        ticket_type: ticketType,
        quantity,
      });
      if (res && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        setBookingError(res.error || 'Failed to initiate payment');
      }
    } catch (err: any) {
      setBookingError(err.message || 'Failed to book tickets');
    } finally {
      setBookingLoading(false);
    }
  };

  if (verifyingPayment) {
    return <div className="flex min-h-screen items-center justify-center text-lg text-blue-600">Verifying payment...</div>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg text-slate-500">Loading event details...</div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg text-red-500">{error || 'Event not found.'}</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-8">
      <div className="mb-6">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-64 object-cover rounded-xl" />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center rounded-xl">
            <ImageIcon className="w-16 h-16 text-slate-400" />
          </div>
        )}
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">{event.title}</h1>
      <p className="text-slate-600 text-base mb-4">{event.description}</p>
      <div className="space-y-3 mb-6">
        {event.eventDate && (
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.eventDate).toLocaleDateString()}</span>
            {event.eventTime && <span>at {event.eventTime}</span>}
          </div>
        )}
        {event.location?.name && (
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>{event.location.name}</span>
          </div>
        )}
        {event.maxCapacity && (
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Users className="w-4 h-4" />
            <span>Max {event.maxCapacity} attendees</span>
          </div>
        )}
        {typeof event.availableTickets === 'number' && (
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <TicketIcon className="w-4 h-4" />
            <span>{event.availableTickets} tickets available</span>
          </div>
        )}
        {event.ticketPrice && (
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <span>Rs. {event.ticketPrice}</span>
          </div>
        )}
      </div>
      {/* Ticket Booking Form */}
      <form onSubmit={handleBookTickets} className="bg-slate-50 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 text-slate-800">Book Tickets</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Ticket Type</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              value={ticketType}
              onChange={e => setTicketType(e.target.value)}
            >
              <option value="regular">Regular</option>
              <option value="vip">VIP</option>
              <option value="student">Student</option>
              <option value="early_bird">Early Bird</option>
              <option value="group">Group</option>
              <option value="complimentary">Complimentary</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              max={event.availableTickets || 100}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
            />
          </div>
        </div>
        {/* Show total price */}
        {event.ticketPrice && (
          <div className="mb-4 text-lg font-semibold text-slate-800">
            Total Price: Rs. {Number(event.ticketPrice) * quantity}
          </div>
        )}
        {bookingError && <div className="text-red-500 mb-2">{bookingError}</div>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
          disabled={bookingLoading}
        >
          {bookingLoading ? 'Processing...' : 'Book & Pay Now'}
        </button>
      </form>
      <div className="flex items-center space-x-3 mt-4">
        <Link
          to="/dashboard"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 text-center"
        >
          Back to Events
        </Link>
      </div>
    </div>
  );
};

export default EventDetail; 