export function uploadImage(file: File, endpoint: string, fieldName?: string): Promise<any>;
export function uploadMultipleImages(files: File[], endpoint: string, fieldName?: string): Promise<any>;
export function uploadProfileImage(file: File): Promise<any>;
export function uploadPortfolioImages(files: File[]): Promise<any>;
export function uploadVenueImages(files: File[]): Promise<any>;
export function uploadUserProfileImage(file: File): Promise<any>;
export function uploadToEndpoint(files: File | File[], endpoint: string, fieldName?: string): Promise<any>; 