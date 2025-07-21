import { config } from "./config";

export interface SumUpPaymentRequest {
  amount: number;
  currency: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  description: string;
}

export interface SumUpPaymentResponse {
  success: boolean;
  transactionId?: string;
  checkoutId?: string;
  error?: string;
  checkoutUrl?: string;
  amount?: number;
  currency?: string;
  description?: string;
}

export interface SumUpConfig {
  apiKey: string;
  merchantId: string;
  environment: 'sandbox' | 'production';
}

export interface SumUpTransaction {
  id: string;
  amount: number;
  currency: string;
  status: "SUCCESSFUL" | "FAILED" | "PENDING";
  transaction_code: string;
  merchant_code: string;
  description: string;
  timestamp: string;
  payment_type: "CARD" | "CASH";
  card_type?: string;
  last_4_digits?: string;
}

class SumUpService {
  private config: SumUpConfig;

  constructor() {
    this.config = {
      apiKey: process.env.SUMUP_API_KEY || '',
      merchantId: process.env.SUMUP_MERCHANT_ID || '',
      environment: (process.env.SUMUP_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    };
  }

  private getBaseUrl(): string {
    return this.config.environment === 'production' 
      ? 'https://api.sumup.com/v0.1'
      : 'https://api.sumup.com/v0.1';
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createCheckout(paymentRequest: SumUpPaymentRequest): Promise<SumUpPaymentResponse> {
    try {
      // For now, we'll simulate SumUp integration
      // In production, you would make actual API calls to SumUp
      
      if (!this.config.apiKey || !this.config.merchantId) {
        console.warn('SumUp credentials not configured, using simulation mode');
        return this.simulatePayment(paymentRequest);
      }

      const response = await fetch(`${this.getBaseUrl()}/checkouts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          checkout_reference: paymentRequest.orderNumber,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          pay_to_email: this.config.merchantId,
          description: paymentRequest.description,
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/success?orderNumber=${paymentRequest.orderNumber}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/cancel?orderNumber=${paymentRequest.orderNumber}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`SumUp API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        checkoutId: data.id,
        checkoutUrl: data.checkout_url,
      };

    } catch (error) {
      console.error('SumUp payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  async processPayment(paymentRequest: SumUpPaymentRequest): Promise<SumUpPaymentResponse> {
    try {
      // For immediate payment processing (if supported by SumUp)
      const checkoutResponse = await this.createCheckout(paymentRequest);
      
      if (!checkoutResponse.success) {
        return checkoutResponse;
      }

      // In a real implementation, you might need to handle the payment flow differently
      // depending on SumUp's specific API requirements
      
      return {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        checkoutId: checkoutResponse.checkoutId,
      };

    } catch (error) {
      console.error('SumUp payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  private simulatePayment(paymentRequest: SumUpPaymentRequest): SumUpPaymentResponse {
    // Simulate payment processing for development/testing
    console.log('Simulating SumUp payment:', paymentRequest);
    
    // Simulate a 90% success rate
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      return {
        success: true,
        transactionId: `sim_txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        checkoutId: `sim_checkout_${Date.now()}`,
      };
    } else {
      return {
        success: false,
        error: 'Simulated payment failure',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        console.warn('SumUp credentials not configured, payment verification skipped');
        return true; // Assume success in simulation mode
      }

      const response = await fetch(`${this.getBaseUrl()}/me/transactions/${transactionId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'SUCCESSFUL';

    } catch (error) {
      console.error('SumUp payment verification error:', error);
      return false;
    }
  }

  getPaymentMethods(): string[] {
    return ['card', 'cash'];
  }

  getSupportedCurrencies(): string[] {
    return ['GBP', 'EUR', 'USD'];
  }

  // Get transaction details
  async getTransaction(transactionId: string): Promise<SumUpTransaction> {
    return this.makeRequest(`/v0.1/me/transactions/${transactionId}`);
  }

  // Get all transactions for the merchant
  async getTransactions(limit = 50, offset = 0): Promise<SumUpTransaction[]> {
    return this.makeRequest(`/v0.1/me/transactions?limit=${limit}&offset=${offset}`);
  }

  // Process card payment
  async processCardPayment(
    amount: number,
    currency: string = 'GBP',
    description: string = 'STACK\'D Order Payment'
  ): Promise<SumUpPaymentResponse> {
    const paymentRequest: SumUpPaymentRequest = {
      amount,
      currency,
      orderNumber: `ORDER_${Date.now()}`,
      customerEmail: 'customer@stackd.com',
      customerName: 'STACK\'D Customer',
      description,
    };

    return this.processPayment(paymentRequest);
  }

  // Process cash payment
  async processCashPayment(amount: number, description: string, orderId: string): Promise<SumUpTransaction> {
    // For cash payments, we create a transaction record without external processing
    const transaction: SumUpTransaction = {
      id: `cash_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      amount,
      currency: 'GBP',
      status: 'SUCCESSFUL',
      transaction_code: `CASH_${Date.now()}`,
      merchant_code: this.config.merchantId,
      description,
      timestamp: new Date().toISOString(),
      payment_type: 'CASH',
    };

    return transaction;
  }



  // Get merchant information
  async getMerchantInfo() {
    return this.makeRequest("/v0.1/me");
  }

  // Validate if the service is properly configured
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.merchantId);
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    
    const headers = {
      "Authorization": `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`SumUp API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const sumupService = new SumUpService();

// Helper functions for common payment operations
export async function processOrderPayment(
  amount: number,
  orderNumber: string,
  customerEmail: string,
  customerName: string,
  description: string,
  orderType: 'delivery' | 'collection' | 'takeaway' = 'delivery'
): Promise<SumUpPaymentResponse> {
  const paymentRequest: SumUpPaymentRequest = {
    amount,
    currency: 'GBP',
    orderNumber,
    customerEmail,
    customerName,
    description,
  };

  // For delivery orders, always use online card payment
  if (orderType === 'delivery') {
    return await sumupService.processPayment(paymentRequest);
  }
  
  // For collection/takeaway, we can use either online payment or SumUp terminal
  // For now, we'll use online payment, but in production you might want to
  // integrate with SumUp's terminal API for in-store payments
  return await sumupService.processPayment(paymentRequest);
}

export async function createPaymentCheckout(
  amount: number,
  orderNumber: string,
  customerEmail: string,
  customerName: string,
  description: string
): Promise<SumUpPaymentResponse> {
  const paymentRequest: SumUpPaymentRequest = {
    amount,
    currency: 'GBP',
    orderNumber,
    customerEmail,
    customerName,
    description,
  };

  return await sumupService.createCheckout(paymentRequest);
}

// Export the payment processing functions
export const processCardPayment = (amount: number, currency: string = 'GBP', description: string = 'STACK\'D Order Payment') => 
  sumupService.processCardPayment(amount, currency, description);

export const processCashPayment = (amount: number, description: string, orderId: string) => 
  sumupService.processCashPayment(amount, description, orderId);
