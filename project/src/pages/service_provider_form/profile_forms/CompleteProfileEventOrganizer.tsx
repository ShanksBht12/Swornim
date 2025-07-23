import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventOrganizerService } from '../../../services/eventOrganizerService';
import { useServiceProviderProfile } from '../../../context/ServiceProviderProfileContext';

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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { refreshProfile, loading: profileLoading } = useServiceProviderProfile();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm({
        ...form,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Prepare the data for submission
      const payload = {
        businessName: form.businessName,
        description: form.description,
        packageStartingPrice: Number(form.packageStartingPrice),
        hourlyConsultationRate: Number(form.hourlyConsultationRate),
        eventTypes: form.eventTypes.split(',').map((s: string) => s.trim()).filter(Boolean),
        services: form.services.split(',').map((s: string) => s.trim()).filter(Boolean),
        experienceYears: Number(form.experienceYears),
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        offersVendorCoordination: form.offersVendorCoordination,
        offersVenueBooking: form.offersVenueBooking,
        offersFullPlanning: form.offersFullPlanning,
        location: {
          name: form.locationName,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
          address: form.address,
          city: form.city,
          state: form.state,
          country: form.country,
        },
      };
      // Use the correct endpoint for event organizer profile creation
      await eventOrganizerService.createProfile(payload);
      await refreshProfile();
      setSuccess("Profile completed successfully!");
      setTimeout(() => navigate("/service-provider-dashboard"), 1200);
    } catch (err: any) {
      setError(err.message || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="card p-8">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <form onSubmit={handleSubmit} className="card p-8 max-w-lg w-full space-y-6 shadow-xl bg-white rounded-2xl">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Complete Your Event Organizer Profile</h2>
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded">{success}</div>
        )}
        <div>
          <label className="block text-sm font-semibold mb-1">Business Name</label>
          <input
            type="text"
            name="businessName"
            className="w-full p-3 border border-slate-300 rounded-xl"
            value={form.businessName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea
            name="description"
            className="w-full p-3 border border-slate-300 rounded-xl"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Package Starting Price (NPR)</label>
          <input
            type="number"
            name="packageStartingPrice"
            className="w-full p-3 border border-slate-300 rounded-xl"
            value={form.packageStartingPrice}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Hourly Consultation Rate (NPR)</label>
          <input
            type="number"
            name="hourlyConsultationRate"
            className="w-full p-3 border border-slate-300 rounded-xl"
            value={form.hourlyConsultationRate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Event Types <span className="text-xs text-slate-400">(comma separated)</span></label>
          <input
            type="text"
            name="eventTypes"
            className="w-full p-3 border border-slate-300 rounded-xl"
            value={form.eventTypes}
            onChange={handleChange}
            placeholder="e.g. wedding, conference, seminar"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Services <span className="text-xs text-slate-400">(comma separated)</span></label>
          <input
            type="text"
            name="services"
            className="w-full p-3 border border-slate-300 rounded-xl"
            value={form.services}
            onChange={handleChange}
            placeholder="e.g. planning, coordination, vendor management"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Experience Years</label>
          <input
            type="number"
            name="experienceYears"
            className="w-full p-3 border border-slate-300 rounded-xl"
            value={form.experienceYears}
            onChange={handleChange}
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Contact Email</label>
          <input
            type="email"
            name="contactEmail"
            className="w-full p-3 border border-slate-300 rounded-xl"
            value={form.contactEmail}
            onChange={handleChange}
            placeholder="example@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Contact Phone</label>
          <input
            type="text"
            name="contactPhone"
            className="w-full p-3 border border-slate-300 rounded-xl"
            value={form.contactPhone}
            onChange={handleChange}
            placeholder="e.g. 9800000000"
          />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="offersVendorCoordination"
              checked={form.offersVendorCoordination}
              onChange={handleChange}
            />
            Offers Vendor Coordination
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="offersVenueBooking"
              checked={form.offersVenueBooking}
              onChange={handleChange}
            />
            Offers Venue Booking
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="offersFullPlanning"
              checked={form.offersFullPlanning}
              onChange={handleChange}
            />
            Offers Full Planning
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Location Name</label>
            <input
              type="text"
              name="locationName"
              className="w-full p-3 border border-slate-300 rounded-xl"
              value={form.locationName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Latitude</label>
            <input
              type="number"
              name="latitude"
              className="w-full p-3 border border-slate-300 rounded-xl"
              value={form.latitude}
              onChange={handleChange}
              step="any"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Longitude</label>
            <input
              type="number"
              name="longitude"
              className="w-full p-3 border border-slate-300 rounded-xl"
              value={form.longitude}
              onChange={handleChange}
              step="any"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Address</label>
            <input
              type="text"
              name="address"
              className="w-full p-3 border border-slate-300 rounded-xl"
              value={form.address}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">City</label>
            <input
              type="text"
              name="city"
              className="w-full p-3 border border-slate-300 rounded-xl"
              value={form.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">State</label>
            <input
              type="text"
              name="state"
              className="w-full p-3 border border-slate-300 rounded-xl"
              value={form.state}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Country</label>
            <input
              type="text"
              name="country"
              className="w-full p-3 border border-slate-300 rounded-xl"
              value={form.country}
              onChange={handleChange}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default CompleteProfileEventOrganizer; 