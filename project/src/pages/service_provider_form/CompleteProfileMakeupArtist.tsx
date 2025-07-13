// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import { makeupArtistService } from '../../services/makeupArtistService';
import { useServiceProviderProfile } from '../../context/ServiceProviderProfileContext';
import { FileUpload } from '../../components/FileUpload';

const initialState = {
  businessName: '',
  sessionRate: '',
  bridalPackageRate: '',
  specializations: '', // comma separated
  brands: '', // comma separated
  portfolioImages: '', // comma separated URLs
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

const CompleteProfileMakeupArtist = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { profile, loading: profileLoading, refreshProfile } = useServiceProviderProfile();
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        businessName: profile.businessName || '',
        sessionRate: profile.sessionRate || '',
        bridalPackageRate: profile.bridalPackageRate || '',
        specializations: (profile.specializations || []).join(', '),
        brands: (profile.brands || []).join(', '),
        portfolioImages: (profile.portfolio || []).join(', '),
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
      const formData = new FormData();
      if (form.businessName) formData.append('businessName', form.businessName);
      if (form.sessionRate) formData.append('sessionRate', form.sessionRate);
      if (form.bridalPackageRate) formData.append('bridalPackageRate', form.bridalPackageRate);
      form.specializations.split(',').map(s => s.trim()).filter(Boolean).forEach(val => {
        formData.append('specializations[]', val);
      });
      form.brands.split(',').map(s => s.trim()).filter(Boolean).forEach(val => {
        formData.append('brands[]', val);
      });
      form.portfolioImages.split(',').map(s => s.trim()).filter(Boolean).forEach(val => {
        formData.append('portfolio[]', val);
      });
      if (form.description) formData.append('description', form.description);
      if (form.locationName) formData.append('location[name]', form.locationName);
      if (form.latitude) formData.append('location[latitude]', form.latitude);
      if (form.longitude) formData.append('location[longitude]', form.longitude);
      if (form.address) formData.append('location[address]', form.address);
      if (form.city) formData.append('location[city]', form.city);
      if (form.country) formData.append('location[country]', form.country);
      if (form.state) formData.append('location[state]', form.state);
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }
      await makeupArtistService.createProfile(formData);
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
        <h1 className="headline-large mb-4">Complete Your Makeup Artist Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label>Business Name *</label>
            <input name="businessName" value={form.businessName} onChange={handleChange} required className="input-field w-full" />
          </div>
          <div>
            <label>Session Rate *</label>
            <input name="sessionRate" value={form.sessionRate} onChange={handleChange} required type="number" min="0" className="input-field w-full" />
          </div>
          <div>
            <label>Bridal Package Rate *</label>
            <input name="bridalPackageRate" value={form.bridalPackageRate} onChange={handleChange} required type="number" min="0" className="input-field w-full" />
          </div>
          <div>
            <label>Specializations (comma separated) *</label>
            <input name="specializations" value={form.specializations} onChange={handleChange} required className="input-field w-full" />
          </div>
          <div>
            <label>Brands (comma separated) *</label>
            <input name="brands" value={form.brands} onChange={handleChange} required className="input-field w-full" />
          </div>
          <div>
            <label>Portfolio Image URLs (comma separated)</label>
            <input name="portfolioImages" value={form.portfolioImages} onChange={handleChange} className="input-field w-full" />
          </div>
          <div>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field w-full" />
          </div>
          <div>
            <label>Profile Image</label>
            <FileUpload
              onFilesSelected={files => setProfileImageFile(files[0] || null)}
              maxSize={5}
              multiple={false}
              label="Change Profile Image"
              placeholder="Click to select or drag and drop"
              disabled={loading}
            />
            {profileImageFile && (
              <div className="mt-2 text-sm text-slate-600">Selected: {profileImageFile.name}</div>
            )}
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

export default CompleteProfileMakeupArtist; 