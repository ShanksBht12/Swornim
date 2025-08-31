"use client"

// @ts-nocheck
import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles, MapPin, CheckCircle, AlertCircle, DollarSign, Star, ImageIcon, User, Palette } from "lucide-react"
// @ts-ignore
import { decoratorService } from "../../../services/decoratorService"
import { useServiceProviderProfile } from "../../../context/ServiceProviderProfileContext"

const initialState = {
  businessName: "",
  packageStartingPrice: "",
  hourlyRate: "",
  specializations: "", // comma separated
  themes: "", // comma separated
  portfolio: "", // comma separated URLs
  description: "",
  // Location fields
  locationName: "",
  latitude: "",
  longitude: "",
  address: "",
  city: "",
  country: "",
  state: "",
}

const CompleteProfileDecorator = () => {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()
  const { profile, loading: profileLoading, refreshProfile } = useServiceProviderProfile()

  useEffect(() => {
    if (profile) {
      setForm({
        businessName: profile.businessName || "",
        packageStartingPrice: profile.packageStartingPrice || "",
        hourlyRate: profile.hourlyRate || "",
        specializations: (profile.specializations || []).join(", "),
        themes: (profile.themes || []).join(", "),
        portfolio: (profile.portfolio || []).join(", "),
        description: profile.description || "",
        locationName: profile.location?.name || "",
        latitude: profile.location?.latitude?.toString() || "",
        longitude: profile.location?.longitude?.toString() || "",
        address: profile.location?.address || "",
        city: profile.location?.city || "",
        country: profile.location?.country || "",
        state: profile.location?.state || "",
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const payload = {
        businessName: form.businessName,
        packageStartingPrice: Number.parseFloat(form.packageStartingPrice),
        hourlyRate: Number.parseFloat(form.hourlyRate),
        specializations: form.specializations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        themes: form.themes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        portfolio: form.portfolio
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        description: form.description,
        location: {
          name: form.locationName,
          latitude: Number.parseFloat(form.latitude),
          longitude: Number.parseFloat(form.longitude),
          address: form.address,
          city: form.city,
          country: form.country,
          state: form.state,
        },
      }
      await decoratorService.createProfile(payload)
      await refreshProfile()
      setSuccess("Profile completed! Redirecting...")
      setTimeout(() => navigate("/service-provider-dashboard"), 1200)
    } catch (err: any) {
      setError(err.message || "Failed to save profile.")
    } finally {
      setLoading(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="card p-8">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Complete Your Decorator Profile</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Showcase your creative designs and connect with clients looking to transform their event spaces
            </p>
          </div>

          <div className="card p-8 lg:p-12 animate-fade-in">
            {/* Success Alert */}
            {success && (
              <div className="p-4 bg-success-50 border border-success-200 rounded-xl mb-8 animate-fade-in">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <p className="text-success-800 font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-error-50 border border-error-200 rounded-xl mb-8 animate-fade-in">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0" />
                  <p className="text-error-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Business Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Business Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Business Name *</label>
                    <input
                      name="businessName"
                      value={form.businessName}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Your decoration business name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Description *</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      className="form-input"
                      rows={3}
                      placeholder="Describe your decoration style and creative approach..."
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-success-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Pricing</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Package Starting Price (NPR) *</label>
                    <input
                      name="packageStartingPrice"
                      value={form.packageStartingPrice}
                      onChange={handleChange}
                      required
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="15000"
                    />
                  </div>
                  <div>
                    <label className="form-label">Hourly Rate (NPR) *</label>
                    <input
                      name="hourlyRate"
                      value={form.hourlyRate}
                      onChange={handleChange}
                      required
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="2000"
                    />
                  </div>
                </div>
              </div>

              {/* Specializations & Themes */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Palette className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Specializations & Themes</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Specializations *</label>
                    <input
                      name="specializations"
                      value={form.specializations}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Wedding, Birthday, Corporate, Festival"
                    />
                    <p className="text-sm text-slate-500 mt-1">Separate with commas</p>
                  </div>
                  <div>
                    <label className="form-label">Themes *</label>
                    <input
                      name="themes"
                      value={form.themes}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Traditional, Modern, Vintage, Floral, Minimalist"
                    />
                    <p className="text-sm text-slate-500 mt-1">Separate with commas</p>
                  </div>
                </div>
              </div>

              {/* Portfolio */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Portfolio</h2>
                </div>

                <div>
                  <label className="form-label">Portfolio Image URLs</label>
                  <input
                    name="portfolio"
                    value={form.portfolio}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://example.com/decoration1.jpg, https://example.com/decoration2.jpg"
                  />
                  <p className="text-sm text-slate-500 mt-1">Separate multiple URLs with commas</p>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Location *</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Location Name *</label>
                    <input
                      name="locationName"
                      value={form.locationName}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Studio name or area"
                    />
                  </div>
                  <div>
                    <label className="form-label">Address *</label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="form-label">City *</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Kathmandu"
                    />
                  </div>
                  <div>
                    <label className="form-label">Country *</label>
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Nepal"
                    />
                  </div>
                  <div>
                    <label className="form-label">State</label>
                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Bagmati"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Latitude *</label>
                    <input
                      name="latitude"
                      value={form.latitude}
                      onChange={handleChange}
                      required
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="27.7172"
                    />
                  </div>
                  <div>
                    <label className="form-label">Longitude *</label>
                    <input
                      name="longitude"
                      value={form.longitude}
                      onChange={handleChange}
                      required
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="85.3240"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner w-5 h-5 mr-2" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Star className="w-5 h-5 mr-2" />
                      Complete Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompleteProfileDecorator
