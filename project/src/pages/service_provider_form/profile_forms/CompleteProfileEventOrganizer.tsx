"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, MapPin, CheckCircle, AlertCircle, Star, ImageIcon, User } from "lucide-react"
import { eventOrganizerService } from "../../../services/eventOrganizerService"
import { useServiceProviderProfile } from "../../../context/ServiceProviderProfileContext"
import { FileUpload } from "../../../components/FileUpload"
import LocationPicker from "../../../components/LocationPicker" // Import the enhanced LocationPicker

const CompleteProfileEventOrganizer = () => {
  const [form, setForm] = useState({
    businessName: "",
    description: "",
    packageStartingPrice: "",
    hourlyConsultationRate: "",
    eventTypes: "",
    services: "",
    experienceYears: "",
    contactEmail: "",
    contactPhone: "",
    offersVendorCoordination: true,
    offersVenueBooking: false,
    offersFullPlanning: true,
    locationName: "",
    latitude: "",
    longitude: "",
    address: "",
    city: "",
    state: "",
    country: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()
  const { refreshProfile, loading: profileLoading } = useServiceProviderProfile()
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [portfolioImageFiles, setPortfolioImageFiles] = useState<File[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      setForm({
        ...form,
        [name]: (e.target as HTMLInputElement).checked,
      })
    } else {
      setForm({
        ...form,
        [name]: value,
      })
    }
  }

  // Handle location changes from LocationPicker - FIXED
  const handleLocationChange = (location: {
    latitude: string
    longitude: string
    address: string
    city: string
    country: string
    locationName: string
  }) => {
    setForm((prevForm) => ({
      ...prevForm,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      city: location.city,
      country: location.country,
      locationName: location.locationName,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const formData = new FormData()
      if (form.businessName) formData.append("businessName", form.businessName)
      if (form.description) formData.append("description", form.description)
      if (form.packageStartingPrice) formData.append("packageStartingPrice", form.packageStartingPrice)
      if (form.hourlyConsultationRate) formData.append("hourlyConsultationRate", form.hourlyConsultationRate)

      form.eventTypes
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .forEach((val) => {
          formData.append("eventTypes[]", val)
        })

      form.services
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .forEach((val) => {
          formData.append("services[]", val)
        })

      if (form.experienceYears) formData.append("experienceYears", form.experienceYears)
      if (form.contactEmail) formData.append("contactEmail", form.contactEmail)
      if (form.contactPhone) formData.append("contactPhone", form.contactPhone)
      formData.append("offersVendorCoordination", form.offersVendorCoordination.toString())
      formData.append("offersVenueBooking", form.offersVenueBooking.toString())
      formData.append("offersFullPlanning", form.offersFullPlanning.toString())

      if (form.locationName) formData.append("location[name]", form.locationName)
      if (form.latitude) formData.append("location[latitude]", form.latitude)
      if (form.longitude) formData.append("location[longitude]", form.longitude)
      if (form.address) formData.append("location[address]", form.address)
      if (form.city) formData.append("location[city]", form.city)
      if (form.state) formData.append("location[state]", form.state)
      if (form.country) formData.append("location[country]", form.country)

      // Add profile image file if selected
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile)
      }

      await eventOrganizerService.createProfile(formData)

      // Upload portfolio images (if any)
      // if (portfolioImageFiles.length > 0) {
      //   for (const file of portfolioImageFiles) {
      //     await eventOrganizerService.addPortfolioImage(file);
      //   }
      // }

      await refreshProfile()
      setSuccess("Profile completed successfully!")
      setTimeout(() => navigate("/service-provider-dashboard"), 1200)
    } catch (err: any) {
      setError(err.message || "Failed to complete profile")
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
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Complete Your Event Organizer Profile</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Showcase your event planning expertise and connect with clients looking for professional event management
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
                      type="text"
                      name="businessName"
                      className="form-input"
                      value={form.businessName}
                      onChange={handleChange}
                      required
                      placeholder="Your event organizing business name"
                    />
                  </div>
                  <div>
                    <label className="form-label">Experience Years</label>
                    <input
                      type="number"
                      name="experienceYears"
                      className="form-input"
                      value={form.experienceYears}
                      onChange={handleChange}
                      min={0}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    className="form-input"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Tell clients about your event planning expertise and approach..."
                  />
                </div>
              </div>

              {/* Services & Pricing */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-success-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Services & Pricing</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Package Starting Price (NPR) *</label>
                    <input
                      type="number"
                      name="packageStartingPrice"
                      className="form-input"
                      value={form.packageStartingPrice}
                      onChange={handleChange}
                      required
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className="form-label">Hourly Consultation Rate (NPR) *</label>
                    <input
                      type="number"
                      name="hourlyConsultationRate"
                      className="form-input"
                      value={form.hourlyConsultationRate}
                      onChange={handleChange}
                      required
                      placeholder="2000"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">
                      Event Types <span className="text-xs text-slate-400">(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      name="eventTypes"
                      className="form-input"
                      value={form.eventTypes}
                      onChange={handleChange}
                      placeholder="Wedding, Conference, Birthday, Corporate"
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      Services <span className="text-xs text-slate-400">(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      name="services"
                      className="form-input"
                      value={form.services}
                      onChange={handleChange}
                      placeholder="Planning, Coordination, Vendor Management"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      className="form-input"
                      value={form.contactEmail}
                      onChange={handleChange}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div>
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="text"
                      name="contactPhone"
                      className="form-input"
                      value={form.contactPhone}
                      onChange={handleChange}
                      placeholder="9800000000"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="form-label">Service Offerings</p>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="offersVendorCoordination"
                        checked={form.offersVendorCoordination}
                        onChange={handleChange}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm">Vendor Coordination</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="offersVenueBooking"
                        checked={form.offersVenueBooking}
                        onChange={handleChange}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm">Venue Booking</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="offersFullPlanning"
                        checked={form.offersFullPlanning}
                        onChange={handleChange}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm">Full Event Planning</span>
                    </label>
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

                <div className="space-y-6">
                  <div>
                    <label className="form-label">Profile Image</label>
                    <FileUpload
                      onFilesSelected={(files) => setProfileImageFile(files[0] || null)}
                      maxSize={5}
                      multiple={false}
                      label="Upload Profile Image"
                      placeholder="Click to select or drag and drop your profile image"
                      disabled={loading}
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

                  {/* Portfolio Images */}
                  {/*
                  <div>
                    <label className="form-label">Portfolio Images</label>
                    <FileUpload
                      onFilesSelected={(files) => setPortfolioImageFiles(files)}
                      maxSize={5}
                      multiple={true}
                      label="Upload Portfolio Images"
                      placeholder="Click to select or drag and drop your event portfolio images"
                      disabled={loading}
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
                  */}
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
                    Search for your location, use your current location, or click on the map to set your exact business
                    location.
                  </p>

                  {/* Enhanced Location Picker */}
                  <LocationPicker
                    value={{
                      latitude: form.latitude,
                      longitude: form.longitude,
                      address: form.address,
                      city: form.city,
                      country: form.country,
                      locationName: form.locationName,
                    }}
                    onChange={handleLocationChange}
                  />
                  {/* Manual entry fallback (hidden when location is selected via picker) */}
                  {!form.latitude && !form.longitude && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Or enter location manually</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">Location Name</label>
                          <input
                            type="text"
                            name="locationName"
                            className="form-input"
                            value={form.locationName}
                            onChange={handleChange}
                            placeholder="Office name or area"
                          />
                        </div>
                        <div>
                          <label className="form-label">Address</label>
                          <input
                            type="text"
                            name="address"
                            className="form-input"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Street address"
                          />
                        </div>
                        <div>
                          <label className="form-label">City</label>
                          <input
                            type="text"
                            name="city"
                            className="form-input"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="Kathmandu"
                          />
                        </div>
                        <div>
                          <label className="form-label">State</label>
                          <input
                            type="text"
                            name="state"
                            className="form-input"
                            value={form.state}
                            onChange={handleChange}
                            placeholder="Bagmati"
                          />
                        </div>
                        <div>
                          <label className="form-label">Country</label>
                          <input
                            type="text"
                            name="country"
                            className="form-input"
                            value={form.country}
                            onChange={handleChange}
                            placeholder="Nepal"
                          />
                        </div>
                        <div>
                          <label className="form-label">Latitude</label>
                          <input
                            type="number"
                            name="latitude"
                            className="form-input"
                            value={form.latitude}
                            onChange={handleChange}
                            step="any"
                            placeholder="27.7172"
                          />
                        </div>
                        <div>
                          <label className="form-label">Longitude</label>
                          <input
                            type="number"
                            name="longitude"
                            className="form-input"
                            value={form.longitude}
                            onChange={handleChange}
                            step="any"
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

export default CompleteProfileEventOrganizer
