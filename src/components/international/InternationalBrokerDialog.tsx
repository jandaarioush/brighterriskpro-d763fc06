import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';

export type InternationalBrokerType = 'ninjatrader' | 'interactive_brokers' | 'tradestation' | 'outra';

interface InternationalBrokerDialogProps {
  open: boolean;
  onSelect: (broker: InternationalBrokerType) => void;
}

const brokerOptions: { value: InternationalBrokerType; label: string; description: string }[] = [
  {
    value: 'ninjatrader',
    label: 'NinjaTrader',
    description: 'Margens intradiárias a partir de $50 para Micros',
  },
  {
    value: 'interactive_brokers',
    label: 'Interactive Brokers',
    description: 'Corretora global com múltiplos mercados',
  },
  {
    value: 'tradestation',
    label: 'TradeStation',
    description: 'Plataforma americana tradicional',
  },
  {
    value: 'outra',
    label: 'Outra',
    description: 'Configuração manual de margens',
  },
];

export function InternationalBrokerDialog({ open, onSelect }: InternationalBrokerDialogProps) {
  const [selectedBroker, setSelectedBroker] = useState<InternationalBrokerType | null>(null);

  const handleConfirm = () => {
    if (selectedBroker) {
      onSelect(selectedBroker);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Qual corretora você utiliza?
          </DialogTitle>
          <DialogDescription>
            Selecione sua corretora para configurar a calculadora de posição com os parâmetros corretos de margem.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedBroker || ''}
            onValueChange={(value) => setSelectedBroker(value as InternationalBrokerType)}
            className="space-y-3"
          >
            {brokerOptions.map((broker) => (
              <div
                key={broker.value}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedBroker === broker.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedBroker(broker.value)}
              >
                <RadioGroupItem value={broker.value} id={broker.value} className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor={broker.value} className="font-medium cursor-pointer">
                    {broker.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{broker.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleConfirm}
            disabled={!selectedBroker}
            className="min-w-[120px]"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
