// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import { catererService } from '../../../services/catererService';
import { useServiceProviderProfile } from '../../../context/ServiceProviderProfileContext';

const initialState = {
  businessName: '',
  cuisineTypes: '', // comma separated
  serviceTypes: '', // comma separated
  pricePerPerson: '',
  minGuests: '',
  maxGuests: '',
  menuItems: '', // comma separated
  description: '',
  // Location fields
  locationName: '',
  latitude: '',
  longitude: '',
  address: '',
  city: '',
  country: '',
  state: '',
};

const CompleteProfileCaterer = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { profile, loading: profileLoading, refreshProfile } = useServiceProviderProfile();

  useEffect(() => {
    if (profile) {
      setForm({
        businessName: profile.businessName || '',
        cuisineTypes: (profile.cuisineTypes || []).join(', '),
        serviceTypes: (profile.serviceTypes || []).join(', '),
        pricePerPerson: profile.pricePerPerson || '',
        minGuests: profile.minGuests || '',
        maxGuests: profile.maxGuests || '',
        menuItems: (profile.menuItems || []).join(', '),
        description: profile.description || '',
        locationName: profile.location?.name || '',
        latitude: profile.location?.latitude?.toString() || '',
        longitude: profile.location?.longitude?.toString() || '',
        address: profile.location?.address || '',
        city: profile.location?.city || '',
        country: profile.location?.country || '',
        state: profile.location?.state || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        businessName: form.businessName,
        cuisineTypes: form.cuisineTypes.split(',').map(s => s.trim()).filter(Boolean),
        serviceTypes: form.serviceTypes.split(',').map(s => s.trim()).filter(Boolean),
        pricePerPerson: parseFloat(form.pricePerPerson),
        minGuests: form.minGuests ? parseInt(form.minGuests) : undefined,
        maxGuests: form.maxGuests ? parseInt(form.maxGuests) : undefined,
        menuItems: form.menuItems.split(',').map(s => s.trim()).filter(Boolean),
        description: form.description,
        location: {
          name: form.locationName,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          address: form.address,
          city: form.city,
          country: form.country,
          state: form.state,
        },
      };
      await catererService.createProfile(payload);
      await refreshProfile();
      setSuccess('Profile completed! Redirecting...');
      setTimeout(() => navigate('/service-provider-dashboard'), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md card p-8 text-center">
        <h1 className="headline-large mb-4">Complete Your Caterer Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label>Business Name *</label>
            <input name="businessName" value={form.businessName} onChange={handleChange} required className="input-field w-full" />
          </div>
          <div>
            <label>Cuisine Types (comma separated) *</label>
            <input name="cuisineTypes" value={form.cuisineTypes} onChange={handleChange} required className="input-field w-full" />
          </div>
          <div>
            <label>Service Types (comma separated) *</label>
            <input name="serviceTypes" value={form.serviceTypes} onChange={handleChange} required className="input-field w-full" />
          </div>
          <div>
            <label>Price Per Person *</label>
            <input name="pricePerPerson" value={form.pricePerPerson} onChange={handleChange} required type="number" min="0" className="input-field w-full" />
          </div>
          <div>
            <label>Min Guests *</label>
            <input name="minGuests" value={form.minGuests} onChange={handleChange} required type="number" min="1" className="input-field w-full" />
          </div>
          <div>
            <label>Max Guests *</label>
            <input name="maxGuests" value={form.maxGuests} onChange={handleChange} required type="number" min="1" className="input-field w-full" />
          </div>
          <div>
            <label>Menu Items (comma separated)</label>
            <input name="menuItems" value={form.menuItems} onChange={handleChange} className="input-field w-full" />
          </div>
          <div>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field w-full" />
          </div>
          <div className="border-t pt-4 mt-4">
            <h2 className="font-bold mb-2">Location *</h2>
            <div>
              <label>Name *</label>
              <input name="locationName" value={form.locationName} onChange={handleChange} required className="input-field w-full" />
            </div>
            <div>
              <label>Latitude *</label>
              <input name="latitude" value={form.latitude} onChange={handleChange} required type="number" step="any" className="input-field w-full" />
            </div>
            <div>
              <label>Longitude *</label>
              <input name="longitude" value={form.longitude} onChange={handleChange} required type="number" step="any" className="input-field w-full" />
            </div>
            <div>
              <label>Address *</label>
              <input name="address" value={form.address} onChange={handleChange} required className="input-field w-full" />
            </div>
            <div>
              <label>City *</label>
              <input name="city" value={form.city} onChange={handleChange} required className="input-field w-full" />
            </div>
            <div>
              <label>Country *</label>
              <input name="country" value={form.country} onChange={handleChange} required className="input-field w-full" />
            </div>
            <div>
              <label>State</label>
              <input name="state" value={form.state} onChange={handleChange} className="input-field w-full" />
            </div>
          </div>
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileCaterer; 