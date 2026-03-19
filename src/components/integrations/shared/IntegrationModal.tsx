import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@evoapi/design-system';
import { Integration } from '@/types/integrations';

interface IntegrationModalProps {
  integration: Integration | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  title?: string;
  children?: React.ReactNode;
}

export default function IntegrationModal({
  integration,
  open,
  onClose,
  onSave: _,
  title,
  children
}: IntegrationModalProps) {
  const modalTitle = title || (integration ? `Configurar ${integration.name}` : 'Nova Integração');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {integration && (
              <div className="w-6 h-6 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <img
                  src={`/integrations/${integration.id}.png`}
                  alt={integration.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('p-1');
                    const icon = document.createElement('div');
                    icon.innerHTML = '<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>';
                    e.currentTarget.parentElement?.appendChild(icon.firstChild as Node);
                  }}
                />
              </div>
            )}
            {modalTitle}
          </DialogTitle>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
}
