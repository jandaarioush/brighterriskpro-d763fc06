import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    if (!handle) {
      throw new Error("INFINITEPAY_HANDLE não configurado");
    }

    if (!webhookToken) {
      throw new Error("WEBHOOK_SHARED_TOKEN não configurado");
    }

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
        price: 9700, // R$ 97,00 in cents
        description: "Brighter Risk Pro - Premium Mensal",
      },
      anual: {
        price: 49700, // R$ 497,00 in cents
        description: "Brighter Risk Pro - Premium Anual",
      },
    };

    const selectedPlan = plans[body.plano];

    // Generate unique order NSU
    const orderNsu = `BRP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

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
        name: body.customer.name.trim().substring(0, 100),
        email: body.customer.email.trim().toLowerCase(),
        phone_number: body.customer.phone_number.startsWith("+") 
          ? body.customer.phone_number 
          : `+${phoneClean}`,
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

    console.log("Infinite Pay link created successfully:", responseData);

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: responseData.url || responseData.checkout_url,
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
