import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkCreateRequest {
  users: Array<{
    email: string;
    name?: string;
    plano?: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autorizado');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Não autorizado');
    }

    // Verificar se é admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error('Acesso negado - apenas administradores');
    }

    const { users }: BulkCreateRequest = await req.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      throw new Error('Lista de usuários inválida');
    }

    if (users.length > 100) {
      throw new Error('Máximo de 100 usuários por vez');
    }

    const results = {
      success: [] as string[],
      errors: [] as { email: string; error: string }[],
    };

    const defaultPassword = 'TempPass123!';

    for (const userData of users) {
      try {
        const email = userData.email?.trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          results.errors.push({ email: email || 'inválido', error: 'Email inválido' });
          continue;
        }

        // Verificar se usuário já existe
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const userExists = existingUser?.users?.some(u => u.email === email);

        if (userExists) {
          results.errors.push({ email, error: 'Usuário já existe' });
          continue;
        }

        // Criar usuário com senha padrão
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password: defaultPassword,
          email_confirm: true,
        });

        if (createError || !newUser.user) {
          results.errors.push({ email, error: createError?.message || 'Erro ao criar usuário' });
          continue;
        }

        // Criar perfil com status aprovado
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newUser.user.id,
            email,
            name: userData.name || null,
            plano: userData.plano || null,
            status_pagamento: 'approved',
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          // Tentar deletar o usuário criado
          await supabase.auth.admin.deleteUser(newUser.user.id);
          results.errors.push({ email, error: 'Erro ao criar perfil' });
          continue;
        }

        // Log de auditoria
        await supabase.rpc('log_audit', {
          p_actor: user.email || user.id,
          p_action: 'bulk_create_user',
          p_meta: { target_email: email, plano: userData.plano },
        });

        results.success.push(email);
      } catch (error: any) {
        results.errors.push({ email: userData.email, error: error.message });
      }
    }

    return new Response(
      JSON.stringify(results),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Erro na função admin-manage-users:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
