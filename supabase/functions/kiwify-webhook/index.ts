import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KiwifyWebhookData {
  order_id: string;
  status: string;
  email: string;
  name?: string;
  product?: string;
  product_id?: string;
  price?: number;
  payment_method?: string;
  transaction_date?: string;
  customer_id?: string;
}

interface KiwifyWebhookPayload {
  event: string;
  data: KiwifyWebhookData;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const webhookToken = Deno.env.get('WEBHOOK_SHARED_TOKEN');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Validate webhook token
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (webhookToken && token !== webhookToken) {
      console.error('Invalid webhook token');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse payload
    const payload: KiwifyWebhookPayload = await req.json();
    console.log('Received webhook:', JSON.stringify(payload));

    const { event, data } = payload;
    const email = data?.email?.toLowerCase();
    const orderId = data?.order_id;

    if (!email || !orderId) {
      console.error('Missing required fields: email or order_id');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save webhook event
    const { data: webhookEvent, error: webhookError } = await supabase
      .from('webhook_events')
      .insert({
        provider: 'kiwify',
        event,
        order_id: orderId,
        email,
        raw_payload: payload,
        status: 'received',
      })
      .select()
      .single();

    if (webhookError) {
      console.error('Error saving webhook event:', webhookError);
      throw webhookError;
    }

    console.log('Webhook event saved:', webhookEvent.id);

    // Check for idempotency
    const { data: alreadyProcessed } = await supabase.rpc('check_webhook_processed', {
      p_order_id: orderId,
      p_event: event,
    });

    if (alreadyProcessed) {
      console.log('Event already processed, skipping');
      await supabase
        .from('webhook_events')
        .update({ status: 'skipped', error: 'Already processed' })
        .eq('id', webhookEvent.id);

      return new Response(JSON.stringify({ message: 'Already processed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process event
    await processKiwifyEvent(supabase, event, data, webhookEvent.id);

    return new Response(JSON.stringify({ message: 'ok' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200, // Return 200 to avoid retries
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processKiwifyEvent(
  supabase: any,
  event: string,
  data: KiwifyWebhookData,
  webhookEventId: string
) {
  const email = data.email.toLowerCase();
  const orderId = data.order_id;

  try {
    // Get or create user by email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
    
    let userId: string;
    
    if (authError || !authUser?.user) {
      // User doesn't exist in auth, will be created when they sign up
      console.log('User not found in auth system, will update profile when they sign up');
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (!existingProfile) {
        // Create a placeholder profile (will be updated when user signs up)
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            email,
            name: data.name,
            status_pagamento: event === 'purchase_approved' ? 'approved' : 'pending',
            plano: data.product || data.product_id,
            kiwify_order_id: orderId,
            kiwify_customer_id: data.customer_id,
            last_paid_at: data.transaction_date ? new Date(data.transaction_date) : new Date(),
          })
          .select()
          .single();
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }
        
        userId = newProfile.id;
        console.log('Created placeholder profile for:', email);
      } else {
        userId = existingProfile.id;
      }
    } else {
      userId = authUser.user.id;
    }

    // Process based on event type
    switch (event) {
      case 'purchase_created':
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email,
            name: data.name,
            plano: data.product || data.product_id,
            status_pagamento: 'pending',
          }, { onConflict: 'email' });

        await supabase.rpc('log_audit', {
          p_actor: 'system:webhook',
          p_action: 'purchase_created',
          p_meta: { email, order_id: orderId },
        });
        break;

      case 'purchase_approved':
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email,
            name: data.name,
            plano: data.product || data.product_id,
            status_pagamento: 'approved',
            kiwify_order_id: orderId,
            kiwify_customer_id: data.customer_id,
            last_paid_at: data.transaction_date ? new Date(data.transaction_date) : new Date(),
          }, { onConflict: 'email' });

        await supabase.rpc('log_audit', {
          p_actor: 'system:webhook',
          p_action: 'user_activated',
          p_meta: { email, order_id: orderId },
        });

        console.log('User activated:', email);
        break;

      case 'purchase_refunded':
      case 'subscription_canceled':
        await supabase
          .from('profiles')
          .update({ status_pagamento: 'revoked' })
          .eq('email', email);

        await supabase.rpc('log_audit', {
          p_actor: 'system:webhook',
          p_action: 'user_revoked',
          p_meta: { email, order_id: orderId, reason: event },
        });

        console.log('User revoked:', email);
        break;

      default:
        console.log('Unhandled event type:', event);
        await supabase
          .from('webhook_events')
          .update({ status: 'skipped', error: 'Unhandled event type' })
          .eq('id', webhookEventId);
        return;
    }

    // Mark as processed
    await supabase
      .from('webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('id', webhookEventId);

    console.log('Event processed successfully');
  } catch (error: any) {
    console.error('Error in processKiwifyEvent:', error);
    await supabase
      .from('webhook_events')
      .update({ status: 'failed', error: error.message })
      .eq('id', webhookEventId);
    throw error;
  }
}
