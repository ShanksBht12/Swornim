"use client"
import { useState, useEffect } from "react"
import { Star, User, Calendar, MessageSquare, ThumbsUp, Filter, ChevronDown } from "lucide-react"

const ReviewsTab = () => {
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState("")
  const [ratingFilter, setRatingFilter] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  // Mock reviews data - replace with actual API call
  const mockReviews = [
    {
      id: 1,
      clientName: "Priya Sharma",
      rating: 5,
      comment:
        "Absolutely amazing service! The photographer was professional and captured every moment perfectly. Highly recommended!",
      date: "2024-01-15",
      serviceName: "Premium Wedding Package",
      verified: true,
      helpful: 12,
    },
    {
      id: 2,
      clientName: "Rajesh Kumar",
      rating: 4,
      comment:
        "Great experience overall. The quality of photos was excellent, though there was a slight delay in delivery.",
      date: "2024-01-10",
      serviceName: "Portrait Session",
      verified: true,
      helpful: 8,
    },
    {
      id: 3,
      clientName: "Sunita Thapa",
      rating: 5,
      comment: "Outstanding work! Very creative and professional. Will definitely book again for future events.",
      date: "2024-01-05",
      serviceName: "Event Photography",
      verified: false,
      helpful: 15,
    },
    {
      id: 4,
      clientName: "Amit Patel",
      rating: 3,
      comment: "Service was okay. Photos were good but not exceptional. Room for improvement in communication.",
      date: "2023-12-28",
      serviceName: "Basic Package",
      verified: true,
      helpful: 3,
    },
  ]

  useEffect(() => {
    setReviewsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setReviews(mockReviews)
      setReviewsLoading(false)
    }, 1000)
  }, [])

  const filteredReviews =
    ratingFilter === "All" ? reviews : reviews.filter((review) => review.rating === Number.parseInt(ratingFilter))

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "0.0"

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage:
      reviews.length > 0 ? (reviews.filter((review) => review.rating === rating).length / reviews.length) * 100 : 0,
  }))

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
      />
    ))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
          <div className="w-1 h-10 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full mr-4"></div>
          Reviews & Ratings
        </h2>
        <div className="flex items-center space-x-3 bg-yellow-50 px-4 py-2 rounded-xl">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold text-yellow-600">{averageRating} average rating</span>
        </div>
      </div>

      {/* Rating Overview */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full mr-3"></div>
            Rating Overview
          </h3>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-slate-800 mb-2">{averageRating}</div>
            <div className="flex justify-center mb-2">{renderStars(Math.round(Number.parseFloat(averageRating)))}</div>
            <div className="text-sm text-slate-600">Based on {reviews.length} reviews</div>
          </div>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-12">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-slate-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
            Review Statistics
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{reviews.length}</div>
              <div className="text-sm text-slate-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">{reviews.filter((r) => r.verified).length}</div>
              <div className="text-sm text-slate-600">Verified Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100) || 0}%
              </div>
              <div className="text-sm text-slate-600">Positive Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {Math.round(reviews.reduce((sum, r) => sum + r.helpful, 0) / reviews.length) || 0}
              </div>
              <div className="text-sm text-slate-600">Avg. Helpful Votes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-3 px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {["All", "5", "4", "3", "2", "1"].map((rating) => (
              <button
                key={rating}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  rating === ratingFilter
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                onClick={() => setRatingFilter(rating)}
              >
                {rating === "All" ? "All Ratings" : `${rating} Stars`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviewsLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
        </div>
      ) : reviewsError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="text-red-800 font-medium">{reviewsError}</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-bold text-slate-800">{review.clientName}</h4>
                      {review.verified && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                      <span className="text-sm text-slate-500">•</span>
                      <span className="text-sm text-slate-600">{review.serviceName}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed mb-6">{review.comment}</p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Helpful ({review.helpful})</span>
                </button>
                <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Reply</span>
                </button>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No reviews found</h3>
              <p className="text-slate-600">
                {ratingFilter === "All"
                  ? "You haven't received any reviews yet. Complete some bookings to start getting reviews!"
                  : `No reviews found with ${ratingFilter} star${ratingFilter !== "1" ? "s" : ""}.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewsTab
