import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  status_pagamento: string;
  plano: string | null;
  kiwify_order_id: string | null;
  last_paid_at: string | null;
  created_at: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchEmail) {
      const filtered = users.filter((user) =>
        user.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchEmail, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar usuários: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: 'approved' | 'revoked') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status_pagamento: newStatus })
        .eq('id', userId);

      if (error) throw error;

      // Log audit
      const targetUser = users.find((u) => u.id === userId);
      await supabase.rpc('log_audit', {
        p_actor: `admin:${user?.email}`,
        p_action: newStatus === 'approved' ? 'user_activated_manual' : 'user_revoked_manual',
        p_meta: { 
          email: targetUser?.email, 
          user_id: userId,
          admin_id: user?.id
        },
      });

      toast.success(
        newStatus === 'approved'
          ? 'Acesso ativado com sucesso!'
          : 'Acesso revogado com sucesso!'
      );
      loadUsers();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pendente' },
      approved: { variant: 'default', label: 'Aprovado' },
      revoked: { variant: 'destructive', label: 'Revogado' },
    };

    const statusConfig = config[status] || { variant: 'outline', label: status };

    return (
      <Badge variant={statusConfig.variant}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        <Button onClick={loadUsers} disabled={loading}>
          Atualizar
        </Button>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Buscar por email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="max-w-md"
          />
        </div>
      </Card>

      {/* Users table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Usuários ({filteredUsers.length})
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Pagamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name || '-'}</TableCell>
                    <TableCell>{user.plano || '-'}</TableCell>
                    <TableCell>{getStatusBadge(user.status_pagamento)}</TableCell>
                    <TableCell>
                      {user.last_paid_at
                        ? format(new Date(user.last_paid_at), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.status_pagamento !== 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserStatus(user.id, 'approved')}
                          >
                            Ativar
                          </Button>
                        )}
                        {user.status_pagamento === 'approved' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateUserStatus(user.id, 'revoked')}
                          >
                            Revogar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
