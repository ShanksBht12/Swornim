export interface DecoratorUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  userType?: string;
}

export interface Decorator {
  id: string;
  businessName?: string;
  user?: DecoratorUser;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  hourlyRate?: number;
  specializations?: string[];
  experience?: string;
  packages?: any[];
}

export interface DecoratorProfile {
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

export interface DecoratorSearchResult {
  decorators: Decorator[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const decoratorService: {
  searchDecorators: (params?: Record<string, any>) => Promise<DecoratorSearchResult>;
  getMyProfile: () => Promise<DecoratorProfile>;
  createProfile: (data: Partial<DecoratorProfile> | FormData) => Promise<any>;
  updateProfile: (data: Partial<DecoratorProfile>) => Promise<DecoratorProfile>;
  getDecoratorById: (id: string) => Promise<Decorator>;
  addPortfolioImage: (file: File) => Promise<any>;
}; 