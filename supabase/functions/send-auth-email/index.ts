import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Validate required environment variables
if (!resendApiKey) {
  console.error('❌ RESEND_API_KEY não configurado');
}
if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL não configurado');
}
if (!supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurado');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getResetPasswordEmailHTML(code: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Recuperação de Senha</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 48px;">
              <h1 style="color: #333; font-size: 24px; font-weight: bold; margin: 0 0 24px 0;">Recuperação de Senha</h1>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; margin: 0 0 24px 0;">
                Use o código abaixo para redefinir sua senha:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <div style="
                      font-size: 32px; 
                      font-weight: bold; 
                      letter-spacing: 8px;
                      padding: 20px;
                      background: #f5f5f5;
                      border-radius: 8px;
                      color: #2563eb;
                      font-family: 'Courier New', monospace;
                    ">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; margin: 24px 0 16px 0;">
                <strong>Para redefinir sua senha:</strong>
              </p>
              
              <ol style="color: #333; font-size: 14px; line-height: 24px; margin: 0 0 24px 0; padding-left: 20px;">
                <li>Acesse a página de redefinição de senha</li>
                <li>Digite seu email</li>
                <li>Digite o código acima</li>
                <li>Crie sua nova senha</li>
              </ol>
              
              <p style="color: #e53e3e; font-size: 14px; line-height: 24px; margin: 16px 0 8px 0; font-weight: bold;">
                ⏰ Este código expira em 15 minutos
              </p>
              
              <p style="color: #8898aa; font-size: 14px; line-height: 24px; margin: 16px 0 8px 0;">
                Se você não solicitou a redefinição de senha, pode ignorar este email com segurança.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const data = await req.json();
    
    // Check if this is a direct call from frontend (has email and type)
    if (data.email && data.type === 'recovery') {
      console.log('🔑 [RECOVERY] Requisição de recuperação para:', data.email);
      
      // Validate API key
      if (!resendApiKey) {
        console.error('❌ [RECOVERY] RESEND_API_KEY não está configurado!');
        throw new Error('RESEND_API_KEY não configurado. Configure o secret no painel.');
      }

      console.log('✅ [RECOVERY] RESEND_API_KEY encontrado');
      
      // Create admin client
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
      console.log('✅ [RECOVERY] Cliente Supabase Admin criado');
      
      const trimmedEmail = data.email.trim().toLowerCase();
      
      // Verify user exists
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', trimmedEmail)
        .maybeSingle();
      
      if (profileError || !profileData) {
        console.error('❌ [RECOVERY] Usuário não encontrado:', trimmedEmail);
        throw new Error('Usuário não encontrado');
      }
      
      console.log('✅ [RECOVERY] Usuário encontrado:', profileData.id);
      
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('✅ [RECOVERY] Código gerado (6 dígitos)');
      
      // Calculate expiration (15 minutes)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      
      // Save code to database
      console.log('💾 [RECOVERY] Salvando código no banco...');
      const { error: insertError } = await supabaseAdmin
        .from('password_reset_codes')
        .insert({
          email: trimmedEmail,
          code: code,
          expires_at: expiresAt
        });
      
      if (insertError) {
        console.error('❌ [RECOVERY] Erro ao salvar código:', insertError);
        throw new Error('Erro ao gerar código de recuperação');
      }
      
      console.log('✅ [RECOVERY] Código salvo no banco (expira em 15min)');
      
      // Prepare email HTML
      console.log('📧 [RECOVERY] Preparando HTML do email...');
      const html = getResetPasswordEmailHTML(code);

      // Send email using Resend API with timeout
      console.log('📤 [RECOVERY] Enviando email via Resend para:', trimmedEmail);
      console.log('📤 [RECOVERY] Remetente: Brighter <contato@brighter.com.br>');
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Brighter <contato@brighter.com.br>',
            to: [trimmedEmail],
            subject: 'Código de Recuperação de Senha - Brighter',
            html,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
          console.error('❌ [RECOVERY] Erro do Resend:', resendData);
          console.error('❌ [RECOVERY] Status HTTP:', resendResponse.status);
          
          // Mensagens de erro específicas
          if (resendData.message?.includes('domain')) {
            throw new Error('Domínio brighter.com.br não verificado no Resend. Verifique em https://resend.com/domains');
          }
          if (resendData.message?.includes('API key')) {
            throw new Error('API Key do Resend inválida. Verifique em https://resend.com/api-keys');
          }
          
          throw new Error(`Erro do Resend: ${resendData.message || JSON.stringify(resendData)}`);
        }

        console.log('✅ [RECOVERY] Email enviado com sucesso!');
        console.log('📧 [RECOVERY] ID do email:', resendData.id);
        console.log('🔢 [RECOVERY] Código válido por 15 minutos');

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Código enviado com sucesso',
          emailId: resendData.id 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('❌ [RECOVERY] Timeout ao enviar email (>10s)');
          throw new Error('Timeout ao enviar email. Tente novamente.');
        }
        
        throw fetchError;
      }
    }

    // Handle webhook calls (legacy support) - não usado mais, mas mantido por compatibilidade
    console.log('⚠️ Webhook legacy recebido (não processado)');
    return new Response(JSON.stringify({ message: 'Webhook legacy não suportado' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error processing request:', error);
    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});