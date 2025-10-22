import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KiwifyCustomer {
  email: string;
  full_name?: string;
  first_name?: string;
  mobile?: string;
  CPF?: string;
}

interface KiwifyProduct {
  product_id: string;
  product_name?: string;
}

interface KiwifySubscription {
  subscription_id?: string;
  status?: string;
  start_date?: string;
  next_payment?: string;
}

interface KiwifyWebhookPayload {
  order_id: string;
  order_ref?: string;
  order_status?: string;
  webhook_event_type: string;
  approved_date?: string;
  created_at?: string;
  refunded_at?: string;
  Customer?: KiwifyCustomer;
  Product?: KiwifyProduct;
  Subscription?: KiwifySubscription;
  payment_method?: string;
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

    const event = payload.webhook_event_type;
    const email = payload.Customer?.email?.toLowerCase();
    const orderId = payload.order_id;

    if (!email || !orderId) {
      console.error('Missing required fields: email or order_id');
      console.error('Payload structure:', { 
        has_customer: !!payload.Customer, 
        has_order_id: !!payload.order_id,
        event_type: payload.webhook_event_type 
      });
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

    // Map Kiwify event names to internal event names
    const mappedEvent = mapKiwifyEvent(event);
    console.log(`Processing event: ${event} → ${mappedEvent}`);

    // Process event
    await processKiwifyEvent(supabase, mappedEvent, payload, webhookEvent.id);

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

function mapKiwifyEvent(kiwifyEvent: string): string {
  const eventMap: Record<string, string> = {
    'order_approved': 'purchase_approved',
    'billet_created': 'purchase_created',
    'order_created': 'purchase_created',
    'order_refunded': 'purchase_refunded',
    'subscription_canceled': 'subscription_canceled',
  };
  
  return eventMap[kiwifyEvent] || kiwifyEvent;
}

async function processKiwifyEvent(
  supabase: any,
  event: string,
  payload: KiwifyWebhookPayload,
  webhookEventId: string
) {
  const email = payload.Customer?.email?.toLowerCase() || '';
  const orderId = payload.order_id;
  const name = payload.Customer?.full_name;
  const product = payload.Product?.product_name || payload.Product?.product_id;
  const transactionDate = payload.approved_date || payload.created_at;
  const phone = payload.Customer?.mobile;

  try {
    // Check if profile exists by email
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    console.log('Profile lookup for:', email, existingProfile ? 'found' : 'not found');

    // Process based on event type
    switch (event) {
      case 'purchase_created':
        if (existingProfile) {
          // Update existing profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              name: name || existingProfile.name,
              phone: phone || existingProfile.phone,
              plano: product,
              status_pagamento: 'pending',
            })
            .eq('id', existingProfile.id);
          
          if (updateError) {
            console.error('Error updating profile:', updateError);
            throw updateError;
          }
        } else {
          // Create new profile with generated id
          const newProfileId = crypto.randomUUID();
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: newProfileId,
              email,
              name,
              phone,
              plano: product,
              status_pagamento: 'pending',
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
          }
        }

        await supabase.rpc('log_audit', {
          p_actor: 'system:webhook',
          p_action: 'purchase_created',
          p_meta: { email, order_id: orderId },
        });
        console.log('Purchase created for:', email);
        break;

      case 'purchase_approved':
        if (existingProfile) {
          // Update existing profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              name: name || existingProfile.name,
              phone: phone || existingProfile.phone,
              plano: product,
              status_pagamento: 'approved',
              kiwify_order_id: orderId,
              last_paid_at: transactionDate ? new Date(transactionDate) : new Date(),
            })
            .eq('id', existingProfile.id);
          
          if (updateError) {
            console.error('Error updating profile:', updateError);
            throw updateError;
          }
        } else {
          // Create new profile with generated id
          const newProfileId = crypto.randomUUID();
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: newProfileId,
              email,
              name,
              phone,
              plano: product,
              status_pagamento: 'approved',
              kiwify_order_id: orderId,
              last_paid_at: transactionDate ? new Date(transactionDate) : new Date(),
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
          }
        }

        await supabase.rpc('log_audit', {
          p_actor: 'system:webhook',
          p_action: 'user_activated',
          p_meta: { email, order_id: orderId, product },
        });

        console.log('User activated:', email, 'with plan:', product);
        break;

      case 'purchase_refunded':
      case 'subscription_canceled':
        if (existingProfile) {
          const { error: revokeError } = await supabase
            .from('profiles')
            .update({ status_pagamento: 'revoked' })
            .eq('id', existingProfile.id);

          if (revokeError) {
            console.error('Error revoking profile:', revokeError);
            throw revokeError;
          }

          await supabase.rpc('log_audit', {
            p_actor: 'system:webhook',
            p_action: 'user_revoked',
            p_meta: { email, order_id: orderId, reason: event },
          });

          console.log('User revoked:', email);
        } else {
          console.log('Profile not found for revocation:', email);
        }
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
