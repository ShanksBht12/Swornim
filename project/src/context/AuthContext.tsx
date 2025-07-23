import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
// @ts-nocheck
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
// @ts-ignore
import { eventOrganizerService } from '../services/eventOrganizerService';

interface User {
  id: string;
  username?: string;
  email: string;
  role?: 'client' | 'photographer' | 'cameraman' | 'venue' | 'makeup_artist' | 'event_organizer';
  userType?: 'client' | 'photographer' | 'makeupArtist' | 'decorator' | 'venue' | 'caterer' | 'eventOrganizer';
  profilePicture?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  verified?: boolean;
  createdAt?: string;
  name?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    userType: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Helper to normalize userType from backend to frontend
function normalizeUserType(userType?: string): string | undefined {
  if (!userType) return userType;
  switch (userType) {
    case 'makeup_artist':
      return 'makeupArtist';
    case 'event_organizer':
    case 'eventOrganizer':
      return 'eventOrganizer';
    // Add other mappings if needed
    default:
      return userType;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const currentAuth = authService.getCurrentUser();
      if (currentAuth && currentAuth.token && currentAuth.user) {
        // Verify token with backend
        try {
          const userData = await authService.verifyToken();
          setUser({ ...userData, userType: normalizeUserType(userData.userType) });
        } catch (error) {
          console.error('Token verification failed:', error);
          authService.logout();
          setUser(null);
        }
      } else {
        // No valid auth data found, set user to null
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: userData, token } = await authService.login({ email, password });
      setUser({ ...userData, userType: normalizeUserType(userData.userType) });
      const latestProfile = await authService.verifyToken();

      // Helper to check profile existence for each provider type
      const checkProfileAndNavigate = async (
        getProfileFn: () => Promise<any>,
        profileFormPath: string
      ) => {
        try {
          await getProfileFn();
          console.log('Navigating to /service-provider-dashboard');
          navigate('/service-provider-dashboard');
        } catch (err: any) {
          console.log('Profile check error:', err); // Debug log
          // Robust 404 check
          const status = err?.response?.status || err?.status;
          const message = (err?.response?.data?.message || err?.message || '').toLowerCase();
          if (status === 404 || message.includes('not found')) {
            console.log('Navigating to', profileFormPath);
            navigate(profileFormPath);
          } else if (
            status === 409 ||
            message.includes('already exists')
          ) {
            console.log('Navigating to /service-provider-dashboard (409 or already exists)');
            navigate('/service-provider-dashboard');
          } else {
            throw err;
          }
        }
      };

      switch (normalizeUserType(latestProfile?.userType)) {
        case 'photographer':
          await checkProfileAndNavigate(
            photographerService.getMyProfile,
            '/complete-profile/photographer'
          );
          break;
        case 'makeupArtist':
          await checkProfileAndNavigate(
            makeupArtistService.getMyProfile,
            '/complete-profile/makeup-artist'
          );
          break;
        case 'decorator':
          await checkProfileAndNavigate(
            decoratorService.getMyProfile,
            '/complete-profile/decorator'
          );
          break;
        case 'venue':
          await checkProfileAndNavigate(
            venueService.getMyProfile,
            '/complete-profile/venue'
          );
          break;
        case 'caterer':
          await checkProfileAndNavigate(
            catererService.getMyProfile,
            '/complete-profile/caterer'
          );
          break;
        case 'eventOrganizer':
          await checkProfileAndNavigate(
            eventOrganizerService.getMyProfile,
            '/complete-profile/event-organizer'
          );
          break;
        default:
          if (
            (user && ((user.userType as string) === 'event_organizer' || (user.userType as string) === 'eventOrganizer')) ||
            (latestProfile && ((latestProfile.userType as string) === 'event_organizer' || (latestProfile.userType as string) === 'eventOrganizer'))
          ) {
            console.log('Fallback: Navigating to /service-provider-dashboard for event organizer');
            navigate('/service-provider-dashboard');
          } else {
            console.log('Navigating to /dashboard (default case)');
            navigate('/dashboard');
          }
          break;
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    userType: string;
    phone?: string;
  }) => {
    try {
      setLoading(true);
      await authService.signup(userData);
      // Do not set user here, as user is not logged in until email is verified
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.verifyToken();
      setUser({ ...userData, userType: normalizeUserType(userData.userType) });
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  // Helper to check if user is a service provider
  function isServiceProvider(userType?: string) {
    return [
      'photographer',
      'makeupArtist',
      'decorator',
      'venue',
      'caterer',
      'eventOrganizer',
    ].includes(userType || '');
  }

  // Check if profile is complete for each service provider type
  function isProfileComplete(user: User) {
    if (!user) return false;
    switch (user.userType) {
      case 'photographer':
        return !!(user.name && user.email && user.phone && user.profileImage);
      case 'venue':
        return !!(user.name && user.email && user.phone && user.profileImage);
      case 'makeupArtist':
      case 'decorator':
      case 'caterer':
      case 'eventOrganizer':
        return !!(user.name && user.email && user.phone && user.profileImage);
      default:
        return true;
    }
  }

  // Profile completeness checkers for each provider type
  function isPhotographerProfileComplete(profile: any) {
    return !!(
      profile &&
      profile.businessName &&
      profile.hourlyRate &&
      Array.isArray(profile.specializations) &&
      profile.specializations.length > 0 &&
      Array.isArray(profile.portfolioImages)
    );
  }
  function isVenueProfileComplete(profile: any) {
    return !!(profile && profile.businessName && profile.capacity && profile.pricePerHour && Array.isArray(profile.amenities) && profile.amenities.length > 0 && Array.isArray(profile.images) && profile.images.length > 0 && Array.isArray(profile.venueTypes) && profile.venueTypes.length > 0);
  }
  function isMakeupArtistProfileComplete(profile: any) {
    return !!(profile && profile.businessName && profile.sessionRate && profile.bridalPackageRate && Array.isArray(profile.specializations) && profile.specializations.length > 0 && Array.isArray(profile.brands) && profile.brands.length > 0 && Array.isArray(profile.portfolioImages) && profile.portfolioImages.length > 0);
  }
  function isDecoratorProfileComplete(profile: any) {
    return !!(profile && profile.businessName && profile.packageStartingPrice && profile.hourlyRate && Array.isArray(profile.specializations) && profile.specializations.length > 0 && Array.isArray(profile.themes) && profile.themes.length > 0 && Array.isArray(profile.portfolio) && profile.portfolio.length > 0);
  }
  function isCatererProfileComplete(profile: any) {
    return !!(profile && profile.businessName && Array.isArray(profile.cuisineTypes) && profile.cuisineTypes.length > 0 && Array.isArray(profile.serviceTypes) && profile.serviceTypes.length > 0 && profile.pricePerPerson && profile.minGuests && profile.maxGuests && Array.isArray(profile.menuItems) && profile.menuItems.length > 0);
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}