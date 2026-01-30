

## Plano: Funcionalidade de Reset de Senha Administrativo

### Objetivo

Adicionar a capacidade de administradores redefinirem senhas de usuários diretamente pelo painel de administração, sem necessidade de email ou código de verificação.

---

### Componentes a Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/admin-manage-users/index.ts` | Adicionar ação `reset-password` |
| `src/pages/AdminUsers.tsx` | Adicionar botão e dialog de reset de senha |

---

### 1. Atualização da Edge Function

**Arquivo:** `supabase/functions/admin-manage-users/index.ts`

Adicionar nova ação `reset-password` que:
- Recebe `userId` e `newPassword`
- Valida que a senha atende aos requisitos mínimos
- Usa `supabase.auth.admin.updateUserById()` para redefinir a senha
- Registra a ação no log de auditoria

```typescript
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

  // Update password
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );

  if (updateError) {
    throw new Error('Erro ao redefinir senha: ' + updateError.message);
  }

  // Log audit
  await supabase.rpc('log_audit', {
    p_actor: user.email || user.id,
    p_action: 'admin_reset_password',
    p_meta: { 
      target_user_id: userId, 
      target_email: targetUser?.email 
    },
  });

  return new Response(
    JSON.stringify({ success: true, message: 'Senha redefinida com sucesso' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

---

### 2. Atualização do Frontend

**Arquivo:** `src/pages/AdminUsers.tsx`

Adicionar:

1. **Estados para o dialog de reset:**
```typescript
const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
const [userToResetPassword, setUserToResetPassword] = useState<UserProfile | null>(null);
const [newPassword, setNewPassword] = useState('');
const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
```

2. **Botão de reset na tabela de usuários:**
```tsx
<Button 
  variant="outline" 
  size="sm"
  onClick={() => openResetPasswordDialog(user)}
>
  <Key className="w-4 h-4" />
</Button>
```

3. **Dialog de reset de senha:**
```tsx
<Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Redefinir Senha</DialogTitle>
      <DialogDescription>
        Definir nova senha para {userToResetPassword?.email}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <Input
        type="password"
        placeholder="Nova senha (mínimo 8 caracteres)"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <ul className="text-xs text-muted-foreground">
        <li>• Mínimo de 8 caracteres</li>
        <li>• Pelo menos uma letra maiúscula</li>
        <li>• Pelo menos uma letra minúscula</li>
        <li>• Pelo menos um número</li>
        <li>• Pelo menos um caractere especial</li>
      </ul>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={closeResetPasswordDialog}>
        Cancelar
      </Button>
      <Button onClick={handleResetPassword} disabled={resetPasswordLoading}>
        {resetPasswordLoading ? 'Redefinindo...' : 'Redefinir Senha'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

4. **Handler de reset:**
```typescript
const handleResetPassword = async () => {
  if (!userToResetPassword || !newPassword) return;
  
  // Validate password strength
  if (!strongPasswordSchema.safeParse(newPassword).success) {
    toast.error('Senha não atende aos requisitos de segurança');
    return;
  }
  
  if (!await ensureSession()) return;
  
  setResetPasswordLoading(true);
  try {
    const { data, error } = await supabase.functions.invoke('admin-manage-users', {
      body: {
        action: 'reset-password',
        userId: userToResetPassword.id,
        newPassword,
      },
    });
    
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    
    toast.success('Senha redefinida com sucesso!');
    closeResetPasswordDialog();
  } catch (error: any) {
    toast.error('Erro ao redefinir senha: ' + error.message);
  } finally {
    setResetPasswordLoading(false);
  }
};
```

---

### Fluxo de Uso

```text
+------------------+     +-------------------+     +---------------------+
| Admin clica em   | --> | Dialog pede nova  | --> | Edge Function       |
| botão de reset   |     | senha             |     | redefine via Admin  |
+------------------+     +-------------------+     | API do Supabase     |
                                                   +---------------------+
                                                             |
                                                             v
                                                   +---------------------+
                                                   | Audit log registra  |
                                                   | a ação              |
                                                   +---------------------+
```

---

### Segurança

- Validação de força de senha usando `strongPasswordSchema` (já existente no projeto)
- Verificação de sessão admin antes da chamada
- Log de auditoria completo
- Endpoint protegido por JWT e verificação de role `admin`

