import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WebhookEvent {
  id: string;
  provider: string;
  event: string;
  order_id: string | null;
  email: string | null;
  raw_payload: any;
  status: string;
  error: string | null;
  created_at: string;
}

export default function AdminWebhooks() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [testPayload, setTestPayload] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [showPayloadDialog, setShowPayloadDialog] = useState(false);

  useEffect(() => {
    loadWebhookEvents();
  }, []);

  const loadWebhookEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar eventos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      setTestLoading(true);
      const payload = JSON.parse(testPayload);

      // Get webhook token from environment or use a default for testing
      const token = 'test-token'; // In production, get this from config

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kiwify-webhook?token=${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao processar webhook');
      }

      toast.success('Webhook processado com sucesso!');
      setTestPayload('');
      loadWebhookEvents();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setTestLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      received: 'secondary',
      processed: 'default',
      skipped: 'outline',
      failed: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    );
  };

  const viewPayload = (event: WebhookEvent) => {
    setSelectedEvent(event);
    setShowPayloadDialog(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Logs de Webhooks</h1>
        <Button onClick={loadWebhookEvents} disabled={loading}>
          Atualizar
        </Button>
      </div>

      {/* Test webhook */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Testar Webhook</h2>
        <div className="space-y-4">
          <Textarea
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            placeholder='{"event": "purchase_approved", "data": {"order_id": "123", "email": "test@example.com", "name": "Test User", "product": "Premium"}}'
            rows={6}
            className="font-mono text-sm"
          />
          <Button onClick={handleTestWebhook} disabled={testLoading || !testPayload}>
            {testLoading ? 'Processando...' : 'Processar'}
          </Button>
        </div>
      </Card>

      {/* Events table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Últimos 100 Eventos</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
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
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum evento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>{event.event}</TableCell>
                    <TableCell>{event.email || '-'}</TableCell>
                    <TableCell>{event.order_id || '-'}</TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewPayload(event)}
                      >
                        Ver Payload
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Payload dialog */}
      <Dialog open={showPayloadDialog} onOpenChange={setShowPayloadDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Webhook</DialogTitle>
            <DialogDescription>
              Evento: {selectedEvent?.event} | Status: {selectedEvent?.status}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEvent?.error && (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm font-semibold text-destructive">Erro:</p>
                <p className="text-sm mt-1">{selectedEvent.error}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold mb-2">Payload:</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(selectedEvent?.raw_payload, null, 2)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
