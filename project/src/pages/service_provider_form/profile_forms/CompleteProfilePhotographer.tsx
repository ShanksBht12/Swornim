"use client"

// @ts-nocheck
import type React from "react"
import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, MapPin, CheckCircle, AlertCircle, Star, ImageIcon, User, Sparkles } from "lucide-react"
import { useServiceProviderProfile } from "../../../context/ServiceProviderProfileContext"
import { FileUpload } from "../../../components/FileUpload"
import LocationPicker from "../../../components/LocationPicker" // Import the enhanced LocationPicker
import api from "../../../services/api"

const initialState = {
  businessName: "",
  hourlyRate: "",
  specializations: "", // comma separated
  description: "",
  profileImage: "",
  portfolioImages: "", // comma separated URLs
  // Location fields - now managed by LocationPicker
  locationName: "",
  latitude: "",
  longitude: "",
  address: "",
  city: "",
  country: "",
}

const CompleteProfilePhotographer = () => {
  // File upload state
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [portfolioImageFiles, setPortfolioImageFiles] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()
  const { profile, loading: profileLoading, refreshProfile } = useServiceProviderProfile()
  const hasNavigatedRef = useRef(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Handle location changes from LocationPicker
  const handleLocationChange = (location: {
    latitude: string;
    longitude: string;
    address: string;
    city: string;
    country: string;
    locationName: string;
  }) => {
    setForm({
      ...form,
      ...location
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setUploadingImages(true)
    setError("")
    setSuccess("")

    // Validate required fields
    if (
      !form.businessName ||
      !form.hourlyRate ||
      !form.specializations ||
      !form.locationName ||
      !form.latitude ||
      !form.longitude ||
      !form.address ||
      !form.city ||
      !form.country
    ) {
      setError("Please fill in all required fields including location.")
      setLoading(false)
      setUploadingImages(false)
      return
    }

    try {
      // 1. Create FormData for profile creation
      const formData = new FormData()
      if (form.businessName) formData.append("businessName", form.businessName)
      if (form.hourlyRate) formData.append("hourlyRate", form.hourlyRate)
      form.specializations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((val) => {
          formData.append("specializations[]", val)
        })
      if (form.description) formData.append("description", form.description)
      if (form.locationName) formData.append("location[name]", form.locationName)
      if (form.latitude) formData.append("location[latitude]", form.latitude)
      if (form.longitude) formData.append("location[longitude]", form.longitude)
      if (form.address) formData.append("location[address]", form.address)
      if (form.city) formData.append("location[city]", form.city)
      if (form.country) formData.append("location[country]", form.country)

      // 2. Add profile image file if selected
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile)
      }

      // 3. Send profile creation request
      await api.post("/photographers/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // ...auth headers if needed
        },
      })

      // 4. Upload portfolio images (if any)
      if (portfolioImageFiles.length > 0) {
        for (const file of portfolioImageFiles) {
          const pfFormData = new FormData()
          pfFormData.append("portfolioImage", file)
          await api.post("/photographers/portfolio/images", pfFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
              // ...auth headers if needed
            },
          })
        }
      }

      setSuccess("Profile completed successfully!")
      setTimeout(() => {
        navigate("/service-provider-dashboard", { replace: true })
      }, 1500)
    } catch (err: any) {
      if (
        (err.response && err.response.status === 409) ||
        err.response?.data?.message?.toLowerCase().includes("already exists")
      ) {
        navigate("/service-provider-dashboard", { replace: true })
        return
      }
      setError(err.response?.data?.message || err.message || "Failed to save profile.")
    } finally {
      setLoading(false)
      setUploadingImages(false)
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
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Camera className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Complete Your Photographer Profile</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Showcase your photography skills and connect with clients looking to capture their special moments
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
                      placeholder="Your photography business name"
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
                      placeholder="2500"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="form-input"
                    rows={3}
                    placeholder="Tell clients about your photography style and experience..."
                  />
                </div>
              </div>

              {/* Specializations */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Specializations</h2>
                </div>

                <div>
                  <label className="form-label">Photography Specializations *</label>
                  <input
                    name="specializations"
                    value={form.specializations}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Wedding, Portrait, Event, Fashion, Product"
                  />
                  <p className="text-sm text-slate-500 mt-1">Separate with commas</p>
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

                <div className="space-y-6">
                  <div>
                    <label className="form-label">Profile Image</label>
                    <FileUpload
                      onFilesSelected={(files) => setProfileImageFile(files[0] || null)}
                      maxSize={5}
                      multiple={false}
                      label="Upload Profile Image"
                      placeholder="Click to select or drag and drop your profile image"
                      disabled={uploadingImages}
                    />
                    {profileImageFile && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">Selected: {profileImageFile.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Portfolio Images</label>
                    <FileUpload
                      onFilesSelected={(files) => setPortfolioImageFiles(files)}
                      maxSize={5}
                      multiple={true}
                      label="Upload Portfolio Images"
                      placeholder="Click to select or drag and drop your portfolio images"
                      disabled={uploadingImages}
                    />
                    {portfolioImageFiles.length > 0 && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-800">
                            Selected: {portfolioImageFiles.length} image{portfolioImageFiles.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Location Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Location *</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-600">
                    Search for your location, use your current location, or click on the map to set your exact business location.
                  </p>
                  
                  {/* Enhanced Location Picker */}
                  <LocationPicker
                    value={{
                      latitude: form.latitude,
                      longitude: form.longitude,
                      address: form.address,
                      city: form.city,
                      country: form.country,
                      locationName: form.locationName
                    }}
                    onChange={handleLocationChange}
                  />

                  {/* Manual entry fallback (hidden when location is selected via picker) */}
                  {!form.latitude && !form.longitude && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Or enter location manually</h3>
                      <div className="grid md:grid-cols-2 gap-4">
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
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center"
                  disabled={loading || uploadingImages}
                >
                  {loading || uploadingImages ? (
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

export default CompleteProfilePhotographer