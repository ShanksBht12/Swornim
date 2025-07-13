// paymentService.d.ts
export interface PaymentInitResponse {
  data: {
    paymentUrl: string;
    pidx: string;
    transactionId: string;
    message: string;
  };
  success: boolean;
  message?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  data?: {
    booking: any;
    paymentDetails: any;
  };
}

export interface PaymentStatusResponse {
  data: {
    paymentStatus: string;
    booking: any;
  };
  success: boolean;
  message?: string;
}

export interface PaymentHistoryResponse {
  data: any[];
  success: boolean;
  message?: string;
}

export interface BookingPaymentStatusUpdateResponse {
  success: boolean;
  message: string;
  data: any;
}

export const paymentService: {
  initializeKhaltiPayment: (bookingId: string) => Promise<PaymentInitResponse>;
  verifyKhaltiPayment: (pidx: string) => Promise<PaymentVerifyResponse>;
  getPaymentStatus: (bookingId: string) => Promise<PaymentStatusResponse>;
  getPaymentHistory: () => Promise<PaymentHistoryResponse>;
  updateBookingPaymentStatus: (bookingId: string, status: 'pending' | 'paid' | 'failed' | 'refunded') => Promise<BookingPaymentStatusUpdateResponse>;
};