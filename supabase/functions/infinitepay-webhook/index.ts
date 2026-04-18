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

    // Find pending order by order_nsu
    const { data: pendingOrder, error: pendingError } = await supabase
      .from("pending_orders")
      .select("*")
      .eq("order_nsu", order_nsu)
      .maybeSingle();

    if (pendingError) {
      console.error("Error fetching pending order:", pendingError);
    }

    if (!pendingOrder) {
      console.error("Pending order not found for order_nsu:", order_nsu);
      // Still process the webhook but log the issue
      await supabase.rpc("log_audit", {
        p_actor: "infinitepay-webhook",
        p_action: "payment_approved_no_pending_order",
        p_meta: { order_nsu, amount, transaction_nsu },
      });
    } else {
      console.log("Found pending order:", pendingOrder);

      // Update pending order status to paid
      const { error: updatePendingError } = await supabase
        .from("pending_orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("order_nsu", order_nsu);

      if (updatePendingError) {
        console.error("Error updating pending order:", updatePendingError);
      }

      // Calculate expiration date based on plan
      const now = new Date();
      let expiresAt: Date;
      if (pendingOrder.plano === "anual") {
        expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      } else {
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }

      // Create subscription
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          email: pendingOrder.email,
          plano: pendingOrder.plano,
          order_nsu,
          transaction_nsu,
          amount: pendingOrder.amount,
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          status: "active",
        });

      if (subscriptionError) {
        console.error("Error creating subscription:", subscriptionError);
      } else {
        console.log("Subscription created for:", pendingOrder.email);
      }

      // Update webhook_events with email
      await supabase
        .from("webhook_events")
        .update({ email: pendingOrder.email })
        .eq("order_id", order_nsu)
        .eq("provider", "infinitepay");

      // Check if profile exists and update, or create new one
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", pendingOrder.email)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({
            status_pagamento: "paid",
            plano: pendingOrder.plano,
            infinitepay_order_nsu: order_nsu,
            last_paid_at: now.toISOString(),
            name: pendingOrder.name,
            phone: pendingOrder.phone,
            updated_at: now.toISOString(),
          })
          .eq("email", pendingOrder.email);

        if (profileUpdateError) {
          console.error("Error updating profile:", profileUpdateError);
        } else {
          console.log("Profile updated for:", pendingOrder.email);
        }
      } else {
        // Profile will be created when user signs up
        // Just log for now
        console.log("No profile found for email, will be linked on signup:", pendingOrder.email);
      }
    }

    // Update webhook event status to processed
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
        plano: pendingOrder?.plano || "unknown",
        email: pendingOrder?.email || "unknown",
        capture_method,
        transaction_nsu,
        invoice_slug,
        receipt_url,
      },
    });

    console.log("Webhook processed successfully:", order_nsu);

    // Fan-out: forward payload to external site (non-blocking)
    const forwardUrl = Deno.env.get("EXTERNAL_FORWARD_URL");
    const forwardToken = Deno.env.get("EXTERNAL_FORWARD_TOKEN");

    if (forwardUrl) {
      const forwardPayload = {
        source: "brighter-riskpro",
        event: "payment_approved",
        order_nsu,
        transaction_nsu,
        invoice_slug,
        amount,
        paid_amount,
        installments,
        capture_method,
        plano: pendingOrder?.plano,
        email: pendingOrder?.email,
        name: pendingOrder?.name,
        phone: pendingOrder?.phone,
        receipt_url,
        items,
        occurred_at: new Date().toISOString(),
      };

      // Use waitUntil so the response returns immediately but the forward keeps running
      // @ts-expect-error EdgeRuntime is available in Supabase Edge Functions
      EdgeRuntime.waitUntil(
        forwardToExternal(supabase, forwardUrl, forwardToken, order_nsu, forwardPayload)
      );
    }

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

// Forward webhook payload to an external endpoint with timeout, 1 retry, and audit logging.
async function forwardToExternal(
  supabase: ReturnType<typeof createClient>,
  url: string,
  token: string | undefined,
  orderNsu: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const maxAttempts = 2;
  let lastStatus = 0;
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["X-Forward-Token"] = token;

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      lastStatus = res.status;

      if (res.ok) {
        await supabase.from("webhook_events").insert({
          provider: "external_forward",
          event: "payment_approved",
          order_id: orderNsu,
          email: (payload.email as string) ?? null,
          raw_payload: { ...payload, http_status: res.status, attempt },
          status: "forwarded",
          processed_at: new Date().toISOString(),
        });
        console.log(`Forward succeeded for ${orderNsu} (attempt ${attempt}, status ${res.status})`);
        return;
      }

      // 4xx: don't retry
      if (res.status >= 400 && res.status < 500) {
        const body = await res.text().catch(() => "");
        lastError = `HTTP ${res.status}: ${body.slice(0, 500)}`;
        break;
      }

      // 5xx: retry once
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      clearTimeout(timeout);
      lastError = err instanceof Error ? err.message : "Unknown error";
    }

    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  await supabase.from("webhook_events").insert({
    provider: "external_forward",
    event: "payment_approved",
    order_id: orderNsu,
    email: (payload.email as string) ?? null,
    raw_payload: { ...payload, http_status: lastStatus, attempts: maxAttempts },
    status: "forward_failed",
    error: lastError,
    processed_at: new Date().toISOString(),
  });
  console.error(`Forward failed for ${orderNsu}: ${lastError}`);
}
