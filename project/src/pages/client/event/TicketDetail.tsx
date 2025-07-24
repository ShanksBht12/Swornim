import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// @ts-ignore
import { getBookingById, downloadTicketPDF } from '../../../services/bookingService.js';
import { Download, Printer, ArrowLeft, Calendar, MapPin, Users, DollarSign } from 'lucide-react';

const TicketDetail = () => {
  const { bookingId } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    
    getBookingById(bookingId)
      .then((response: any) => {
        const ticketData = response?.data || response;
        setTicket(ticketData);
        
        // Use the professional QR code (qr_code field)
        const qrValue = ticketData.qr_code || ticketData.qrCode || ticketData.id;
        
        if (qrValue) {
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}`);
        }
      })
      .catch((err: any) => {
        console.error('Failed to load ticket:', err);
        setError('Failed to load ticket info');
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const downloadPDF = async () => {
    if (!bookingId) return;
    
    setDownloadingPdf(true);
    try {
      console.log('Starting PDF download for booking:', bookingId);
      
      // Use the service function
      const blob = await downloadTicketPDF(bookingId);
      
      console.log('PDF blob received, size:', blob.size);

      if (!blob || blob.size === 0) {
        throw new Error('PDF file is empty');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `swornim-ticket-${bookingId}.pdf`;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log('PDF download completed successfully');
      
    } catch (err: any) {
      console.error('PDF download error:', err);
      alert(`Failed to download PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Event Ticket',
          text: `Check out my ticket for the event!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Ticket link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Ticket not found.'}</p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const qrValue = ticket.qr_code || ticket.qrCode || ticket.id;

  if (!qrValue) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-yellow-600 mb-2">QR Code Not Available</h2>
          <p className="text-gray-600 mb-4">QR code not available for this ticket.</p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg print:shadow-none print:max-w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎫</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Event Ticket</h1>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Valid for Entry</span>
        </div>
      </div>
      
      {/* QR Code Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl mb-6">
        <div className="text-center">
          <div className="bg-white p-4 rounded-xl inline-block shadow-sm mb-4">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-48 h-48 mx-auto"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-500">QR Code Loading...</span>
              </div>
            )}
          </div>
          
          {/* Verification Code */}
          <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1 font-medium">Verification Code</p>
            <p className="font-mono text-sm text-gray-800 break-all">{qrValue}</p>
          </div>
        </div>
      </div>
      
      {/* Ticket Details Card */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Ticket Details
        </h3>
        
        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="font-medium text-gray-600">Booking ID</span>
            <span className="font-mono text-gray-800 text-xs">{ticket.id}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="font-medium text-gray-600">Ticket Type</span>
            <span className="capitalize text-gray-800 font-medium">{ticket.ticket_type}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="font-medium text-gray-600">Quantity</span>
            <span className="text-gray-800 font-bold">{ticket.quantity}×</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="font-medium text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Amount
            </span>
            <span className="font-bold text-green-600 text-lg">Rs. {ticket.total_amount}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="font-medium text-gray-600">Status</span>
            <span className={`capitalize font-bold px-3 py-1 rounded-full text-xs ${
              ticket.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
              ticket.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
              'bg-yellow-100 text-yellow-700'
            }`}>
              {ticket.status}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="font-medium text-gray-600">Payment</span>
            <span className={`capitalize font-bold px-3 py-1 rounded-full text-xs ${
              ticket.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
              ticket.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 
              'bg-yellow-100 text-yellow-700'
            }`}>
              {ticket.payment_status}
            </span>
          </div>
          
          {ticket.payment_date && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="font-medium text-gray-600">Payment Date</span>
              <span className="text-gray-800 text-xs">
                {new Date(ticket.payment_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Important Instructions */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h4 className="font-bold text-yellow-800 mb-2">Important Instructions</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Present this QR code at the event entrance</li>
              <li>• Arrive 30 minutes before event start time</li>
              <li>• Bring a valid photo ID for verification</li>
              <li>• This ticket is non-transferable</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-3 print:hidden">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={downloadPDF}
            disabled={downloadingPdf}
            className="flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5 mr-2" />
            {downloadingPdf ? 'Downloading...' : 'Download PDF'}
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Ticket
          </button>
        </div>
        
        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShare}
            className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            📤 Share
          </button>
          
          <Link 
            to="/dashboard" 
            className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Powered by <strong>Swornim Events</strong> • Your Event Management Partner
        </p>
        <p className="text-xs text-gray-400 mt-1">
          For support, contact us at support@swornim.com
        </p>
      </div>
    </div>
  );
};

export default TicketDetail;