import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple rate limiting (in-memory)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 5) {
    console.log(`🚫 [RATE_LIMIT] IP bloqueado temporariamente: ${ip}`);
    return false;
  }
  
  limit.count++;
  return true;
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
    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Aguarde 1 minuto.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const { email, code, newPassword } = await req.json();
    
    console.log('🔍 [VALIDATE] Validando código');
    
    // Validate input
    if (!email || !code || !newPassword) {
      console.error('❌ [VALIDATE] Dados incompletos');
      throw new Error('Email, código e senha são obrigatórios');
    }
    
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      console.error('❌ [VALIDATE] Código inválido (deve ter 6 dígitos)');
      throw new Error('Código deve ter 6 dígitos numéricos');
    }
    
    if (newPassword.length < 6) {
      console.error('❌ [VALIDATE] Senha muito curta');
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }
    
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();
    
    // Find valid code in database
    console.log('💾 [VALIDATE] Buscando código no banco...');
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('password_reset_codes')
      .select('*')
      .eq('email', trimmedEmail)
      .eq('code', trimmedCode)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    
    if (codeError) {
      console.error('❌ [VALIDATE] Erro ao buscar código:', codeError);
      throw new Error('Erro ao validar código');
    }
    
    if (!codeData) {
      console.error('❌ [VALIDATE] Código inválido, expirado ou já usado');
      throw new Error('Código inválido, expirado ou já usado');
    }
    
    console.log('✅ [VALIDATE] Código válido encontrado');
    
    // Find user by email
    console.log('🔍 [VALIDATE] Buscando usuário...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', trimmedEmail)
      .maybeSingle();
    
    if (profileError || !profile) {
      console.error('❌ [VALIDATE] Usuário não encontrado');
      throw new Error('Usuário não encontrado');
    }
    
    console.log('✅ [VALIDATE] Usuário encontrado');
    
    // Update password using Supabase Admin
    console.log('🔄 [VALIDATE] Atualizando senha...');
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      { password: newPassword }
    );
    
    if (updateError) {
      console.error('❌ [VALIDATE] Erro ao atualizar senha:', updateError);
      throw new Error('Erro ao atualizar senha');
    }
    
    console.log('✅ [VALIDATE] Senha atualizada com sucesso');
    
    // Mark code as used
    console.log('💾 [VALIDATE] Marcando código como usado...');
    const { error: markError } = await supabaseAdmin
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', codeData.id);
    
    if (markError) {
      console.error('⚠️ [VALIDATE] Erro ao marcar código como usado:', markError);
      // Não falha a operação, apenas loga
    }
    
    console.log('✅ [VALIDATE] Código marcado como usado');
    
    // Clean up old codes for this email (opcional, mas ajuda a manter banco limpo)
    await supabaseAdmin
      .from('password_reset_codes')
      .delete()
      .eq('email', trimmedEmail)
      .neq('id', codeData.id);
    
    console.log('✅ [VALIDATE] Processo concluído com sucesso');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Senha redefinida com sucesso'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    console.error('❌ [VALIDATE] Erro:', error);
    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});