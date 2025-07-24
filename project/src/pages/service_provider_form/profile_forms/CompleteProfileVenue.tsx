"use client"

// @ts-nocheck
import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building, MapPin, CheckCircle, AlertCircle, Users, Star, ImageIcon, User } from "lucide-react"
// @ts-ignore
import { venueService } from "../../../services/venueService"
import { useServiceProviderProfile } from "../../../context/ServiceProviderProfileContext"
import { FileUpload } from "../../../components/FileUpload"
import LocationPicker from "../../../components/LocationPicker" // Import the enhanced LocationPicker

const initialState = {
  businessName: "",
  capacity: "",
  pricePerHour: "",
  amenities: "", // comma separated
  images: "", // comma separated URLs
  venueTypes: "", // comma separated
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

const CompleteProfileVenue = () => {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()
  const { profile, loading: profileLoading, refreshProfile } = useServiceProviderProfile()
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [venueImageFiles, setVenueImageFiles] = useState<File[]>([])

  useEffect(() => {
    if (profile) {
      const p = profile as any
      setForm({
        businessName: p.businessName || "",
        capacity: p.capacity || "",
        pricePerHour: p.pricePerHour || "",
        amenities: (p.amenities || []).join(", "),
        images: (p.images || []).join(", "),
        venueTypes: (p.venueTypes || []).join(", "),
        description: p.description || "",
        locationName: p.location?.name || "",
        latitude: p.location?.latitude?.toString() || "",
        longitude: p.location?.longitude?.toString() || "",
        address: p.location?.address || "",
        city: p.location?.city || "",
        country: p.location?.country || "",
        state: p.location?.state || "",
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
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
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("businessName", form.businessName);
      formData.append("capacity", form.capacity ? String(form.capacity) : "0");
      formData.append("pricePerHour", form.pricePerHour ? String(form.pricePerHour) : "0");
      formData.append("description", form.description);
      formData.append("venueTypes", JSON.stringify(form.venueTypes.split(",").map(s => s.trim()).filter(Boolean)));
      formData.append("amenities", JSON.stringify(form.amenities.split(",").map(s => s.trim()).filter(Boolean)));
      // Location as JSON string
      const location: any = {
        name: form.locationName,
        latitude: form.latitude ? Number(form.latitude) : 0,
        longitude: form.longitude ? Number(form.longitude) : 0,
        address: form.address,
        city: form.city,
        country: form.country,
      };
      if (form.state) location.state = form.state;
      formData.append("location", JSON.stringify(location));
      if (profileImageFile) {
        formData.append("image", profileImageFile); // Use 'image' as in backend
      }
      await venueService.createProfile(formData);
      await refreshProfile();
      setSuccess("Profile completed! Redirecting...");
      setTimeout(() => navigate("/service-provider-dashboard"), 1200);
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setLoading(false);
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
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Complete Your Venue Profile</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Showcase your venue and connect with clients looking for the perfect event space
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
              {/* Venue Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Venue Information</h2>
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
                      placeholder="Your venue name"
                    />
                  </div>
                  <div>
                    <label className="form-label">Venue Types *</label>
                    <input
                      name="venueTypes"
                      value={form.venueTypes}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Wedding Hall, Conference Room, Garden, Banquet"
                    />
                    <p className="text-sm text-slate-500 mt-1">Separate with commas</p>
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
                    placeholder="Describe your venue's unique features and atmosphere..."
                  />
                </div>
              </div>

              {/* Capacity & Pricing */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-success-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Capacity & Pricing</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Capacity (People) *</label>
                    <input
                      name="capacity"
                      value={form.capacity}
                      onChange={handleChange}
                      required
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="200"
                    />
                  </div>
                  <div>
                    <label className="form-label">Price Per Hour (NPR) *</label>
                    <input
                      name="pricePerHour"
                      value={form.pricePerHour}
                      onChange={handleChange}
                      required
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="5000"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities & Features */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Amenities & Features</h2>
                </div>

                <div>
                  <label className="form-label">Amenities *</label>
                  <input
                    name="amenities"
                    value={form.amenities}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="AC, Sound System, Parking, Catering Kitchen, Stage, WiFi"
                  />
                  <p className="text-sm text-slate-500 mt-1">Separate with commas</p>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Venue Images</h2>
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

                  <div>
                    <label className="form-label">Venue Images</label>
                    <FileUpload
                      onFilesSelected={(files) => setVenueImageFiles(files)}
                      maxSize={5}
                      multiple={true}
                      label="Upload Venue Images"
                      placeholder="Click to select or drag and drop your venue images"
                      disabled={loading}
                    />
                    {venueImageFiles.length > 0 && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-800">
                            Selected: {venueImageFiles.length} image{venueImageFiles.length > 1 ? "s" : ""}
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
                    Search for your location, use your current location, or click on the map to set your exact venue
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
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="form-label">Location Name *</label>
                          <input
                            name="locationName"
                            value={form.locationName}
                            onChange={handleChange}
                            required
                            className="form-input"
                            placeholder="Venue name or area"
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

export default CompleteProfileVenue
