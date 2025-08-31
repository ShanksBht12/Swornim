export interface VenueUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  userType?: string;
}

export interface Venue {
  id: string;
  businessName?: string;
  user?: VenueUser;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  hourlyRate?: number;
  specializations?: string[];
  experience?: string;
  packages?: any[];
}

export interface VenueProfile {
  businessName: string;
  capacity: number;
  pricePerHour: number;
  amenities?: string[];
  images?: string[];
  venueTypes: string[];
  description?: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state?: string;
    country: string;
  };
  // ...other fields as needed
}

export interface VenueSearchResult {
  venues: Venue[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const venueService: {
  searchVenues: (params?: Record<string, any>) => Promise<VenueSearchResult>;
  getMyProfile: () => Promise<VenueProfile>;
  createProfile: (data: Partial<VenueProfile> | FormData) => Promise<any>;
  updateProfile: (data: Partial<VenueProfile>) => Promise<VenueProfile>;
  getVenueById: (id: string) => Promise<Venue>;
}; 