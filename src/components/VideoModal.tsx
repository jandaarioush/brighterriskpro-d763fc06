import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle } from "lucide-react";

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAccount: () => void;
  onWhatsApp: () => void;
}

export const VideoModal = ({ open, onOpenChange, onCreateAccount, onWhatsApp }: VideoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-primary" />
            Curtiu o que viu?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            Comece agora a operar com gestão de risco profissional. 7 dias de garantia total.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            size="lg" 
            className="w-full"
            onClick={onCreateAccount}
          >
            Criar Minha Conta Agora
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="w-full"
            onClick={onWhatsApp}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Falar no WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
