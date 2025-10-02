import { Card } from '@/components/ui/card';

export default function Simulator() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 font-montserrat">Simulador</h1>
        <Card className="p-8">
          <p className="text-muted-foreground text-center">
            Simulador em desenvolvimento...
          </p>
        </Card>
      </div>
    </div>
  );
}
