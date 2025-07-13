// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useServiceProviderProfile } from '../context/ServiceProviderProfileContext';
// @ts-ignore
import { photographerService } from '../services/photographerService';
// @ts-ignore
import { venueService } from '../services/venueService';
// @ts-ignore
import { makeupArtistService } from '../services/makeupArtistService';
// @ts-ignore
import { decoratorService } from '../services/decoratorService';
// @ts-ignore
import { catererService } from '../services/catererService';

const isPhotographerProfileComplete = (profile: any) => !!(profile && profile.businessName && profile.hourlyRate && Array.isArray(profile.specializations) && profile.specializations.length > 0 && Array.isArray(profile.portfolioImages) && profile.portfolioImages.length > 0 && profile.location && profile.location.name && profile.location.latitude && profile.location.longitude && profile.location.address && profile.location.city && profile.location.country);
const isVenueProfileComplete = (profile: any) => !!(profile && profile.businessName && profile.capacity && profile.pricePerHour && Array.isArray(profile.amenities) && profile.amenities.length > 0 && Array.isArray(profile.images) && profile.images.length > 0 && Array.isArray(profile.venueTypes) && profile.venueTypes.length > 0);
const isMakeupArtistProfileComplete = (profile: any) => !!(profile && profile.businessName && profile.sessionRate && profile.bridalPackageRate && Array.isArray(profile.specializations) && profile.specializations.length > 0 && Array.isArray(profile.brands) && profile.brands.length > 0 && Array.isArray(profile.portfolioImages) && profile.portfolioImages.length > 0);
const isDecoratorProfileComplete = (profile: any) => !!(profile && profile.businessName && profile.packageStartingPrice && profile.hourlyRate && Array.isArray(profile.specializations) && profile.specializations.length > 0 && Array.isArray(profile.themes) && profile.themes.length > 0 && Array.isArray(profile.portfolio) && profile.portfolio.length > 0);
const isCatererProfileComplete = (profile: any) => !!(profile && profile.businessName && Array.isArray(profile.cuisineTypes) && profile.cuisineTypes.length > 0 && Array.isArray(profile.serviceTypes) && profile.serviceTypes.length > 0 && profile.pricePerPerson && profile.minGuests && profile.maxGuests && Array.isArray(profile.menuItems) && profile.menuItems.length > 0);

const RequireCompleteProfile = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error, refreshProfile } = useServiceProviderProfile();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!user || authLoading || profileLoading) return;
    const userType = user.userType;
    if (['photographer', 'venue', 'makeupArtist', 'decorator', 'caterer'].includes(userType)) {
      if (userType === 'photographer' && (!profile || !isPhotographerProfileComplete(profile))) {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          navigate('/complete-profile/photographer', { replace: true });
        }
        return;
      } else if (userType === 'venue' && (!profile || !isVenueProfileComplete(profile))) {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          navigate('/complete-profile/venue', { replace: true });
        }
        return;
      } else if (userType === 'makeupArtist' && (!profile || !isMakeupArtistProfileComplete(profile))) {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          navigate('/complete-profile/makeupArtist', { replace: true });
        }
        return;
      } else if (userType === 'decorator' && (!profile || !isDecoratorProfileComplete(profile))) {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          navigate('/complete-profile/decorator', { replace: true });
        }
        return;
      } else if (userType === 'caterer' && (!profile || !isCatererProfileComplete(profile))) {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          navigate('/complete-profile/caterer', { replace: true });
        }
        return;
      }
    }
    setChecking(false);
  }, [user, authLoading, profile, profileLoading, navigate]);

  if (authLoading || profileLoading || checking) {
    return <div className="min-h-screen flex items-center justify-center">Checking profile...</div>;
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <div className="text-red-600 mb-4">{typeof error === 'string' ? error : 'Failed to load profile.'}</div>
        <button className="btn-primary" onClick={refreshProfile}>Retry</button>
      </div>
    );
  }
  return <>{children}</>;
};

export default RequireCompleteProfile; 