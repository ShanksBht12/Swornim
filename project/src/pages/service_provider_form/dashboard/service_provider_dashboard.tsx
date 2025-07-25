"use client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Camera, Calendar, MapPin, Palette, User, Search, Bell, Menu, X, Heart, Star, Filter, Grid, List, Plus, ChevronRight, Award, Clock, MessageSquare, Settings, LogOut, TrendingUp, Shield, ChevronDown, ArrowRight, Package, CreditCard, Activity, Eye, Share2, Edit, Trash2, ImageIcon, Users, DollarSign, Globe, TicketIcon } from 'lucide-react'
import { useAuth } from "../../../context/AuthContext"
import { useServiceProviderProfile } from "../../../context/ServiceProviderProfileContext"
import { useNavigate } from "react-router-dom"
import { FileUpload } from "../../../components/FileUpload"
// @ts-ignore
import api from "../../../services/api"
import BookingsTab from "./bookings_tab"
import PackagesTab from "./packages_tab"
// @ts-ignore
import { eventService } from "../../../services/eventService"

const getFirstAndLastName = (name: string | undefined) => {
  if (!name) return { firstName: "", lastName: "" }
  const parts = name.split(" ")
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  }
}

// Helper to parse 12-hour time with AM/PM to 24-hour format
function parseTimeTo24Hour(timeStr) {
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "00:00";
  let [_, hour, minute, ampm] = match;
  hour = parseInt(hour, 10);
  if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${minute}`;
}

const ServiceProviderDashboard = () => {
  const { user, logout } = useAuth()
  const userType = user?.userType as string
  const { profile, refreshProfile } = useServiceProviderProfile()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [logoutModal, setLogoutModal] = useState(false)
  const [logoutError, setLogoutError] = useState("")
  const [loading, setLoading] = useState(false)

  // Add state for editable personal info fields
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  })

  // Add state for editable photographer profile fields
  const [profileFields, setProfileFields] = useState({
    businessName: (profile && (profile as any).businessName) || "",
    description: (profile && (profile as any).description) || "",
    hourlyRate: (profile && (profile as any).hourlyRate) || "",
    sessionRate: (profile && (profile as any).sessionRate) || "",
    bridalPackageRate: (profile && (profile as any).bridalPackageRate) || "",
    experience: (profile && (profile as any).experience) || "",
    experienceYears: (profile && (profile as any).experienceYears) || "",
    specializations:
      profile && Array.isArray((profile as any).specializations) ? (profile as any).specializations.join(", ") : "",
    brands: profile && Array.isArray((profile as any).brands) ? (profile as any).brands.join(", ") : "",
    location: (profile && (profile as any).location && (profile as any).location.name) || "",
    offersHairServices: (profile && (profile as any).offersHairServices) || false,
    travelsToClient: (profile && (profile as any).travelsToClient) || true,
    availableDates:
      profile && Array.isArray((profile as any).availableDates) ? (profile as any).availableDates.join(", ") : "",
    packageStartingPrice: (profile && (profile as any).packageStartingPrice) || "",
    pricePerPerson: (profile && (profile as any).pricePerPerson) || "",
    capacity: (profile && (profile as any).capacity) || "",
  })

  // Add state for profile image upload
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileUpdating, setProfileUpdating] = useState(false)
  const [profileError, setProfileError] = useState("")

  // Add state for bookings and packages at the top:
  const [bookings, setBookings] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState([
    { label: "Total Bookings Received", value: "0", change: "+0", trend: "up", icon: Calendar },
    { label: "Total Earnings", value: "Rs. 0", change: "+0%", trend: "up", icon: CreditCard },
    { label: "Active Packages", value: "0", change: "+0", trend: "up", icon: Package },
  ]);

  // Fetch bookings and packages and update dashboardStats
  useEffect(() => {
    async function fetchData() {
      // Fetch bookings
      let bookingsData: any[] = [];
      try {
        const data = await import("../../../services/bookingService");
        const res = await data.getBookings();
        bookingsData = Array.isArray(res) ? res : res.bookings || [];
        setBookings(bookingsData);
        console.log("DASHBOARD BOOKINGS:", bookingsData);
      } catch {}
      // Fetch packages
      let packagesData: any[] = [];
      try {
        const data = await import("../../../services/packageService");
        const res = await data.getPackages(user?.id);
        packagesData = Array.isArray(res) ? res : res.packages || [];
        setPackages(packagesData);
      } catch {}
      // Compute stats
      const totalBookings = bookingsData.length;
      const totalEarnings = bookingsData
        .filter((b) => b.paymentStatus === "paid")
        .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
      const activePackages = packagesData.filter((p) => p.isActive).length;
      setDashboardStats([
        { label: "Total Bookings Received", value: totalBookings.toString(), change: "+0", trend: "up", icon: Calendar },
        { label: "Total Earnings", value: `Rs. ${totalEarnings}`, change: "+0%", trend: "up", icon: CreditCard },
        { label: "Active Packages", value: activePackages.toString(), change: "+0", trend: "up", icon: Package },
      ]);
    }
    fetchData();
  }, [user?.id]);

  // Add this useEffect to pre-fill profileFields from backend profile
  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setProfileFields({
        businessName: p.businessName || p.business_name || "",
        description: p.description || "",
        hourlyRate: p.hourlyRate || p.hourly_rate || "",
        sessionRate: p.sessionRate || p.session_rate || "",
        bridalPackageRate: p.bridalPackageRate || p.bridal_package_rate || "",
        experience: p.experience || "",
        experienceYears: p.experienceYears || p.experience_years || "",
        specializations: Array.isArray(p.specializations) ? p.specializations.join(", ") : "",
        brands: Array.isArray(p.brands) ? p.brands.join(", ") : "",
        location: p.location?.name || "",
        offersHairServices: p.offersHairServices || p.offers_hair_services || false,
        travelsToClient: p.travelsToClient || p.travels_to_client || true,
        availableDates: Array.isArray(p.availableDates) ? p.availableDates.join(", ") : "",
        packageStartingPrice: p.packageStartingPrice || p.package_starting_price || "",
        pricePerPerson: p.pricePerPerson || p.price_per_person || "",
        capacity: p.capacity || "",
      });
    }
  }, [(profile as any)?.id]);

  // Add this useEffect after the other useEffects
  useEffect(() => {
    if (user?.name) {
      const parts = user.name.trim().split(" ");
      setPersonalInfo({
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        phone: user.phone || "",
      });
    } else {
      setPersonalInfo({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
      });
    }
  }, [user]);

  // Handler for photographer profile fields - memoized
  const handleProfileFieldsChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileFields((prev) => ({ ...prev, [name]: value }))
  }, [])

  // Update personal info state on input change - memoized
  const handlePersonalInfoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPersonalInfo((prev) => ({ ...prev, [name]: value }))
  }, [])

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-lg text-slate-500">Loading...</div>
  }

  // Derive name and image for sidebar
  const name = (profile as any)?.user?.name || user?.name || user?.firstName || user?.username || ""
  const { firstName, lastName } = getFirstAndLastName(name)
  const profileImage =
    (profile as any)?.profileImage || (profile as any)?.image || user?.profileImage || "/placeholder.svg"

  const categories = [
    { id: "all", name: "All Services", icon: <Grid className="w-5 h-5" />, count: 362 },
    { id: "photographer", name: "Photography", icon: <Camera className="w-5 h-5" />, count: 156 },
    { id: "venue", name: "Venues", icon: <MapPin className="w-5 h-5" />, count: 89 },
    { id: "makeup", name: "Makeup & Beauty", icon: <Palette className="w-5 h-5" />, count: 72 },
    { id: "catering", name: "Catering", icon: <Package className="w-5 h-5" />, count: 45 },
  ]

  const featuredServices = [
    {
      id: 1,
      name: "Royal Photography Studio",
      category: "Wedding Photography",
      rating: 4.9,
      reviews: 127,
      price: "Rs. 50,000",
      originalPrice: "Rs. 65,000",
      image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
      verified: true,
      featured: true,
      discount: 23,
      tags: ["Premium", "Same Day Delivery"],
      photographer: "Rajesh Kumar",
      experience: "8+ years",
    },
    {
      id: 2,
      name: "Himalayan Grand Venue",
      category: "Wedding Venue",
      rating: 4.8,
      reviews: 89,
      price: "Rs. 200,000",
      originalPrice: "Rs. 250,000",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop",
      verified: true,
      featured: false,
      discount: 20,
      tags: ["Luxury", "Garden View"],
      capacity: "500 guests",
      location: "Kathmandu",
    },
    {
      id: 3,
      name: "Glam Beauty Studio",
      category: "Bridal Makeup",
      rating: 4.7,
      reviews: 156,
      price: "Rs. 15,000",
      originalPrice: "Rs. 20,000",
      image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop",
      verified: true,
      featured: true,
      discount: 25,
      tags: ["Trending", "Home Service"],
      artist: "Sunita Thapa",
      speciality: "Bridal Makeup",
    },
    {
      id: 4,
      name: "Everest Catering Services",
      category: "Premium Catering",
      rating: 4.6,
      reviews: 78,
      price: "Rs. 800/plate",
      originalPrice: "Rs. 1,000/plate",
      image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop",
      verified: true,
      featured: false,
      discount: 20,
      tags: ["Authentic", "Multi-cuisine"],
      minOrder: "50 plates",
      chef: "Ram Bahadur",
    },
  ]

  // Replace the hardcoded upcomingBookings with a dynamic version:
  const now = new Date();
  const upcomingBookings = bookings.map((b) => ({
    id: b.id,
    service: b.packageSnapshot?.name || b.package?.name || b.client?.name || b.packageName || 'Service',
    date: b.eventDate || b.date || '',
    time: b.eventTime || b.time || '',
    status: b.status,
    amount: b.totalAmount ? `Rs. ${b.totalAmount}` : '',
    location: b.eventLocation || b.location || '',
    contact: b.client?.phone || '',
  }));

  // Add a status map for user-friendly text
  const statusMapToText: Record<string, string> = {
    confirmed: 'confirmed',
    confirmed_paid: 'paid',
    confirmed_awaiting_payment: 'awaiting payment',
    pending_provider_confirmation: 'pending provider confirmation',
    pending_modification: 'pending modification',
    modification_requested: 'modification requested',
    in_progress: 'in progress',
    completed: 'completed',
    cancelled_by_client: 'cancelled by client',
    cancelled_by_provider: 'cancelled by you',
    rejected: 'rejected',
    refunded: 'refunded',
    paid: 'paid',
  };

  // Make recentActivity dynamic from bookings
  const recentActivity = bookings
    .slice()
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map((booking: any) => {
      const statusText = statusMapToText[booking.status] || booking.status?.replace(/_/g, ' ');
      // Prefer client name, fallback to package name, fallback to booking id
      const clientName = booking.client?.name || booking.clientName || booking.packageSnapshot?.name || booking.package?.name || booking.packageName || booking.id;
      return {
        type: 'booking',
        message: `Booking ${statusText} with ${clientName}`,
        time: booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '',
      };
    });

  const isEventOrganizer = userType === "eventOrganizer" || userType === "event_organizer"

  const navigationItems = [
    { id: "dashboard", name: "Dashboard", icon: <Activity className="w-5 h-5" /> },
    ...(isEventOrganizer
      ? [{ id: "events", name: "Events", icon: <Calendar className="w-5 h-5" /> }]
      : [
          { id: "bookings", name: "Bookings", icon: <Calendar className="w-5 h-5" /> },
          { id: "packages", name: "Packages", icon: <Package className="w-5 h-5" /> },
        ]),
    { id: "profile", name: "Profile", icon: <User className="w-5 h-5" /> },
  ]

  const favoriteServices = [
    { id: 1, name: "Royal Photography Studio", category: "Photography", rating: 4.9, price: "Rs. 50,000" },
    { id: 2, name: "Himalayan Grand Venue", category: "Venue", rating: 4.8, price: "Rs. 200,000" },
    { id: 3, name: "Glam Beauty Studio", category: "Makeup", rating: 4.7, price: "Rs. 15,000" },
    { id: 4, name: "Everest Catering Services", category: "Catering", rating: 4.6, price: "Rs. 800/plate" },
  ]

  const messages = [
    {
      id: 1,
      sender: "Royal Photography Studio",
      message: "Your booking is confirmed for Jan 15th",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      sender: "Himalayan Grand Venue",
      message: "Thank you for your interest. We'd love to discuss...",
      time: "4 hours ago",
      unread: true,
    },
    {
      id: 3,
      sender: "Glam Beauty Studio",
      message: "Your makeup trial is scheduled for tomorrow",
      time: "1 day ago",
      unread: false,
    },
    {
      id: 4,
      sender: "Support Team",
      message: "How was your experience with our service?",
      time: "2 days ago",
      unread: false,
    },
  ]

  const DashboardTab = () => (
    <div className="space-y-8">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-3">Welcome back, {firstName}!</h2>
            <p className="text-blue-100 text-lg">Ready to manage your services?</p>
            <div className="mt-6 flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm font-medium">Service Provider</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm font-medium capitalize">{user?.userType || user?.role}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Calendar className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center">
                <TrendingUp className={`w-4 h-4 mr-2 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`} />
                <span className={`text-sm font-semibold ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.change}
                </span>
                <span className="text-slate-500 text-sm ml-2">from last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enhanced Action Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
            Quick Actions
          </h3>
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab("bookings")}
              className="w-full group flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-800">New Booking</span>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab("browse")}
              className="w-full group flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-800">Browse Services</span>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full group flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-600 rounded-lg group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-800">Contact Support</span>
              </div>
              <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-3"></div>
            Recent Activity
          </h3>
          <div className="space-y-5">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 group">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 mb-1">{activity.message}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Upcoming Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-3"></div>
            Upcoming Bookings
          </h3>
          <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">View All</button>
        </div>
        <div className="space-y-6">
          {upcomingBookings.map((booking) => (
            <div
              key={booking.id}
              className="group flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center space-x-6">
                <div
                  className={`w-4 h-4 rounded-full ${booking.status === "confirmed" ? "bg-green-500" : "bg-yellow-500"} group-hover:scale-125 transition-transform`}
                />
                <div>
                  <div className="font-bold text-slate-800 mb-1">{booking.service}</div>
                  <div className="text-sm text-slate-600 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {booking.date} at {booking.time}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-slate-800 mb-1">{booking.amount}</div>
                <span
                  className={`px-4 py-2 rounded-full text-xs font-semibold ${booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const BrowseTab = () => (
    <div className="space-y-8">
      {/* Enhanced Search Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search photographers, venues, makeup artists..."
              className="pl-12 pr-4 py-4 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-3 px-6 py-4 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
            <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        {showFilters && (
          <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Price Range</label>
                <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Prices</option>
                  <option>Under Rs. 25,000</option>
                  <option>Rs. 25,000 - Rs. 50,000</option>
                  <option>Rs. 50,000 - Rs. 100,000</option>
                  <option>Above Rs. 100,000</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Rating</label>
                <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Ratings</option>
                  <option>4.5+ Stars</option>
                  <option>4.0+ Stars</option>
                  <option>3.5+ Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Location</label>
                <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Locations</option>
                  <option>Kathmandu</option>
                  <option>Lalitpur</option>
                  <option>Bhaktapur</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Category Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`group bg-white rounded-2xl shadow-sm border p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              selectedCategory === category.id
                ? "ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg"
                : "border-slate-200 hover:border-blue-200"
            }`}
          >
            <div
              className={`flex justify-center mb-4 ${
                selectedCategory === category.id ? "text-blue-600" : "text-slate-600 group-hover:text-blue-600"
              } transition-colors`}
            >
              {category.icon}
            </div>
            <div className="font-semibold text-slate-800 mb-2">{category.name}</div>
            <div className="text-sm text-slate-500">{category.count} available</div>
          </button>
        ))}
      </div>

      {/* Enhanced Services Section */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
            Featured Services
          </h2>
          <button className="text-blue-600 font-semibold hover:text-blue-700 flex items-center space-x-2 transition-colors">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className={`grid gap-8 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service}          />
          ))}
        </div>
      </div>
    </div>
  )

  const FavoritesTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
          <div className="w-1 h-10 bg-gradient-to-b from-red-500 to-pink-500 rounded-full mr-4"></div>
          My Favorites
        </h2>
        <span className="text-slate-500 bg-slate-100 px-4 py-2 rounded-xl font-medium">
          {favoriteServices.length} saved services
        </span>
      </div>
      <div className="grid gap-6">
        {favoriteServices.map((service) => (
          <div
            key={service.id}
            className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="p-3 bg-red-50 rounded-xl">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-800 mb-1">{service.name}</div>
                  <div className="text-sm text-slate-600 font-medium">{service.category}</div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{service.rating}</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600">{service.price}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5">
                    Book Now
                  </button>
                  <button className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const MessagesTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
          <div className="w-1 h-10 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-4"></div>
          Messages
        </h2>
        <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-xl">
          <Bell className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-600">2 unread messages</span>
        </div>
      </div>
      <div className="grid gap-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`group bg-white rounded-2xl shadow-sm border p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              message.unread
                ? "border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                <div
                  className={`w-4 h-4 rounded-full mt-2 ${message.unread ? "bg-blue-500" : "bg-slate-300"} group-hover:scale-125 transition-transform`}
                />
                <div>
                  <div className="text-xl font-bold text-slate-800 mb-2">{message.sender}</div>
                  <div className="text-slate-600 mb-3 leading-relaxed">{message.message}</div>
                  <div className="text-sm text-slate-500 font-medium">{message.time}</div>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-xl transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const ProfileTab = () => {
    // Add state for delete account functionality
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [deleteError, setDeleteError] = useState("")
    const [deleteConfirmText, setDeleteConfirmText] = useState("")

    // Delete account handler
    const handleDeleteAccount = async () => {
      if (deleteConfirmText !== "DELETE") {
        setDeleteError("Please type 'DELETE' to confirm account deletion")
        return
      }

      setDeleteLoading(true)
      setDeleteError("")
      
      try {
        // Call the delete user API
        await api.delete(`/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        })
        
        // Clear local storage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        
        // Navigate to login
        navigate('/login')
        
      } catch (err: any) {
        setDeleteError(
          err.response?.data?.message || 
          err.response?.data?.error || 
          "Failed to delete account. Please try again."
        )
      } finally {
        setDeleteLoading(false)
      }
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center">
            <div className="w-1 h-10 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-4"></div>
            Profile Settings
          </h2>
          <button
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
            onClick={handleProfileUpdate}
            disabled={profileUpdating}
          >
            {profileUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <form
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
              Personal Information
            </h3>
            <div className="space-y-6">
              {/* Profile image upload (always show) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Profile Image</label>
                <FileUpload
                  onFilesSelected={(files) => setProfileImageFile(files[0] || null)}
                  maxSize={5}
                  multiple={false}
                  label="Change Profile Image"
                  placeholder="Click to select or drag and drop"
                  disabled={profileUpdating}
                />
                {profileImageFile && <div className="mt-2 text-sm text-slate-600">Selected: {profileImageFile.name}</div>}
              </div>
              {/* Editable First/Last Name for client */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  key="firstName"
                  name="firstName"
                  value={personalInfo.firstName}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-4 border border-slate-200 rounded-xl"
                  placeholder="First Name"
                  disabled={profileUpdating}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  key="lastName"
                  name="lastName"
                  value={personalInfo.lastName}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-4 border border-slate-200 rounded-xl"
                  placeholder="Last Name"
                  disabled={profileUpdating}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                <div className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-700">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  key="phone"
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-4 border border-slate-200 rounded-xl"
                  placeholder="Phone"
                  disabled={profileUpdating}
                />
              </div>
            </div>
            {profileError && <div className="text-red-600 mt-4">{profileError}</div>}
          </form>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-3"></div>
              Business Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Business Name</label>
                <input
                  key="businessName"
                  name="businessName"
                  value={profileFields.businessName}
                  onChange={handleProfileFieldsChange}
                  className="w-full p-4 border border-slate-200 rounded-xl"
                  placeholder="Business Name"
                  disabled={profileUpdating}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  key="description"
                  name="description"
                  value={profileFields.description}
                  onChange={handleProfileFieldsChange}
                  className="w-full p-4 border border-slate-200 rounded-xl"
                  placeholder="Description"
                  disabled={profileUpdating}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Categories (comma separated)</label>
                <input
                  key="specializations"
                  name="specializations"
                  value={profileFields.specializations}
                  onChange={handleProfileFieldsChange}
                  className="w-full p-4 border border-slate-200 rounded-xl"
                  placeholder="e.g. wedding, portrait, event"
                  disabled={profileUpdating}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Service Type</label>
                <select 
                  key="serviceType"
                  className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option>Photography</option>
                  <option>Venue</option>
                  <option>Makeup Artist</option>
                  <option>Catering</option>
                  <option>Decoration</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Business Location</label>
                <select 
                  key="businessLocation"
                  className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option>Kathmandu</option>
                  <option>Lalitpur</option>
                  <option>Bhaktapur</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Notifications</label>
                <div className="space-y-4">
                  <label className="flex items-center p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <input
                      key="bookingNotifications"
                      type="checkbox"
                      className="mr-4 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="text-sm font-medium text-slate-600">Booking notifications</span>
                  </label>
                  <label className="flex items-center p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <input
                      key="messageNotifications"
                      type="checkbox"
                      className="mr-4 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="text-sm font-medium text-slate-600">Message notifications</span>
                  </label>
                  <label className="flex items-center p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <input 
                      key="marketingEmails"
                      type="checkbox" 
                      className="mr-4 w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                    />
                    <span className="text-sm font-medium text-slate-600">Marketing emails</span>
                  </label>
                </div>
              </div>
            </div>
            {/* Portfolio Images Section */}
            <div className="mt-8">
              <h4 className="text-lg font-bold mb-4">Portfolio Images</h4>
              <FileUpload
                onFilesSelected={handleAddPortfolioImages}
                maxSize={5}
                multiple={true}
                label="Add Portfolio Images"
                placeholder="Click to select or drag and drop portfolio images"
                disabled={false}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {(profile as any)?.portfolioImages?.map((img: string) => (
                  <div key={img} className="relative group">
                    <img
                      src={img || "/placeholder.svg"}
                      alt="Portfolio"
                      className="w-full h-32 object-cover rounded-xl border"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                      onClick={() => handleDeletePortfolioImage(img)}
                      title="Delete"
                    >
                      <span className="sr-only">Delete</span>🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone - Delete Account Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold text-red-800 mb-6 flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full mr-3"></div>
            Danger Zone
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-red-800 mb-2">Delete Account</h4>
            <p className="text-red-600 mb-4">
              Once you delete your account, there is no going back. This action cannot be undone and will permanently delete:
            </p>
            <ul className="text-red-600 text-sm mb-6 space-y-1 ml-4">
              <li>• Your profile and all personal information</li>
              <li>• All your {userType === 'client' ? 'bookings and favorites' : 'packages, events, and bookings'}</li>
              <li>• Your portfolio images and business data</li>
              <li>• All messages and chat history</li>
              <li>• Your account settings and preferences</li>
            </ul>
            <button
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-800">Delete Account</h2>
                <p className="text-slate-600">
                  Are you absolutely sure you want to delete your account? This action cannot be undone.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Type <span className="bg-slate-100 px-2 py-1 rounded font-mono text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Type DELETE to confirm"
                  disabled={deleteLoading}
                />
              </div>

              {deleteError && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                  {deleteError}
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmText("")
                    setDeleteError("")
                  }}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmText !== "DELETE"}
                >
                  {deleteLoading ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const Sidebar = () => (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-slate-200 shadow-xl lg:shadow-none`}
    >
      <div className="flex items-center justify-between h-20 px-8 border-b border-slate-200">
        <div
          className="flex items-center space-x-4 cursor-pointer"
          tabIndex={0}
          role="button"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            console.log("User type:", user?.userType);
            if (user?.userType === 'client') {
              navigate('/dashboard');
            } else {
              navigate('/service-provider-dashboard');
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (user?.userType === 'client') {
                navigate('/dashboard');
              } else {
                navigate('/service-provider-dashboard');
              }
            }
          }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Swornim
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-8">
        <div className="flex items-center space-x-4 mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
          <img
            src={profileImage || "/placeholder.svg"}
            alt={name}
            className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg object-cover"
          />
          <div>
            <div className="text-lg font-bold text-slate-800">
              {firstName} {lastName}
            </div>
            <div className="text-sm text-slate-600 capitalize flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {user?.userType || user?.role} account
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-4 rounded-xl transition-all duration-300 group ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-lg border-r-4 border-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div
                className={`p-2 rounded-lg mr-4 ${
                  activeTab === item.id ? "bg-blue-100" : "bg-slate-100 group-hover:bg-slate-200"
                } transition-colors`}
              >
                {item.icon}
              </div>
              <span className="font-semibold">{item.name}</span>
              {activeTab === item.id && <ChevronRight className="w-5 h-5 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="mt-10 pt-8 border-t border-slate-200">
          <button className="w-full flex items-center px-6 py-4 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors mb-3">
            <div className="p-2 bg-slate-100 rounded-lg mr-4">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-semibold">Settings</span>
          </button>

          <button
            className="w-full flex items-center px-6 py-4 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => setLogoutModal(true)}
            disabled={loading}
          >
            <div className="p-2 bg-red-100 rounded-lg mr-4">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>

        {/* Enhanced Logout Modal */}
        {logoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Confirm Logout</h2>
              <p className="mb-8 text-slate-600">Are you sure you want to log out of your account?</p>
              {logoutError && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl">{logoutError}</div>}
              <div className="flex justify-end gap-4">
                <button
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors"
                  onClick={() => setLogoutModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  {loading ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const ServiceCard = ({ service }: { service: any }) => (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden hover:-translate-y-2">
      <div className="relative overflow-hidden">
        <img
          src={service.image || "/placeholder.svg"}
          alt={service.name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {service.featured && (
          <div className="absolute top-4 left-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg">
              ⭐ Featured
            </span>
          </div>
        )}
        {service.discount && (
          <div className="absolute top-4 right-4">
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {service.discount}% OFF
            </span>
          </div>
        )}
        <button className="absolute bottom-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:bg-white group-hover:scale-110">
          <Heart className="w-6 h-6 text-slate-600 hover:text-red-500 transition-colors" />
        </button>
      </div>
      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 text-slate-800 group-hover:text-blue-600 transition-colors">
              {service.name}
            </h3>
            <p className="text-sm text-slate-500 mb-3 font-medium">{service.category}</p>
            <div className="flex flex-wrap gap-2">
              {service.tags?.slice(0, 2).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {service.verified && (
            <div className="bg-green-100 p-2 rounded-full">
              <Award className="w-5 h-5 text-green-600" />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-slate-700">{service.rating}</span>
            <span className="text-sm text-slate-500">({service.reviews})</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-500">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">{Math.floor(Math.random() * 50) + 10} views</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-blue-600">{service.price}</div>
            {service.originalPrice && (
              <div className="text-sm text-slate-400 line-through">{service.originalPrice}</div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5">
            Book Now
          </button>
          <button className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )

  const handleLogout = async () => {
    setLoading(true)
    setLogoutError("")
    try {
      await logout()
      navigate("/login")
    } catch (err: any) {
      setLogoutError("Logout failed. Please try again.")
    } finally {
      setLoading(false)
      setLogoutModal(false)
    }
  }

  // Handler: Update profile (including profile image) - memoized
  const handleProfileUpdate = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setProfileUpdating(true)
    setProfileError("")
    try {
      const formData = new FormData()

      // For client, combine first and last name
      if (user.userType === "client") {
        const name = `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
        if (name) {
          formData.append("name", name)
        }
      }

      // Common fields for all service providers
      if (profileFields.businessName && profileFields.businessName.trim()) {
        formData.append("businessName", profileFields.businessName.trim())
      } else {
        formData.append("businessName", " ") // send a space if nothing else
      }
      if (profileFields.description && profileFields.description.trim()) {
        formData.append("description", profileFields.description.trim())
      }
      if (profileFields.specializations && profileFields.specializations.trim()) {
        profileFields.specializations
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .forEach((val: string) => {
            formData.append("specializations[]", val)
          })
      }
      if (profileFields.location && profileFields.location.trim()) {
        formData.append("location[name]", profileFields.location.trim())
      }

      // Service provider specific fields
      switch (userType) {
        case "photographer":
          const hourlyRateNum = Number(profileFields.hourlyRate)
          if (!isNaN(hourlyRateNum) && hourlyRateNum > 0) {
            formData.append("hourlyRate", hourlyRateNum.toString())
          }
          if (profileFields.experience && profileFields.experience.trim()) {
            formData.append("experience", profileFields.experience.trim())
          }
          break

        case "makeupArtist":
          const sessionRateNum = Number(profileFields.sessionRate)
          if (!isNaN(sessionRateNum) && sessionRateNum > 0) {
            formData.append("sessionRate", sessionRateNum.toString())
          }
          const bridalPackageRateNum = Number(profileFields.bridalPackageRate)
          if (!isNaN(bridalPackageRateNum) && bridalPackageRateNum > 0) {
            formData.append("bridalPackageRate", bridalPackageRateNum.toString())
          }
          const experienceYearsNum = Number(profileFields.experienceYears)
          if (!isNaN(experienceYearsNum) && experienceYearsNum >= 0) {
            formData.append("experienceYears", experienceYearsNum.toString())
          }
          if (profileFields.brands && profileFields.brands.trim()) {
            profileFields.brands
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
              .forEach((val: string) => {
                formData.append("brands[]", val)
              })
          }
          formData.append("offersHairServices", profileFields.offersHairServices ? "true" : "false")
          formData.append("travelsToClient", profileFields.travelsToClient ? "true" : "false")
          if (profileFields.availableDates && profileFields.availableDates.trim()) {
            profileFields.availableDates
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
              .forEach((val: string) => {
                formData.append("availableDates[]", val)
              })
          }
          break

        case "caterer":
          const packageStartingPriceNum = Number(profileFields.packageStartingPrice)
          if (!isNaN(packageStartingPriceNum) && packageStartingPriceNum > 0) {
            formData.append("packageStartingPrice", packageStartingPriceNum.toString())
          }
          const pricePerPersonNum = Number(profileFields.pricePerPerson)
          if (!isNaN(pricePerPersonNum) && pricePerPersonNum > 0) {
            formData.append("pricePerPerson", pricePerPersonNum.toString())
          }
          const capacityNum = Number(profileFields.capacity)
          if (!isNaN(capacityNum) && capacityNum > 0) {
            formData.append("capacity", capacityNum.toString())
          }
          break

        case "decorator":
          const decoratorHourlyRateNum = Number(profileFields.hourlyRate)
          if (!isNaN(decoratorHourlyRateNum) && decoratorHourlyRateNum > 0) {
            formData.append("hourlyRate", decoratorHourlyRateNum.toString())
          }
          break

        case "venue":
          const venueCapacityNum = Number(profileFields.capacity)
          if (!isNaN(venueCapacityNum) && venueCapacityNum > 0) {
            formData.append("capacity", venueCapacityNum.toString())
          }
          const venuePricePerPersonNum = Number(profileFields.pricePerPerson)
          if (!isNaN(venuePricePerPersonNum) && venuePricePerPersonNum > 0) {
            formData.append("pricePerPerson", venuePricePerPersonNum.toString())
          }
          break
        case "eventOrganizer":
        case "event_organizer":
          break
      }

      if (profileImageFile) {
        formData.append(userType === "venue" ? "image" : "profileImage", profileImageFile)
      }

      // Dynamically select endpoint based on userType
      let endpoint = ""
      switch (userType) {
        case "photographer":
          endpoint = "/photographers/profile"
          break
        case "makeupArtist":
          endpoint = "/makeup-artists/profile"
          break
        case "decorator":
          endpoint = "/decorators/profile"
          break
        case "caterer":
          endpoint = "/caterers/profile"
          break
        case "venue":
          endpoint = "/venues/profile"
          break
        case "eventOrganizer":
        case "event_organizer":
          endpoint = "/event-organizers/profile"
          break
        default:
          throw new Error("Unknown service provider type")
      }

      await api.put(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setProfileImageFile(null)
      refreshProfile()
    } catch (err: any) {
      setProfileError(err.response?.data?.message || err.message || "Failed to update profile.")
    } finally {
      setProfileUpdating(false)
    }
  }, [user.userType, personalInfo, profileFields, profileImageFile, userType, refreshProfile])

  // Handler: Add portfolio images - memoized
  const handleAddPortfolioImages = useCallback(async (files: File[]) => {
    if (!user?.userType) return
    let endpoint = ""
    switch (userType) {
      case "photographer":
        endpoint = "/photographers/portfolio/images"
        break
      case "venue":
        endpoint = "/venues/portfolio/images"
        break
      case "caterer":
        endpoint = "/caterers/portfolio/images"
        break
      case "decorator":
        endpoint = "/decorators/portfolio/images"
        break
      case "makeupArtist":
        endpoint = "/makeup-artists/portfolio/images"
        break
      case "eventOrganizer":
      case "event_organizer":
        endpoint = "/event-organizers/portfolio/images"
        break
      default:
        alert("Unknown service provider type")
        return
    }

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append("portfolioImage", file)
        await api.post(endpoint, formData)
      }
      refreshProfile()
      } catch (err) {
      alert("Failed to upload portfolio image(s).")
    }
  }, [user?.userType, userType, refreshProfile])

  // Handler: Delete portfolio image - memoized
  const handleDeletePortfolioImage = useCallback(async (imageUrl: string) => {
    if (!user?.userType) return
    let endpoint = ""
    switch (userType) {
      case "photographer":
        endpoint = "/photographers/portfolio/images"
        break
      case "venue":
        endpoint = "/venues/portfolio/images"
        break
      case "caterer":
        endpoint = "/caterers/portfolio/images"
        break
      case "decorator":
        endpoint = "/decorators/portfolio/images"
        break
      case "makeupArtist":
        endpoint = "/makeup-artists/portfolio/images"
        break
      case "eventOrganizer":
      case "event_organizer":
        endpoint = "/event-organizers/portfolio/images"
        break
      default:
        alert("Unknown service provider type")
        return
    }

    try {
      await api.delete(endpoint, { data: { imageUrl } })
      refreshProfile()
    } catch (err) {
      alert("Failed to delete portfolio image.")
    }
  }, [user?.userType, userType, refreshProfile])

  // Enhanced EventsTab for event organizers with CRUD
  const EventsTab = () => {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [editingEvent, setEditingEvent] = useState<any | null>(null)
    const [form, setForm] = useState<{
      title: string
      description: string
      eventType: string
      eventDate: string
      eventTime: string
      location: string
      image: File | null
      gallery: File[]
      maxCapacity: string
      ticketPrice: string
      isTicketed: boolean
    }>( {
      title: "",
      description: "",
      eventType: "",
      eventDate: "",
      eventTime: "",
      location: "",
      image: null,
      gallery: [],
      maxCapacity: "",
      ticketPrice: "",
      isTicketed: false,
    })
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState("")

    const fetchEvents = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await eventService.getMyEvents()
        setEvents(data || [])
      } catch (err) {
        setError("Failed to load events")
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      fetchEvents()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target
      const { name, value, type } = target

      if (type === "file") {
        const input = target as HTMLInputElement
        if (name === "image" && input.files && input.files[0]) {
          setForm((f) => ({ ...f, image: input.files![0] }))
        } else if (name === "gallery" && input.files && input.files.length > 0) {
          setForm((f) => ({ ...f, gallery: Array.from(input.files!) }))
        }
      } else if (type === "checkbox") {
        const input = target as HTMLInputElement
        setForm((f) => ({ ...f, [name]: input.checked }))
      } else {
        setForm((f) => ({ ...f, [name]: value }))
      }
    }

    const handleEdit = (event: any) => {
      setEditingEvent(event)
      setForm({
        title: event.title || "",
        description: event.description || "",
        eventType: event.eventType || "",
        eventDate: event.eventDate ? event.eventDate.slice(0, 10) : "",
        eventTime: event.eventTime || "",
        location: event.location?.name || "",
        image: null,
        gallery: [],
        maxCapacity: event.maxCapacity ? String(event.maxCapacity) : "",
        ticketPrice: event.ticketPrice ? String(event.ticketPrice) : "",
        isTicketed: !!event.isTicketed,
      })
      setShowForm(true)
    }

    const handleDelete = async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this event?")) return
      try {
        await eventService.deleteEvent(id)
        fetchEvents()
      } catch {
        alert("Failed to delete event")
      }
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setFormLoading(true)
      setFormError("")
      try {
        const payload: any = {
          title: form.title,
          description: form.description,
          eventType: form.eventType,
          eventDate: form.eventDate,
          eventTime: form.eventTime,
          image: form.image,
          gallery: form.gallery,
          maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : undefined,
          ticketPrice: form.ticketPrice ? Number(form.ticketPrice) : undefined,
          isTicketed: form.isTicketed,
        }

        // Only add location if non-empty and non-whitespace
        if (typeof form.location === "string" && form.location.trim() !== "") {
          payload.location = { name: form.location }
        } else {
          // Ensure location is not present as empty string
          delete payload.location
        }

        if (editingEvent) {
          await eventService.updateEvent(editingEvent.id, payload)
        } else {
          await eventService.createEvent({
            ...payload,
            status: 'draft',
            visibility: 'private',
          })
        }
        setShowForm(false)
        setEditingEvent(null)
        setForm({
          title: "",
          description: "",
          eventType: "",
          eventDate: "",
          eventTime: "",
          location: "",
          image: null,
          gallery: [],
          maxCapacity: "",
          ticketPrice: "",
          isTicketed: false,
        })
        fetchEvents()
      } catch (err) {
        setFormError("Failed to save event")
      } finally {
        setFormLoading(false)
      }
    }

    const handlePublish = async (eventId: string) => {
      try {
        await eventService.updateEvent(eventId, { status: 'published', visibility: 'public' })
        fetchEvents()
      } catch {
        alert('Failed to publish event')
      }
    }

    const getEventTypeIcon = (eventType: string) => {
      switch (eventType) {
        case "concert":
        case "musicFestival":
          return <Calendar className="w-5 h-5" />
        case "wedding":
        case "birthday":
        case "anniversary":
          return <Heart className="w-5 h-5" />
        case "corporate":
        case "conference":
        case "seminar":
          return <Users className="w-5 h-5" />
        case "sports_event":
          return <Activity className="w-5 h-5" />
        default:
          return <Calendar className="w-5 h-5" />
      }
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case "published":
          return "bg-green-100 text-green-800"
        case "draft":
          return "bg-yellow-100 text-yellow-800"
        case "cancelled":
          return "bg-red-100 text-red-800"
        default:
          return "bg-slate-100 text-slate-800"
      }
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center">
            <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
            My Events
          </h2>
          <button
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2"
            onClick={() => {
              setShowForm(true)
              setEditingEvent(null)
              setForm({
                title: "",
                description: "",
                eventType: "",
                eventDate: "",
                eventTime: "",
                location: "",
                image: null,
                gallery: [],
                maxCapacity: "",
                ticketPrice: "",
                isTicketed: false,
              })
            }}
          >
            <Plus className="w-5 h-5" />
            <span>Add Event</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-slate-600">Loading events...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-red-600 font-semibold mb-2">Error Loading Events</div>
            <div className="text-red-500">{error}</div>
            <button
              onClick={fetchEvents}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Events Yet</h3>
            <p className="text-slate-600 mb-6">Create your first event to get started with event management.</p>
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
              onClick={() => {
                setShowForm(true)
                setEditingEvent(null)
                setForm({
                  title: "",
                  description: "",
                  eventType: "",
                  eventDate: "",
                  eventTime: "",
                  location: "",
                  image: null,
                  gallery: [],
                  maxCapacity: "",
                  ticketPrice: "",
                  isTicketed: false,
                })
              }}
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="relative">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status || "draft")}`}
                    >
                      {(event.status || "draft").charAt(0).toUpperCase() + (event.status || "draft").slice(1)}
                    </span>
                  </div>
                  {event.isTicketed && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>Ticketed</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2 text-slate-500">
                      {getEventTypeIcon(event.eventType)}
                      <span className="text-sm font-medium capitalize">
                        {event.eventType?.replace(/_/g, " ") || "Event"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{event.description?.slice(0, 100)}...</p>

                  <div className="space-y-2 mb-6">
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
                    {typeof event.availableTickets === "number" && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <TicketIcon className="w-4 h-4" />
                        <span>{event.availableTickets} tickets available</span>
                      </div>
                    )}
                    {event.ticketPrice && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <DollarSign className="w-4 h-4" />
                        <span>Rs. {event.ticketPrice}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>

                    {event.status === "draft" && (
                      <button
                        className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors flex items-center justify-center space-x-1"
                        onClick={() => handlePublish(event.id)}
                      >
                        <Globe className="w-4 h-4" />
                        <span>Publish</span>
                      </button>
                    )}

                    <button
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => handleDelete(event.id)}
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))} 
          </div>
        )}

        {/* Enhanced Event Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {editingEvent ? "Edit Event" : "Create New Event"}
                  </h3>
                  <button
                    className="text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    onClick={() => {
                      setShowForm(false)
                      setEditingEvent(null)
                    }}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="text-red-600 font-semibold">{formError}</div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Event Title</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-32 resize-none"
                      placeholder="Describe your event..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type</label>
                    <select
                      name="eventType"
                      value={form.eventType}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    >
                      <option value="">Select event type</option>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Event location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Event Date</label>
                    <input
                      type="date"
                      name="eventDate"
                      value={form.eventDate}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Event Time</label>
                    <input
                      type="time"
                      name="eventTime"
                      value={form.eventTime}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Max Capacity</label>
                    <input
                      type="number"
                      name="maxCapacity"
                      value={form.maxCapacity}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min="0"
                      placeholder="Maximum attendees"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Ticket Price (Rs.)</label>
                    <input
                      type="number"
                      name="ticketPrice"
                      value={form.ticketPrice}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min="0"
                      step="0.01"
                      placeholder="Price per ticket"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Main Event Image</label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Gallery Images</label>
                    <input
                      type="file"
                      name="gallery"
                      accept="image/*"
                      multiple
                      onChange={handleInputChange}
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        name="isTicketed"
                        checked={form.isTicketed}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-slate-700">This is a ticketed event</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    onClick={() => {
                      setShowForm(false)
                      setEditingEvent(null)
                    }}
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={formLoading}
                  >
                    {formLoading ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  const EVENT_TYPES = [
    "concert",
    "musicFestival",
    "dancePerformance",
    "comedy_show",
    "theater",
    "cultural_show",
    "wedding",
    "birthday",
    "anniversary",
    "graduation",
    "corporate",
    "conference",
    "seminar",
    "workshop",
    "product_launch",
    "sports_event",
    "charity_event",
    "exhibition",
    "trade_show",
    "festival_celebration",
    "religious_ceremony",
    "party",
    "other",
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-3 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>

        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "browse" && <BrowseTab />}
        {isEventOrganizer && activeTab === "events" && <EventsTab />}
        {!isEventOrganizer && activeTab === "bookings" && <BookingsTab />}
        {!isEventOrganizer && activeTab === "packages" && <PackagesTab />}
        {activeTab === "favorites" && <FavoritesTab />}
        {activeTab === "messages" && <MessagesTab />}
        {activeTab === "profile" && <ProfileTab />}
      </main>
    </div>
  )
}

export default ServiceProviderDashboard