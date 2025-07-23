// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { photographerService } from '../services/photographerService';
import { venueService } from '../services/venueService';
import { makeupArtistService } from '../services/makeupArtistService';
import { decoratorService } from '../services/decoratorService';
import { catererService } from '../services/catererService';
// @ts-ignore
import { eventOrganizerService } from '../services/eventOrganizerService';

const ServiceProviderProfileContext = createContext({ profile: null, loading: true, error: null, refreshProfile: async () => {} });

export function ServiceProviderProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!user || !user.userType) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let data = null;
      if (user.userType === 'photographer') {
        data = await photographerService.getMyProfile();
      } else if (user.userType === 'venue') {
        data = await venueService.getMyProfile();
      } else if (user.userType === 'makeupArtist') {
        data = await makeupArtistService.getMyProfile();
      } else if (user.userType === 'decorator') {
        data = await decoratorService.getMyProfile();
      } else if (user.userType === 'caterer') {
        data = await catererService.getMyProfile();
      } else if (user.userType === 'eventOrganizer' || user.userType === 'event_organizer') {
        data = await eventOrganizerService.getMyProfile();
      }
      setProfile(data);
      setError(null);
    } catch (err) {
      if (err?.response?.status === 404) {
        // No profile yet, not an error
        setProfile(null);
        setError(null);
      } else {
        setProfile(null);
        setError(err?.response?.data?.message || err.message || 'Failed to fetch profile.');
        console.error('Profile fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [user]);

  return (
    <ServiceProviderProfileContext.Provider value={{ profile, loading, error, refreshProfile: fetchProfile }}>
      {children}
    </ServiceProviderProfileContext.Provider>
  );
}

export function useServiceProviderProfile() {
  return useContext(ServiceProviderProfileContext);
} 