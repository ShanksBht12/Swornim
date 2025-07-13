export interface CatererUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  userType?: string;
}

export interface Caterer {
  id: string;
  businessName?: string;
  user?: CatererUser;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  hourlyRate?: number;
  specializations?: string[];
  experience?: string;
  packages?: any[];
}

export interface CatererProfile {
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

export interface CatererSearchResult {
  caterers: Caterer[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const catererService: {
  searchCaterers: (params?: Record<string, any>) => Promise<CatererSearchResult>;
  getMyProfile: () => Promise<CatererProfile>;
  createProfile: (data: Partial<CatererProfile>) => Promise<CatererProfile>;
  updateProfile: (data: Partial<CatererProfile>) => Promise<CatererProfile>;
  getCatererById: (id: string) => Promise<Caterer>;
}; 