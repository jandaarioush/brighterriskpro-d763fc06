const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { source, full_name, email, phone, message, subject, plan_type } = await req.json();

    // Validação básica
    if (!email || !source) {
      console.error('Missing required fields:', { email: !!email, source: !!source });
      return new Response(
        JSON.stringify({ success: false, error: 'Email e source são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email);
      return new Response(
        JSON.stringify({ success: false, error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // API Key protegida no backend
    const webhookUrl = 'https://wsvafihzxxlbgfxbqqmh.supabase.co/functions/v1/lead-capture-webhook';
    const apiKey = Deno.env.get('LEAD_WEBHOOK_API_KEY');

    if (!apiKey) {
      console.error('LEAD_WEBHOOK_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração inválida' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Payload para o webhook externo - sanitizado e truncado
    const payload = {
      source,
      full_name: full_name?.trim().substring(0, 100) || '',
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      message: message?.trim().substring(0, 1000) || '',
      subject: subject?.trim().substring(0, 200) || '',
      plan_type: plan_type || null,
      created_at: new Date().toISOString(),
    };

    console.log('Sending lead to webhook:', { source, email: payload.email });

    // Enviar para webhook externo com API Key
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Webhook error:', response.status, responseText);
      throw new Error(`Webhook retornou ${response.status}`);
    }

    console.log('Lead sent successfully:', { source, email: payload.email });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao enviar lead:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
