// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import { photographerService } from '../../services/photographerService';
import { useServiceProviderProfile } from '../../context/ServiceProviderProfileContext';
import { FileUpload } from '../../components/FileUpload';
import { uploadProfileImage, uploadPortfolioImages } from '../../services/imageUploadService';
import api from '../../services/api'; // Added import for api

const initialState = {
  businessName: '',
  hourlyRate: '',
  specializations: '', // comma separated
  description: '',
  profileImage: '',
  portfolioImages: '', // comma separated URLs
  // Location fields
  locationName: '',
  latitude: '',
  longitude: '',
  address: '',
  city: '',
  country: '',
};

const CompleteProfilePhotographer = () => {
  // File upload state (moved inside component)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [portfolioImageFiles, setPortfolioImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { profile, loading: profileLoading, refreshProfile } = useServiceProviderProfile();
  const hasNavigatedRef = useRef(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadingImages(true);
    setError('');
    setSuccess('');

    // Validate required fields
    if (!form.businessName || !form.hourlyRate || !form.specializations || !form.locationName || !form.latitude || !form.longitude || !form.address || !form.city || !form.country) {
      setError('Please fill in all required fields.');
      setLoading(false);
      setUploadingImages(false);
      return;
    }

    try {
      // 1. Create FormData for profile creation
      const formData = new FormData();
      if (form.businessName) formData.append('businessName', form.businessName);
      if (form.hourlyRate) formData.append('hourlyRate', form.hourlyRate);
      form.specializations.split(',').map(s => s.trim()).filter(Boolean).forEach(val => {
        formData.append('specializations[]', val);
      });
      if (form.description) formData.append('description', form.description);
      if (form.locationName) formData.append('location[name]', form.locationName);
      if (form.latitude) formData.append('location[latitude]', form.latitude);
      if (form.longitude) formData.append('location[longitude]', form.longitude);
      if (form.address) formData.append('location[address]', form.address);
      if (form.city) formData.append('location[city]', form.city);
      if (form.country) formData.append('location[country]', form.country);
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      // 2. Add profile image file if selected
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      // 3. Send profile creation request
      await api.post('/photographers/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // ...auth headers if needed
        }
      });

      // 4. Upload portfolio images (if any)
      if (portfolioImageFiles.length > 0) {
        for (const file of portfolioImageFiles) {
          const pfFormData = new FormData();
          pfFormData.append('portfolioImage', file);
          await api.post('/photographers/portfolio/images', pfFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              // ...auth headers if needed
            }
          });
        }
      }

      navigate('/service-provider-dashboard', { replace: true });
    } catch (err: any) {
      if (
        (err.response && err.response.status === 409) ||
        (err.response?.data?.message?.toLowerCase().includes('already exists'))
      ) {
        navigate('/service-provider-dashboard', { replace: true });
        return;
      }
      setError(err.response?.data?.message || err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  if (profileLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md card p-8 text-center">
        <h1 className="headline-large mb-4">Complete Your Photographer Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label>Business Name *</label>
            <input name="businessName" value={form.businessName} onChange={handleChange} required className="input-field w-full" />
          </div>
          <div>
            <label>Hourly Rate *</label>
            <input name="hourlyRate" value={form.hourlyRate} onChange={handleChange} required type="number" min="0" className="input-field w-full" />
          </div>
          <div>
            <label>Specializations (comma separated) *</label>
            <input name="specializations" value={form.specializations} onChange={handleChange} required className="input-field w-full" />
          </div>
          <div>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field w-full" />
          </div>
          <div>
            <label>Profile Image</label>
            <FileUpload
              onFilesSelected={(files) => setProfileImageFile(files[0] || null)}
              maxSize={5}
              multiple={false}
              label="Upload Profile Image"
              placeholder="Click to select or drag and drop your profile image"
              disabled={uploadingImages}
            />
            {form.profileImage && !profileImageFile && (
              <div className="mt-2">
                <label className="text-sm text-slate-600">Current Profile Image URL (optional)</label>
                <input 
                  name="profileImage" 
                  value={form.profileImage} 
                  onChange={handleChange} 
                  className="input-field w-full mt-1" 
                  placeholder="Or enter image URL manually"
                />
              </div>
            )}
          </div>
          <div>
            <label>Portfolio Images</label>
            <FileUpload
              onFilesSelected={(files) => setPortfolioImageFiles(files)}
              maxSize={5}
              multiple={true}
              label="Upload Portfolio Images"
              placeholder="Click to select or drag and drop your portfolio images"
              disabled={uploadingImages}
            />
            {form.portfolioImages && portfolioImageFiles.length === 0 && (
              <div className="mt-2">
                <label className="text-sm text-slate-600">Current Portfolio Image URLs (optional)</label>
                <input 
                  name="portfolioImages" 
                  value={form.portfolioImages} 
                  onChange={handleChange} 
                  className="input-field w-full mt-1" 
                  placeholder="Or enter image URLs manually (comma separated)"
                />
              </div>
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
          </div>
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <button 
            type="submit" 
            className="btn-primary w-full" 
            disabled={loading || uploadingImages}
          >
            {loading || uploadingImages ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePhotographer; 