export declare function createBooking(data: any): Promise<any>;
export declare function getBookings(): Promise<any>;
export declare function updateBookingStatus(bookingId: string, status: string, reason?: string): Promise<any>;
export declare function updateBooking(bookingId: string, data: any): Promise<any>;
export declare function deleteBooking(bookingId: string): Promise<any>;
export declare function cancelBooking(bookingId: string, reason: string): Promise<any>; 