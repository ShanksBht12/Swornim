"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { catererService } from "../../../services/catererService"
// @ts-ignore
import { packageService } from '../../../services/packageService'
import { Star, Award, Eye, MapPin, MessageSquare, Share2, Calendar, CheckCircle, Camera, ArrowLeft, Heart, Phone, ChevronLeft, ChevronRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
// @ts-ignore
import * as bookingService from '../../../services/bookingService'
import { paymentService } from '../../../services/paymentService'
import { Dialog } from '@headlessui/react'

// Subcomponents for each section
const GallerySection = ({ images, name }: { images: string[]; name: string }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openModal = (img: string, index: number) => {
    setSelectedImage(img)
    setCurrentIndex(index)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setSelectedImage(images[(currentIndex + 1) % images.length])
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setSelectedImage(images[(currentIndex - 1 + images.length) % images.length])
  }

  return (
    <section className="w-full mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="headline-large mb-2">Portfolio Gallery</h2>
          <p className="body-medium text-slate-500">Showcasing our finest culinary creations</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full">
          <Camera className="w-4 h-4 text-slate-600" />
          <span className="body-medium text-slate-600 font-medium">{images.length} photos</span>
        </div>
      </div>

      {images.length > 0 ? (
        <>
          {/* Main featured image */}
          <div className="mb-6">
            <div
              className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden group cursor-pointer shadow-lg"
              onClick={() => openModal(images[0], 0)}
            >
              <img
                src={images[0] || "/placeholder.svg"}
                alt={`${name} featured work`}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                <span className="body-small font-medium">Featured Work</span>
              </div>
            </div>
          </div>

          {/* Thumbnail grid */}
          {images.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.slice(1, 13).map((img, idx) => (
                <div
                  key={idx + 1}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => openModal(img, idx + 1)}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${name} portfolio ${idx + 2}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}

              {images.length > 13 && (
                <div
                  className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors duration-300"
                  onClick={() => openModal(images[13], 13)}
                >
                  <div className="text-center">
                    <span className="display-medium text-slate-600 font-bold">+{images.length - 13}</span>
                    <p className="body-small text-slate-500 mt-1">more photos</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-96 card bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <h3 className="headline-medium text-slate-600 mb-2">No Portfolio Images</h3>
              <p className="body-medium text-slate-400">Portfolio images will be displayed here once uploaded</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="relative max-w-6xl max-h-full w-full">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Portfolio image"
              className="max-w-full max-h-full object-contain rounded-lg mx-auto"
            />

            {/* Close button */}
            <button
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
              onClick={closeModal}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="body-small font-medium">
                {currentIndex + 1} of {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

const QuickInfoSection = ({ caterer }: { caterer: any }) => {
  const infoCards = [
    {
      icon: Award,
      label: "Status",
      value: caterer.user?.userType === "caterer" ? "Verified Professional" : "Unverified",
      bgColor: caterer.user?.userType === "caterer" ? "bg-green-50" : "bg-slate-50",
      iconColor: caterer.user?.userType === "caterer" ? "text-green-600" : "text-slate-500",
      valueColor: caterer.user?.userType === "caterer" ? "text-green-700 font-semibold" : "text-slate-600",
    },
    {
      icon: Star,
      label: "Rating",
      value: `${caterer.rating || 0} (${caterer.totalReviews || 0} reviews)`,
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-500",
      valueColor: "text-slate-800 font-semibold",
    },
    {
      icon: MapPin,
      label: "Location",
      value: caterer.location?.name || "Location not specified",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      valueColor: "text-slate-700",
    },
    {
      icon: CheckCircle,
      label: "Availability",
      value: caterer.isAvailable ? "Available Now" : "Currently Busy",
      bgColor: caterer.isAvailable ? "bg-green-50" : "bg-red-50",
      iconColor: caterer.isAvailable ? "text-green-600" : "text-red-600",
      valueColor: caterer.isAvailable ? "text-green-700 font-medium" : "text-red-700 font-medium",
    },
    {
      icon: Eye,
      label: "Profile Views",
      value: `${Math.floor(Math.random() * 50) + 10} this month`,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      valueColor: "text-slate-700",
    },
    {
      icon: Calendar,
      label: "Starting Rate",
      value: caterer.hourlyRate ? `₹${caterer.hourlyRate}/hr` : "Contact for pricing",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700 font-bold",
    },
  ]

  return (
    <div className="mb-12">
      <div className="mb-6">
        <h3 className="headline-medium mb-2">Quick Information</h3>
        <p className="body-medium text-slate-500">Essential details at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {infoCards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <div key={index} className="group">
              <div className="card p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="label-large text-slate-600 mb-1">{card.label}</div>
                    <div className={`body-medium ${card.valueColor} leading-tight`}>{card.value}</div>
                    {card.label === "Availability" && (
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className={`w-2 h-2 rounded-full ${caterer.isAvailable ? "bg-green-500" : "bg-red-500"} animate-pulse`}
                        ></div>
                        <span className="body-small text-slate-500">
                          {caterer.isAvailable ? "Ready to book" : "Check back later"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const AboutSection = ({ caterer }: { caterer: any }) => (
  <div className="space-y-10">
    {/* About Description */}
    <div className="card p-8 bg-gradient-to-br from-slate-50 to-white">
      <h3 className="headline-medium mb-6 flex items-center gap-3">
        <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
        About Our Catering Service
      </h3>
      <div className="prose prose-slate max-w-none">
        <p className="body-large leading-relaxed text-slate-700">
          {caterer.description ||
            "We are passionate culinary professionals dedicated to delivering exceptional catering services and creating memorable dining experiences. Our commitment to quality ingredients and attention to detail sets us apart in the industry."}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="card p-6">
        <h4 className="headline-small mb-4 text-slate-800">Specializations</h4>
        <div className="flex flex-wrap gap-3">
          {(caterer.specializations || []).length > 0 ? (
            caterer.specializations.map((tag: string, idx: number) => (
              <span key={idx} className="chip chip-primary hover:scale-105 transition-transform duration-200">
                {tag}
              </span>
            ))
          ) : (
            <div className="text-center py-8 w-full">
              <p className="body-medium text-slate-400">No specializations listed yet</p>
              <p className="body-small text-slate-300 mt-1">Specializations will be displayed here</p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h4 className="headline-small mb-4 text-slate-800">Equipment & Tools</h4>
        <div className="flex flex-wrap gap-3">
          {(caterer.equipment || []).length > 0 ? (
            caterer.equipment.map((item: string, idx: number) => (
              <span key={idx} className="chip hover:scale-105 transition-transform duration-200">
                {item}
              </span>
            ))
          ) : (
            <div className="text-center py-8 w-full">
              <p className="body-medium text-slate-400">No equipment listed yet</p>
              <p className="body-small text-slate-300 mt-1">Equipment details will be displayed here</p>
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="card p-8 bg-gradient-to-r from-blue-50 via-white to-purple-50">
      <h4 className="headline-medium mb-8 text-center text-slate-800">Professional Statistics</h4>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="text-center group">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="display-medium text-slate-800 font-bold mb-1">{caterer.experienceYears || 0}</div>
          <div className="body-small text-slate-500 font-medium">Years Experience</div>
        </div>
        <div className="text-center group">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="display-medium text-slate-800 font-bold mb-1">{caterer.totalReviews || 0}</div>
          <div className="body-small text-slate-500 font-medium">Client Reviews</div>
        </div>
        <div className="text-center group">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="display-medium text-slate-800 font-bold mb-1">{caterer.rating || 0}</div>
          <div className="body-small text-slate-500 font-medium">Average Rating</div>
        </div>
        <div className="text-center group">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="display-medium text-slate-800 font-bold mb-1">{Math.floor(Math.random() * 50) + 10}</div>
          <div className="body-small text-slate-500 font-medium">Events Catered</div>
        </div>
      </div>
    </div>
  </div>
)

const PackagesSection = ({ packages, onBook }: { packages: any[], onBook: (pkg: any) => void }) => {
  if (packages.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="card p-12 bg-gradient-to-br from-slate-50 to-slate-100 max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="headline-medium text-slate-600 mb-3">Custom Packages Available</h3>
          <p className="body-medium text-slate-500 mb-6">
            We create personalized catering packages tailored to your event needs and budget.
          </p>
          <button className="btn-primary">Contact for Custom Quote</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h3 className="headline-large mb-3">Catering Packages</h3>
        <p className="body-large text-slate-600">Choose the perfect package for your event</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {packages.map((pkg, idx) => (
          <div key={idx} className="group relative">
            {/* Popular badge for middle package */}
            {idx === 1 && packages.length >= 3 && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Most Popular
                </div>
              </div>
            )}

            <div
              className={`card p-8 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                idx === 1 && packages.length >= 3
                  ? "ring-2 ring-blue-500 ring-opacity-50 bg-gradient-to-br from-blue-50 to-white"
                  : "hover:ring-2 hover:ring-blue-200"
              }`}
            >
              {/* Package Header */}
              <div className="text-center mb-8">
                <h4 className="headline-medium mb-3 text-slate-800">{pkg.name}</h4>
                <div className="mb-4">
                  <span className="display-large text-blue-600 font-bold">₹{pkg.basePrice?.toLocaleString()}</span>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="body-medium text-slate-600">{pkg.durationHours} hours service</span>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-8 flex-1">
                {pkg.features?.map((feature: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="body-medium text-slate-700 leading-relaxed">{feature}</span>
                  </div>
                )) || (
                  <div className="text-center py-4">
                    <p className="body-medium text-slate-400">Package details available on request</p>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg`}
                onClick={() => onBook(pkg)}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const ReviewsSection = ({ reviews }: { reviews: any[] }) => {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-slate-300"}`} />
    ))
  }

  if (reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <div className="card p-12 bg-gradient-to-br from-slate-50 to-slate-100 max-w-md mx-auto">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="headline-medium text-slate-600 mb-3">No Reviews Yet</h3>
            <p className="body-medium text-slate-500 mb-6">
              Be the first to share your experience and help others make informed decisions.
            </p>
            <button className="btn-primary">Write First Review</button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate average rating
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <div className="card p-8 bg-gradient-to-br from-yellow-50 to-amber-50">
        <div className="text-center">
          <div className="display-large text-slate-800 font-bold mb-2">{averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 mb-2">{renderStars(Math.round(averageRating))}</div>
          <p className="body-medium text-slate-600">
            Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="headline-medium">Customer Reviews</h4>
          <button className="btn-text">Write a Review</button>
        </div>

        <div className="space-y-6">
          {reviews.map((review, idx) => (
            <div key={idx} className="card p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="label-large text-slate-800">{review.rating}/5</span>
                  </div>
                  <div className="body-small text-slate-500">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Recent review"}
                  </div>
                </div>
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="body-large text-slate-700 leading-relaxed">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const CatererDetail = () => {
  const { id } = useParams()
  const [caterer, setCaterer] = useState<any>(null)
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFavorited, setIsFavorited] = useState(false)

  // Add booking/payment state, modal, handlers, and payment verification logic (copied and adapted from PhotographerDetail)
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    packageId: '',
    eventType: '',
    eventLocation: '',
    specialRequests: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [latestBooking, setLatestBooking] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [verifying, setVerifying] = useState(false);

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
        serviceProviderId: caterer?.user?.id,
        packageId,
        eventDate: date,
        eventTime: time,
        eventLocation,
        eventType,
        totalAmount: selectedPkg.basePrice,
        serviceType: 'caterer',
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
        <div style={{textAlign: 'center'}}>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>
            Booking Complete!
          </div>
          <div>Your booking has been successfully placed.<br/>Check your dashboard for details.</div>
        </div>,
        {
          icon: <CheckCircle className="w-8 h-8 text-green-400" />,
          duration: 6000,
        }
      );
    } catch (err: any) {
      setBookingError(err.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return
    setLoading(true)
    catererService
      .getCatererById(id)
      .then(async (data) => {
        setCaterer(data)
        // Fetch packages by serviceProviderId
        if (data?.user?.id) {
          try {
            const pkgs = await packageService.getPackages(data.user.id)
            setPackages(pkgs)
          } catch (e) {
            setPackages([])
          }
        } else {
          setPackages([])
        }
        setLoading(false)
      })
      .catch((err) => {
        setError("Failed to load caterer details")
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (bookingSuccess && caterer?.user?.id) {
      bookingService.getBookings().then((data: any) => {
        const bookings = Array.isArray(data?.data) ? data.data : [];
        const myBooking = bookings
          .filter((b: any) => b.serviceProviderId === caterer.user.id && b.packageId === selectedPackage?.id)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        setLatestBooking(myBooking);
        setPaymentStatus(myBooking?.paymentStatus || '');
      });
    }
  }, [bookingSuccess, caterer, selectedPackage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pidx = params.get('pidx');
    const status = params.get('status');
    if (pidx) {
      const alreadyVerified = sessionStorage.getItem(`verified_${pidx}`);
      if (!alreadyVerified) {
        setVerifying(true);
        paymentService.verifyKhaltiPayment(pidx)
          .then((res: any) => {
            if (res?.success) {
              toast.success('Payment verified successfully!');
              setPaymentStatus('paid');
              sessionStorage.setItem(`verified_${pidx}`, 'true');
              setLatestBooking((prev: any) => prev ? {...prev, paymentStatus: 'paid'} : prev);
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
            url.searchParams.delete('status');
            url.searchParams.delete('purchase_order_id');
            url.searchParams.delete('purchase_order_name');
            window.history.replaceState({}, document.title, url.pathname);
          });
      }
      const url = new URL(window.location.href);
      url.searchParams.delete('pidx');
      url.searchParams.delete('status');
      url.searchParams.delete('purchase_order_id');
      url.searchParams.delete('purchase_order_name');
      window.history.replaceState({}, document.title, url.pathname);
    } else if (status === 'Canceled' || status === 'Failed') {
      toast.error('Payment was cancelled or failed.');
      const url = new URL(window.location.href);
      url.searchParams.delete('status');
      window.history.replaceState({}, document.title, url.pathname);
    }
  }, []);

  useEffect(() => {
    return () => {
      const params = new URLSearchParams(window.location.search);
      const pidx = params.get('pidx');
      if (pidx) {
        sessionStorage.removeItem(`verified_${pidx}`);
      }
    };
  }, []);

  const handlePayNow = async () => {
    if (!latestBooking) return;
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const res = await paymentService.initializeKhaltiPayment(latestBooking.id);
      const paymentUrl = res?.data?.paymentUrl;
      if (paymentUrl) {
        sessionStorage.setItem(`initiated_${latestBooking.id}`, 'true');
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
        setLatestBooking((prev: any) => prev ? {...prev, paymentStatus: 'paid'} : prev);
      } else {
        toast.error('Payment verification failed.');
      }
    } catch {
      toast.error('Payment verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="loading-spinner w-12 h-12 mx-auto"></div>
            <p className="body-large text-slate-600">Loading caterer details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-16">
        <div className="text-center">
          <div className="card p-12 max-w-md mx-auto">
            <p className="headline-medium text-red-600 mb-4">Oops! Something went wrong</p>
            <p className="body-medium text-slate-600 mb-6">{error}</p>
            <Link to="/client-dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!caterer) {
    return (
      <div className="container py-16">
        <div className="text-center">
          <div className="card p-12 max-w-md mx-auto">
            <p className="headline-medium text-slate-600 mb-4">Caterer Not Found</p>
            <p className="body-medium text-slate-500 mb-6">
              The caterer you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/client-dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/client-dashboard"
              className="btn-text inline-flex items-center gap-2 hover:bg-slate-100 rounded-lg px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isFavorited
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              </button>
              <button className="p-3 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 section-spacing">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-5 gap-8 mb-16">
          {/* Profile Image */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="relative aspect-square w-full min-h-[400px]">
                <img
                  src={caterer.image || caterer.profileImage || caterer.user?.profileImage || "/placeholder.svg"}
                  alt={caterer.businessName || "Caterer"}
                  className="w-full h-full object-cover rounded-2xl shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl" />
              </div>

              {/* Profile Info */}
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="headline-large text-slate-900">{caterer.businessName}</h1>
                    {caterer.user?.userType === "caterer" && (
                      <span className="chip chip-success flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="body-medium text-slate-600">{caterer.location?.name || "Location not specified"}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                  <button className="btn-secondary flex items-center justify-center gap-2 px-6">
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="lg:col-span-3">
            <QuickInfoSection caterer={caterer} />
          </div>
        </div>

        {/* Gallery */}
        <GallerySection images={caterer.portfolio || caterer.portfolioImages || caterer.images || []} name={caterer.businessName || ""} />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - About & Packages */}
          <div className="lg:col-span-2 space-y-16">
            <AboutSection caterer={caterer} />

            <div>
              <PackagesSection packages={packages} onBook={openBookingModal} />
            </div>
          </div>

          {/* Right Column - Reviews */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ReviewsSection reviews={caterer.reviews || []} />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onClose={closeBookingModal} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto p-8">
            <Dialog.Title className="text-2xl font-bold mb-4 text-slate-800">Book {selectedPackage?.name}</Dialog.Title>
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
    </div>
  )
}

export default CatererDetail
