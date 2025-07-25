"use client"
import { useState, useEffect } from "react"
import {
  X,
  Clock,
  MapPin,
  Phone,
  Award,
  MessageSquare,
  Package,
  CreditCard,
  Bookmark,
  Download,
  Plus,
} from "lucide-react"
// @ts-ignore
import { FileUpload } from "../../../components/FileUpload"
// @ts-ignore
import { uploadPortfolioImages } from "../../../services/imageUploadService"
// @ts-ignore
import * as bookingService from "../../../services/bookingService"

const BookingsTab = () => {
  const [bookings, setBookings] = useState<any[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState("")
  const [bookingStatusFilter, setBookingStatusFilter] = useState("All")
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState("")

  // Portfolio image upload state
  const [portfolioImageFiles, setPortfolioImageFiles] = useState<File[]>([])
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)

  const statusMap: Record<string, string[]> = {
    Pending: ["pending_provider_confirmation", "pending_modification", "modification_requested"],
    Confirmed: ["confirmed_awaiting_payment"],
    Paid: ["confirmed_paid"],
    "In Progress": ["in_progress"],
    Completed: ["completed"],
    Cancelled: ["cancelled_by_client", "cancelled_by_provider", "rejected", "refunded"],
  }

  // Fetch bookings for the logged-in provider
  useEffect(() => {
    setBookingsLoading(true)
    setBookingsError("")
    bookingService
      .getBookings()
      .then((data: any) => {
        setBookings(Array.isArray(data) ? data : data.bookings || [])
      })
      .catch((err: any) => {
        setBookingsError("Failed to load bookings.")
      })
      .finally(() => setBookingsLoading(false))
  }, [])

  // Logic for uploading portfolio images
  const handlePortfolioUpload = async () => {
    if (portfolioImageFiles.length === 0) return

    setUploadingPortfolio(true)
    try {
      const results = await Promise.all(portfolioImageFiles.map((file) => uploadPortfolioImages([file])))

      // Clear uploaded files
      setPortfolioImageFiles([])

      // Show success message
      alert("Portfolio images uploaded successfully!")
    } catch (err: any) {
      console.error("Portfolio upload error:", err)
      alert("Failed to upload portfolio images. Please try again.")
    } finally {
      setUploadingPortfolio(false)
    }
  }

  // Filter bookings by status using the statusMap
  const filteredBookings =
    bookingStatusFilter === "All"
      ? bookings
      : bookings.filter((b) => statusMap[bookingStatusFilter]?.includes(b.status))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
          <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
          My Bookings
        </h2>
        {/* Removed New Booking button */}
      </div>
      {/* Removed Upload Portfolio Images section */}

      {/* Enhanced Status Filter */}
      <div className="flex flex-wrap gap-3">
        {["All", "Confirmed", "Pending", "Paid", "In Progress", "Completed", "Cancelled"].map((status) => (
          <button
            key={status}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              status === bookingStatusFilter
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
            onClick={() => setBookingStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Enhanced Booking Cards */}
      {bookingsLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : bookingsError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-red-800 font-medium">{bookingsError}</div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8">
          {filteredBookings.map((booking) => {
            const canAccept = booking.status === "pending_provider_confirmation"
            const canReject = booking.status === "pending_provider_confirmation"
            const canStart = booking.status === "confirmed_paid"
            const canComplete = booking.status === "in_progress"
            const canCancel = ["confirmed_awaiting_payment", "confirmed_paid"].includes(booking.status)
            const canRaiseDispute = booking.status === "in_progress"

            return (
              <div
                key={booking.id}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-6">
                    <div
                      className={`w-5 h-5 rounded-full mt-1 ${
                        booking.status === "confirmed"
                          ? "bg-green-500"
                          : booking.status === "completed"
                            ? "bg-blue-500"
                            : booking.status === "cancelled"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                      } group-hover:scale-125 transition-transform`}
                    />
                    <div>
                      <div className="text-xl font-bold text-slate-800 mb-3">
                        {booking.service || booking.serviceName || booking.packageName}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-slate-600 font-medium">
                            {booking.date || booking.eventDate} at {booking.time || booking.eventTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <MapPin className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-slate-600 font-medium">
                            {booking.location || booking.eventLocation}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <Phone className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-slate-600 font-medium">
                            {booking.contact || booking.providerContact || "-"}
                          </span>
                        </div>
                      </div>
                      {booking.eventType && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-50 rounded-lg">
                            <Award className="w-4 h-4 text-orange-600" />
                          </div>
                          <span className="text-slate-600 font-medium">{booking.eventType}</span>
                        </div>
                      )}
                      {booking.specialRequests && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-pink-50 rounded-lg">
                            <MessageSquare className="w-4 h-4 text-pink-600" />
                          </div>
                          <span className="text-slate-600 font-medium">{booking.specialRequests}</span>
                        </div>
                      )}
                      {booking.packageName && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-slate-600 font-medium">{booking.packageName}</span>
                        </div>
                      )}
                      {booking.paymentStatus && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <CreditCard className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-slate-600 font-medium">{booking.paymentStatus}</span>
                        </div>
                      )}
                      {booking.id && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <Bookmark className="w-4 h-4 text-slate-500" />
                          </div>
                          <span className="text-slate-600 font-medium">Booking ID: {booking.id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800 mb-2">
                      {booking.amount || booking.totalAmount}
                    </div>
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : booking.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      <MessageSquare className="w-5 h-5" />
                      <span>Message</span>
                    </button>
                    <button className="flex items-center space-x-2 text-slate-600 hover:text-slate-700 font-medium transition-colors">
                      <Download className="w-5 h-5" />
                      <span>Download</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    {canAccept && (
                      <button
                        className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        onClick={async () => {
                          // Accept booking (confirm)
                          try {
                            await bookingService.updateBookingStatus(booking.id, "confirmed_awaiting_payment")
                            setBookings((prev) =>
                              prev.map((b) =>
                                b.id === booking.id ? { ...b, status: "confirmed_awaiting_payment" } : b,
                              ),
                            )
                          } catch (err) {
                            alert("Failed to accept booking")
                          }
                        }}
                      >
                        Accept
                      </button>
                    )}
                    {canReject && (
                      <button
                        className="px-6 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        onClick={async () => {
                          const reason = window.prompt("Please provide a reason for rejection:")
                          if (!reason) return
                          try {
                            await bookingService.updateBookingStatus(booking.id, "rejected", reason)
                            setBookings((prev) =>
                              prev.map((b) => (b.id === booking.id ? { ...b, status: "rejected" } : b)),
                            )
                          } catch (err) {
                            alert("Failed to reject booking")
                          }
                        }}
                      >
                        Reject
                      </button>
                    )}
                    {canStart && (
                      <button
                        className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={async () => {
                          try {
                            await bookingService.updateBookingStatus(booking.id, "in_progress")
                            setBookings((prev) =>
                              prev.map((b) => (b.id === booking.id ? { ...b, status: "in_progress" } : b)),
                            )
                          } catch (err) {
                            alert("Failed to start service")
                          }
                        }}
                      >
                        Start
                      </button>
                    )}
                    {canComplete && (
                      <button
                        className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        onClick={async () => {
                          try {
                            await bookingService.updateBookingStatus(booking.id, "completed")
                            setBookings((prev) =>
                              prev.map((b) => (b.id === booking.id ? { ...b, status: "completed" } : b)),
                            )
                          } catch (err) {
                            alert("Failed to complete service")
                          }
                        }}
                      >
                        Complete
                      </button>
                    )}
                    {canCancel && (
                      <button
                        className="px-6 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        onClick={async () => {
                          const reason = window.prompt("Please provide a reason for cancellation:")
                          if (!reason) return
                          try {
                            await bookingService.cancelBooking(booking.id, reason)
                            setBookings((prev) =>
                              prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled_by_provider" } : b)),
                            )
                          } catch (err) {
                            alert("Failed to cancel booking")
                          }
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    {canRaiseDispute && <button /* raise dispute logic placeholder */>Raise Dispute</button>}
                  </div>
                </div>
              </div>
            )
          })}
          {!filteredBookings.length && (
            <div className="text-center py-16 text-slate-400">No bookings found for this status.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default BookingsTab;
