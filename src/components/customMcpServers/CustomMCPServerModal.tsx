import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from '@evoapi/design-system';
import { CustomMcpServer, CustomMcpServerFormData } from '@/types/ai';
import CustomMCPServerForm from './CustomMCPServerForm';

interface CustomMCPServerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server?: CustomMcpServer;
  mode?: 'create' | 'edit' | 'view';
  loading?: boolean;
  onSubmit: (data: CustomMcpServerFormData) => void;
}

export default function CustomMCPServerModal({
  open,
  onOpenChange,
  server,
  mode = 'create',
  loading = false,
  onSubmit,
}: CustomMCPServerModalProps) {
  const { t } = useLanguage('customMcpServers');

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = (data: CustomMcpServerFormData) => {
    onSubmit(data);
  };

  const getTitle = () => {
    if (mode === 'create') return t('modal.title.create');
    if (mode === 'view') return server?.name ? t('modal.title.view', { name: server.name }) : t('modal.title.viewFallback');
    return server?.name ? t('modal.title.edit', { name: server.name }) : t('modal.title.editFallback');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 py-4">
          <CustomMCPServerForm
            server={server}
            mode={mode}
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
