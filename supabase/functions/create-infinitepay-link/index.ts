import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateLinkRequest {
  plano: "mensal" | "anual";
  customer: {
    name: string;
    email: string;
    phone_number: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const handle = Deno.env.get("INFINITEPAY_HANDLE");
    const webhookToken = Deno.env.get("WEBHOOK_SHARED_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!handle) {
      throw new Error("INFINITEPAY_HANDLE não configurado");
    }

    if (!webhookToken) {
      throw new Error("WEBHOOK_SHARED_TOKEN não configurado");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CreateLinkRequest = await req.json();

    // Validate required fields
    if (!body.plano || !["mensal", "anual"].includes(body.plano)) {
      throw new Error("Plano inválido. Use 'mensal' ou 'anual'");
    }

    if (!body.customer?.name || !body.customer?.email || !body.customer?.phone_number) {
      throw new Error("Dados do cliente incompletos");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customer.email)) {
      throw new Error("Email inválido");
    }

    // Phone validation (basic)
    const phoneClean = body.customer.phone_number.replace(/\D/g, "");
    if (phoneClean.length < 10 || phoneClean.length > 15) {
      throw new Error("Telefone inválido");
    }

    // Plan configuration
    const plans = {
      mensal: {
        price: 14700, // R$ 147,00 in cents
        description: "Brighter Risk Pro - Premium Mensal",
      },
      anual: {
        price: 99700, // R$ 997,00 in cents
        description: "Brighter Risk Pro - Premium Anual",
      },
    };

    const selectedPlan = plans[body.plano];

    // Generate unique order NSU
    const orderNsu = `BRP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Prepare customer data
    const customerEmail = body.customer.email.trim().toLowerCase();
    const customerName = body.customer.name.trim().substring(0, 100);
    const customerPhone = body.customer.phone_number.startsWith("+") 
      ? body.customer.phone_number 
      : `+${phoneClean}`;

    // Build webhook URL with token
    const webhookUrl = `${supabaseUrl}/functions/v1/infinitepay-webhook?token=${webhookToken}`;

    // Build redirect URL (use published URL)
    const redirectUrl = "https://brighterriskpro.lovable.app/pagamento-sucesso";

    // Build payload for Infinite Pay
    const payload = {
      handle,
      items: [
        {
          quantity: 1,
          price: selectedPlan.price,
          description: selectedPlan.description,
        },
      ],
      order_nsu: orderNsu,
      redirect_url: redirectUrl,
      webhook_url: webhookUrl,
      customer: {
        name: customerName,
        email: customerEmail,
        phone_number: customerPhone,
      },
    };

    console.log("Creating Infinite Pay link with payload:", JSON.stringify({
      ...payload,
      webhook_url: "[REDACTED]"
    }));

    // Call Infinite Pay API
    const response = await fetch("https://api.infinitepay.io/invoices/public/checkout/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Infinite Pay API error:", responseData);
      throw new Error(responseData.message || "Erro ao criar link de pagamento");
    }

    const checkoutUrl = responseData.url || responseData.checkout_url;

    console.log("Infinite Pay link created successfully:", { orderNsu, checkoutUrl });

    // Save pending order to database
    const { error: insertError } = await supabase
      .from("pending_orders")
      .insert({
        order_nsu: orderNsu,
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        plano: body.plano,
        amount: selectedPlan.price,
        checkout_url: checkoutUrl,
        status: "pending",
      });

    if (insertError) {
      console.error("Error saving pending order:", insertError);
      // Don't fail the request, just log the error
      // The payment can still proceed
    } else {
      console.log("Pending order saved successfully:", orderNsu);
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: checkoutUrl,
        order_nsu: orderNsu,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error creating payment link:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno ao processar pagamento";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
