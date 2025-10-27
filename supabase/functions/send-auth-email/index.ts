import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const resendApiKey = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getResetPasswordEmailHTML(token: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 48px;">
              <h1 style="color: #333; font-size: 24px; font-weight: bold; margin: 0 0 24px 0;">Redefinir Senha</h1>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; margin: 0 0 24px 0;">
                Você solicitou a redefinição de senha da sua conta. Clique no botão abaixo para criar uma nova senha:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${resetUrl}" style="background-color: #2563eb; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 40px; display: inline-block;">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; margin: 24px 0 16px 0;">
                Ou copie e cole este código temporário:
              </p>
              
              <div style="background-color: #f4f4f4; border: 1px solid #eee; border-radius: 5px; padding: 16px; margin: 0 0 24px 0;">
                <code style="color: #333; font-family: monospace; font-size: 16px; word-break: break-all;">${token}</code>
              </div>
              
              <p style="color: #8898aa; font-size: 14px; line-height: 24px; margin: 16px 0 8px 0;">
                Se você não solicitou a redefinição de senha, pode ignorar este email com segurança.
              </p>
              
              <p style="color: #8898aa; font-size: 14px; line-height: 24px; margin: 8px 0 0 0;">
                Este link expira em 1 hora.
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
    console.log('Received auth webhook:', data.email_data?.email_action_type);

    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = data as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
      }
    };

    // Only handle password recovery emails
    if (email_action_type !== 'recovery') {
      console.log('Not a recovery email, skipping');
      return new Response(JSON.stringify({ message: 'Not a recovery email' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Sending password reset email to:', user.email);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const resetUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
    
    const html = getResetPasswordEmailHTML(token, resetUrl);

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sua Plataforma <onboarding@resend.dev>',
        to: [user.email],
        subject: 'Redefinir sua senha',
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend error:', resendData);
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`);
    }

    console.log('Password reset email sent successfully:', resendData);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
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
