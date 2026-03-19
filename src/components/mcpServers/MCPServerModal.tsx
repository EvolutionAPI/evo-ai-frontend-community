import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from '@evoapi/design-system';
import { MCPServer, MCPServerFormData } from '@/types/ai';
import MCPServerForm from './MCPServerForm';

interface MCPServerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server?: MCPServer;
  mode?: 'create' | 'edit' | 'view';
  loading?: boolean;
  onSubmit: (data: MCPServerFormData) => void;
  onChange: (data: MCPServerFormData) => void;
}

export default function MCPServerModal({
  open,
  onOpenChange,
  server,
  mode = 'create',
  loading = false,
  onSubmit,
  onChange,
}: MCPServerModalProps) {
  const { t } = useLanguage('mcpServers');

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = (data: MCPServerFormData) => {
    onSubmit(data);
  };

  const handleServerFormChange = (data: MCPServerFormData) => {
    onChange(data);
  };

  const getModalTitle = () => {
    if (mode === 'create') {
      return t('modal.title.create');
    } else if (mode === 'view') {
      return t('modal.title.view', { name: server?.name || 'Servidor MCP' });
    } else {
      return t('modal.title.edit', { name: server?.name || 'Servidor MCP' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 py-4">
          <MCPServerForm
            server={server as MCPServer}
            mode={mode}
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onChange={handleServerFormChange}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
