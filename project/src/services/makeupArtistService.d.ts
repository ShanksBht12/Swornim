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
  sessionRate?: number;
  bridalPackageRate?: number;
  specializations?: string[];
  brands?: string[];
  experienceYears?: number;
  offersHairServices?: boolean;
  travelsToClient?: boolean;
  availableDates?: string[];
  portfolioImages?: string[];
  description?: string;
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

export interface MakeupArtistProfile {
  businessName: string;
  sessionRate: number;
  bridalPackageRate: number;
  specializations: string[];
  brands?: string[];
  portfolioImages: string[];
  description?: string;
  experienceYears?: number;
  offersHairServices?: boolean;
  travelsToClient?: boolean;
  availableDates?: string[];
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
  createProfile: (data: Partial<MakeupArtistProfile> | FormData) => Promise<any>;
  updateProfile: (data: Partial<MakeupArtistProfile>) => Promise<MakeupArtistProfile>;
  getMakeupArtistById: (id: string) => Promise<MakeupArtist>;
  uploadPortfolioImage: (formData: FormData) => Promise<any>;
}; 