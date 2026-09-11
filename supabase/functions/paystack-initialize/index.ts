import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InitRequestBody {
  email: string;
  amountKobo: number;
  planCode?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ error: 'PAYSTACK_SECRET_KEY environment variable is not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, amountKobo, planCode }: InitRequestBody = await req.json();

    if (!email || !amountKobo) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: email and amountKobo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paystackPayload: Record<string, unknown> = {
      email,
      amount: amountKobo,
    };
    if (planCode) {
      paystackPayload.plan = planCode;
    }

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackPayload),
    });

    const result = await paystackRes.json();

    if (!result.status || !result.data) {
      return new Response(
        JSON.stringify({ error: result.message || 'Failed to initialize Paystack transaction' }),
        { status: paystackRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(result.data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
