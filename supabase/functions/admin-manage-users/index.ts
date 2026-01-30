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

interface UpdateRequest {
  userId: string;
  updates: {
    name?: string;
    plano?: string;
    status_pagamento?: 'pending' | 'approved' | 'revoked';
    phone?: string;
  };
}

interface DeleteRequest {
  userIdToDelete: string;
}

interface AdminRequest {
  action?: 'create' | 'update' | 'delete' | 'reset-password';
  // For CREATE (backwards compatible)
  users?: Array<{ email: string; name?: string; plano?: string }>;
  // For UPDATE
  userId?: string;
  updates?: {
    name?: string;
    plano?: string;
    status_pagamento?: 'pending' | 'approved' | 'revoked';
    phone?: string;
  };
  // For DELETE
  userIdToDelete?: string;
  // For RESET-PASSWORD
  newPassword?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== admin-manage-users called ===');
  console.log('Method:', req.method);
  console.log('Has Authorization:', !!req.headers.get('Authorization'));
  
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
      console.error('Authorization header missing');
      return new Response(
        JSON.stringify({ 
          error: 'Não autorizado - token não fornecido',
          hint: 'Verifique se você está logado e tente novamente'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError?.message || 'User not found');
      return new Response(
        JSON.stringify({ 
          error: 'Não autorizado - token inválido',
          hint: 'Sua sessão pode ter expirado. Faça login novamente.'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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

    const body: AdminRequest = await req.json();
    
    // Determine action - default to 'create' for backwards compatibility
    const action = body.action || 'create';

    console.log(`Admin action: ${action} by ${user.email}`);

    switch (action) {
      case 'create': {
        const { users } = body;
        
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
      }

      case 'update': {
        const { userId, updates } = body;

        if (!userId) {
          throw new Error('ID do usuário é obrigatório');
        }

        if (!updates || Object.keys(updates).length === 0) {
          throw new Error('Nenhuma atualização fornecida');
        }

        // Build update object with only provided fields
        const updateData: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.plano !== undefined) updateData.plano = updates.plano;
        if (updates.status_pagamento !== undefined) updateData.status_pagamento = updates.status_pagamento;
        if (updates.phone !== undefined) updateData.phone = updates.phone;

        console.log(`Updating user ${userId}:`, updateData);

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
          throw new Error('Erro ao atualizar perfil: ' + updateError.message);
        }

        // Get user email for audit log
        const { data: targetUser } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        // Log de auditoria
        await supabase.rpc('log_audit', {
          p_actor: user.email || user.id,
          p_action: 'admin_update_user',
          p_meta: { 
            target_user_id: userId, 
            target_email: targetUser?.email,
            changes: updates 
          },
        });

        console.log(`User ${userId} updated successfully`);

        return new Response(
          JSON.stringify({ success: true, message: 'Usuário atualizado com sucesso' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'delete': {
        const { userIdToDelete } = body;

        if (!userIdToDelete) {
          throw new Error('ID do usuário é obrigatório');
        }

        // Get user email before deletion for audit log
        const { data: targetUser } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userIdToDelete)
          .single();

        console.log(`Deleting user ${userIdToDelete} (${targetUser?.email})`);

        // Delete user from auth (this will cascade to profiles due to RLS policies)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userIdToDelete);

        if (deleteError) {
          console.error('Erro ao deletar usuário:', deleteError);
          throw new Error('Erro ao deletar usuário: ' + deleteError.message);
        }

        // Log de auditoria
        await supabase.rpc('log_audit', {
          p_actor: user.email || user.id,
          p_action: 'admin_delete_user',
          p_meta: { 
            deleted_user_id: userIdToDelete, 
            deleted_email: targetUser?.email 
          },
        });

        console.log(`User ${userIdToDelete} deleted successfully`);

        return new Response(
          JSON.stringify({ success: true, message: 'Usuário excluído com sucesso' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'reset-password': {
        const { userId, newPassword } = body;

        if (!userId) {
          throw new Error('ID do usuário é obrigatório');
        }

        if (!newPassword || newPassword.length < 8) {
          throw new Error('Senha deve ter no mínimo 8 caracteres');
        }

        // Get user email for audit log
        const { data: targetUser } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        console.log(`Resetting password for user ${userId} (${targetUser?.email})`);

        // Update password using Admin API
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          { password: newPassword }
        );

        if (updateError) {
          console.error('Erro ao redefinir senha:', updateError);
          throw new Error('Erro ao redefinir senha: ' + updateError.message);
        }

        // Log de auditoria
        await supabase.rpc('log_audit', {
          p_actor: user.email || user.id,
          p_action: 'admin_reset_password',
          p_meta: { 
            target_user_id: userId, 
            target_email: targetUser?.email 
          },
        });

        console.log(`Password reset for user ${userId} completed successfully`);

        return new Response(
          JSON.stringify({ success: true, message: 'Senha redefinida com sucesso' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      default:
        throw new Error(`Ação inválida: ${action}`);
    }
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
