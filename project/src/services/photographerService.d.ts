export interface PhotographerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  userType?: string;
}

export interface Photographer {
  id: string;
  businessName?: string;
  user?: PhotographerUser;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  hourlyRate?: number;
  specializations?: string[];
  experience?: string;
  packages?: any[];
}

export interface PhotographerProfile {
  businessName: string;
  hourlyRate: number;
  specializations: string[];
  portfolioImages: string[];
  description?: string;
  profileImage?: string;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
    state?: string;
  };
}

export interface PhotographerSearchResult {
  photographers: Photographer[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const photographerService: {
  searchPhotographers: (params?: Record<string, any>) => Promise<PhotographerSearchResult>;
  getMyProfile: () => Promise<PhotographerProfile>;
  createProfile: (data: Partial<PhotographerProfile>) => Promise<PhotographerProfile>;
  updateProfile: (data: Partial<PhotographerProfile>) => Promise<PhotographerProfile>;
  getPhotographerById: (id: string) => Promise<Photographer>;
}; 