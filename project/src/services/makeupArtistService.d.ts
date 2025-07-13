export interface MakeupArtistUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  userType?: string;
}

export interface MakeupArtist {
  id: string;
  businessName?: string;
  user?: MakeupArtistUser;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  hourlyRate?: number;
  specializations?: string[];
  experience?: string;
  packages?: any[];
}

export interface MakeupArtistProfile {
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

export interface MakeupArtistSearchResult {
  makeupArtists: MakeupArtist[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const makeupArtistService: {
  searchMakeupArtists: (params?: Record<string, any>) => Promise<MakeupArtistSearchResult>;
  getMyProfile: () => Promise<MakeupArtistProfile>;
  createProfile: (data: Partial<MakeupArtistProfile>) => Promise<MakeupArtistProfile>;
  updateProfile: (data: Partial<MakeupArtistProfile>) => Promise<MakeupArtistProfile>;
  getMakeupArtistById: (id: string) => Promise<MakeupArtist>;
}; 