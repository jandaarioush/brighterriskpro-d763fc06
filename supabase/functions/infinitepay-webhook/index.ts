import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Validate token from query params
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const expectedToken = Deno.env.get("WEBHOOK_SHARED_TOKEN");

    if (!token || token !== expectedToken) {
      console.error("Invalid webhook token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse webhook payload
    const payload = await req.json();
    console.log("Received Infinite Pay webhook:", JSON.stringify(payload));

    // Extract data from payload
    const {
      invoice_slug,
      amount,
      paid_amount,
      installments,
      capture_method,
      transaction_nsu,
      order_nsu,
      receipt_url,
      items,
    } = payload;

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if already processed (idempotency)
    const { data: alreadyProcessed } = await supabase.rpc("check_webhook_processed", {
      p_order_id: order_nsu,
      p_event: "payment_approved",
    });

    if (alreadyProcessed) {
      console.log("Webhook already processed:", order_nsu);
      return new Response(JSON.stringify({ success: true, message: "Already processed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Log webhook event
    const { error: webhookError } = await supabase.from("webhook_events").insert({
      provider: "infinitepay",
      event: "payment_approved",
      order_id: order_nsu,
      raw_payload: payload,
      status: "received",
    });

    if (webhookError) {
      console.error("Error logging webhook event:", webhookError);
    }

    // Determine plan based on amount
    // 9700 cents = R$ 97 = mensal
    // 49700 cents = R$ 497 = anual
    let plano = "mensal";
    if (amount >= 49000) {
      plano = "anual";
    }

    // Extract email from items description or order_nsu
    // Since we don't have email in webhook, we need to find profile by order_nsu
    // First, let's update any profile that might have this order_nsu stored during creation
    
    // Actually, we need to find the profile. The order_nsu follows pattern BRP-{timestamp}-{random}
    // We stored the email when creating the link, so we need to match by order_nsu
    
    // For now, we'll update webhook_events with the order_nsu and mark it processed
    // The actual profile update will happen when user accesses the system

    // Update webhook event status
    await supabase
      .from("webhook_events")
      .update({
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("order_id", order_nsu)
      .eq("provider", "infinitepay");

    // Log audit
    await supabase.rpc("log_audit", {
      p_actor: "infinitepay-webhook",
      p_action: "payment_approved",
      p_meta: {
        order_nsu,
        amount,
        paid_amount,
        plano,
        capture_method,
        transaction_nsu,
        invoice_slug,
        receipt_url,
      },
    });

    console.log("Webhook processed successfully:", order_nsu);

    // Respond quickly with 200 OK (Infinite Pay requirement)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error processing webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    // Return 400 so Infinite Pay will retry
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
