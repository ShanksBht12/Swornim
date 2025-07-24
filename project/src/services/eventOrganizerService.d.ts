export interface EventOrganizerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  userType?: string;
}

export interface EventOrganizer {
  id: string;
  businessName?: string;
  user?: EventOrganizerUser;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  packageStartingPrice?: number;
  hourlyConsultationRate?: number;
  description?: string;
  isAvailable?: boolean;
  eventTypes?: string[];
  services?: string[];
  portfolio?: string[];
  experienceYears?: number;
  maxEventSize?: number;
  preferredVendors?: string[];
  contactEmail?: string;
  contactPhone?: string;
  offersVendorCoordination?: boolean;
  offersVenueBooking?: boolean;
  offersFullPlanning?: boolean;
  availableDates?: string[];
  location?: {
    name?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    country?: string;
    state?: string;
  };
}

export interface EventOrganizerProfile {
  businessName: string;
  packageStartingPrice: number;
  hourlyConsultationRate: number;
  description?: string;
  profileImage?: string;
  isAvailable?: boolean;
  eventTypes?: string[];
  services?: string[];
  portfolio?: string[];
  experienceYears?: number;
  maxEventSize?: number;
  preferredVendors?: string[];
  contactEmail?: string;
  contactPhone?: string;
  offersVendorCoordination?: boolean;
  offersVenueBooking?: boolean;
  offersFullPlanning?: boolean;
  availableDates?: string[];
  location?: {
    name?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    country?: string;
    state?: string;
  };
}

export const eventOrganizerService: {
  getMyProfile: () => Promise<EventOrganizerProfile>;
  createProfile: (data: Partial<EventOrganizerProfile> | FormData) => Promise<any>;
  updateProfile: (data: Partial<EventOrganizerProfile> & { profileImage?: File }) => Promise<EventOrganizerProfile>;
  deleteProfile: () => Promise<any>;
  addPortfolioImage: (file: File) => Promise<EventOrganizerProfile>;
}; 