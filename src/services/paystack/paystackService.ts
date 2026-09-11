import { supabase } from '../supabase/supabaseClient';

export interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    status: string; // 'success', 'failed', 'abandoned', etc.
    amount: number;
    customer: {
      email: string;
    };
    paid_at?: string;
    channel?: string;
  };
}

export const paystackService = {
  /**
   * Initialize Paystack payment transaction via Supabase Edge Function
   */
  async initializeTransaction(
    email: string,
    amountKobo: number,
    planCode?: string
  ): Promise<PaystackInitResponse> {
    console.log(`[Paystack Service] Initializing transaction for ${email}, amount: ${amountKobo} kobo`);
    
    const { data, error } = await supabase.functions.invoke<PaystackInitResponse>('paystack-initialize', {
      body: {
        email,
        amountKobo,
        planCode,
      },
    });

    if (error) {
      console.error('[Paystack Service Error] Failed to initialize transaction:', error);
      throw error;
    }

    if (!data || !data.authorization_url) {
      throw new Error('Invalid response from paystack-initialize function');
    }

    return data;
  },

  /**
   * Verify Paystack payment transaction status server-side via Supabase Edge Function
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    console.log(`[Paystack Service] Verifying transaction reference: ${reference}`);

    const { data, error } = await supabase.functions.invoke<PaystackVerifyResponse>('paystack-verify', {
      body: {
        reference,
      },
    });

    if (error) {
      console.error('[Paystack Service Error] Failed to verify transaction:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Invalid response from paystack-verify function');
    }

    return data;
  }
};
