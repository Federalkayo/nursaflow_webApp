import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.116.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

async function verifyPaystackSignature(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const hexSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hexSignature.toLowerCase() === signature.toLowerCase();
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ error: 'PAYSTACK_SECRET_KEY environment variable is not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    const isValid = await verifyPaystackSignature(rawBody, signature, paystackSecretKey);
    if (!isValid) {
      console.warn('Unauthorized Paystack webhook signature mismatch.');
      return new Response(
        JSON.stringify({ error: 'Invalid Paystack signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const data = event.data;
      const customerEmail = data?.customer?.email;
      const reference = data?.reference;
      const planCode = data?.plan?.name || data?.plan?.plan_code || 'NursaFlow Pro';

      console.log(`[Paystack Webhook] Processing charge.success for ${customerEmail}, reference: ${reference}`);

      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (supabaseUrl && supabaseServiceKey && customerEmail) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Find user by email in profiles table or auth users
        const { data: userProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('full_name', customerEmail)
          .single();

        let userId = userProfile?.id;

        if (!userId) {
          // Attempt lookup in auth users list
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const matchedUser = usersData?.users?.find((u) => u.email === customerEmail);
          userId = matchedUser?.id;
        }

        if (userId) {
          const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const { error: upsertErr } = await supabaseAdmin
            .from('subscriptions')
            .upsert(
              {
                user_id: userId,
                plan: planCode,
                status: 'active',
                paystack_reference: reference,
                current_period_end: currentPeriodEnd,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );

          if (upsertErr) {
            console.error('[Paystack Webhook Error] Failed to upsert subscription:', upsertErr);
          } else {
            console.log(`[Paystack Webhook] Successfully activated subscription for userId ${userId}`);
          }
        } else {
          console.warn(`[Paystack Webhook Warning] Could not find matching user for email ${customerEmail}`);
        }
      }
    }

    // Respond 200 OK quickly for all events to acknowledge receipt
    return new Response(
      JSON.stringify({ status: 'success', received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[Paystack Webhook Exception]:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
