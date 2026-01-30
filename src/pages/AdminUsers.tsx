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
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Upload, UserPlus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  status_pagamento: string;
  plano: string | null;
  kiwify_order_id: string | null;
  last_paid_at: string | null;
  created_at: string;
}

interface EditUserData {
  id: string;
  email: string;
  name: string;
  phone: string;
  plano: string;
  status_pagamento: string;
}

const planoOptions = [
  { value: '', label: 'Sem Plano' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
];

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'revoked', label: 'Revogado' },
];

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPlano, setNewUserPlano] = useState('');

  // Edit dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<EditUserData | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleBulkRevoke = async () => {
    if (selectedUsers.size === 0) {
      toast.error('Selecione pelo menos um usuário');
      return;
    }

    setBulkLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        await updateUserStatus(userId, 'revoked');
        successCount++;
      } catch {
        errorCount++;
      }
    }

    setBulkLoading(false);
    setSelectedUsers(new Set());
    
    if (errorCount === 0) {
      toast.success(`${successCount} usuários revogados com sucesso!`);
    } else {
      toast.warning(`${successCount} usuários revogados, ${errorCount} com erro`);
    }
  };

  const parseCsvFile = (file: File): Promise<Array<{ email: string; name?: string; plano?: string }>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const users = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const userObj: any = {};
            
            headers.forEach((header, index) => {
              if (values[index]) {
                userObj[header] = values[index];
              }
            });
            
            return userObj;
          }).filter(u => u.email);
          
          resolve(users);
        } catch (error: any) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  const handleBulkCreate = async () => {
    if (!csvFile) {
      toast.error('Selecione um arquivo CSV');
      return;
    }

    // Verify session before calling Edge Function
    if (!await ensureSession()) {
      return;
    }

    setBulkLoading(true);
    try {
      const usersData = await parseCsvFile(csvFile);
      
      if (usersData.length === 0) {
        toast.error('Nenhum usuário válido encontrado no CSV');
        setBulkLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'create', users: usersData },
      });

      if (error) throw error;

      const { success, errors } = data;
      
      if (errors.length === 0) {
        toast.success(`${success.length} usuários criados com sucesso!`);
      } else {
        toast.warning(
          `${success.length} criados, ${errors.length} com erro. Verifique os detalhes.`,
          { duration: 5000 }
        );
        console.error('Erros:', errors);
      }

      setCsvFile(null);
      setShowBulkDialog(false);
      loadUsers();
    } catch (error: any) {
      toast.error('Erro ao criar usuários: ' + error.message);
    } finally {
      setBulkLoading(false);
    }
  };

  // Helper function to verify and refresh session before Edge Function calls
  const ensureSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        toast.error('Erro ao verificar sessão. Tente novamente.');
        return false;
      }
      
      if (!session) {
        // Try to refresh
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          return false;
        }
      }
      
      return true;
    } catch (err) {
      console.error('Erro inesperado ao verificar sessão:', err);
      toast.error('Erro ao verificar sessão.');
      return false;
    }
  };

  const handleCreateSingle = async () => {
    if (!newUserEmail) {
      toast.error('Preencha o email');
      return;
    }

    // Verify session before calling Edge Function
    if (!await ensureSession()) {
      return;
    }

    setBulkLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: {
          action: 'create',
          users: [{
            email: newUserEmail,
            name: newUserName || undefined,
            plano: newUserPlano || undefined,
          }],
        },
      });

      if (error) throw error;

      const { success, errors } = data;
      
      if (errors.length === 0) {
        toast.success('Usuário criado com sucesso!');
        setNewUserEmail('');
        setNewUserName('');
        setNewUserPlano('');
        setShowCreateDialog(false);
        loadUsers();
      } else {
        toast.error(errors[0].error);
      }
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const openEditDialog = (userProfile: UserProfile) => {
    setEditingUser({
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name || '',
      phone: userProfile.phone || '',
      plano: userProfile.plano || '',
      status_pagamento: userProfile.status_pagamento || 'pending',
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    // Verify session before calling Edge Function
    if (!await ensureSession()) {
      return;
    }

    setEditLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: {
          action: 'update',
          userId: editingUser.id,
          updates: {
            name: editingUser.name || null,
            phone: editingUser.phone || null,
            plano: editingUser.plano || null,
            status_pagamento: editingUser.status_pagamento,
          },
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Usuário atualizado com sucesso!');
      setShowEditDialog(false);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteDialog = (userProfile: UserProfile) => {
    setUserToDelete(userProfile);
    setShowDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    // Verify session before calling Edge Function
    if (!await ensureSession()) {
      return;
    }

    setDeleteLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: {
          action: 'delete',
          userIdToDelete: userToDelete.id,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Usuário excluído com sucesso!');
      setShowDeleteDialog(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
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
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="usuario@exemplo.com"
                  />
                </div>
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Nome do usuário"
                  />
                </div>
                <div>
                  <Label>Plano</Label>
                  <Select value={newUserPlano} onValueChange={setNewUserPlano}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {planoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value || 'none'}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-muted p-3 rounded text-sm">
                  <strong>Senha padrão:</strong> TempPass123!
                  <br />
                  O usuário poderá redefinir a senha depois.
                </div>
                <Button onClick={handleCreateSingle} disabled={bulkLoading} className="w-full">
                  {bulkLoading ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Usuários em Massa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Arquivo CSV</Label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Formato: email,name,plano
                  </p>
                  <div className="bg-muted p-3 rounded text-xs mt-2">
                    <strong>Exemplo:</strong>
                    <br />
                    email,name,plano
                    <br />
                    usuario@exemplo.com,João Silva,Premium
                  </div>
                </div>
                <div className="bg-muted p-3 rounded text-sm">
                  <strong>Senha padrão:</strong> TempPass123!
                  <br />
                  Status: Aprovado automaticamente
                </div>
                <Button onClick={handleBulkCreate} disabled={bulkLoading || !csvFile} className="w-full">
                  {bulkLoading ? 'Processando...' : 'Importar Usuários'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={loadUsers} disabled={loading} variant="outline">
            Atualizar
          </Button>
        </div>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Usuários ({filteredUsers.length})
            {selectedUsers.size > 0 && ` - ${selectedUsers.size} selecionados`}
          </h2>
          {selectedUsers.size > 0 && (
            <Button variant="destructive" onClick={handleBulkRevoke} disabled={bulkLoading}>
              {bulkLoading ? 'Revogando...' : `Revogar ${selectedUsers.size} Selecionados`}
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
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
                  <TableCell colSpan={7} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((userProfile) => (
                  <TableRow key={userProfile.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.has(userProfile.id)}
                        onCheckedChange={() => toggleSelectUser(userProfile.id)}
                      />
                    </TableCell>
                    <TableCell>{userProfile.email}</TableCell>
                    <TableCell>{userProfile.name || '-'}</TableCell>
                    <TableCell>{userProfile.plano || '-'}</TableCell>
                    <TableCell>{getStatusBadge(userProfile.status_pagamento)}</TableCell>
                    <TableCell>
                      {userProfile.last_paid_at
                        ? format(new Date(userProfile.last_paid_at), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(userProfile)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(userProfile)}
                          className="text-destructive hover:text-destructive"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {userProfile.status_pagamento !== 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserStatus(userProfile.id, 'approved')}
                          >
                            Ativar
                          </Button>
                        )}
                        {userProfile.status_pagamento === 'approved' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateUserStatus(userProfile.id, 'revoked')}
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

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere os dados do usuário abaixo.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Email (somente leitura)</Label>
                <Input
                  value={editingUser.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label>Nome</Label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  placeholder="+55 11 99999-9999"
                />
              </div>
              <div>
                <Label>Plano</Label>
                <Select 
                  value={editingUser.plano || 'none'} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, plano: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {planoOptions.map((option) => (
                      <SelectItem key={option.value || 'none'} value={option.value || 'none'}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={editingUser.status_pagamento} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, status_pagamento: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Alterações manuais podem conflitar com webhooks de pagamento. 
                  Novos pagamentos sobrescreverão estas alterações.
                </p>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateUser} disabled={editLoading}>
                  {editLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Excluir Usuário
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Tem certeza que deseja excluir permanentemente?
              </p>
              {userToDelete && (
                <p className="font-medium text-foreground">
                  Email: {userToDelete.email}
                </p>
              )}
              <div className="bg-destructive/10 border border-destructive/30 p-3 rounded text-sm">
                <p className="font-semibold text-destructive mb-2">
                  ⚠️ Esta ação é IRREVERSÍVEL!
                </p>
                <p className="text-muted-foreground">
                  Isso irá:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-1">
                  <li>Remover acesso ao sistema</li>
                  <li>Excluir perfil do usuário</li>
                  <li>Manter histórico de webhooks (para auditoria)</li>
                  <li>Manter registros de subscriptions</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? 'Excluindo...' : 'Excluir Permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
