import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from '@evoapi/design-system';
import { CustomTool, CustomToolFormData } from '@/types/ai';
import CustomToolForm from './CustomToolForm';

interface CustomToolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool?: CustomTool;
  mode?: 'create' | 'edit' | 'view';
  loading?: boolean;
  onSubmit: (data: CustomToolFormData) => void;
}

export default function CustomToolModal({
  open,
  onOpenChange,
  tool,
  mode = 'create',
  loading = false,
  onSubmit,
}: CustomToolModalProps) {
  const { t } = useLanguage('customTools');

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = (data: CustomToolFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">
            {mode === 'create'
              ? t('modal.title.create')
              : mode === 'view'
                ? (tool?.name ? t('modal.title.view', { name: tool.name }) : t('modal.title.viewFallback'))
                : (tool?.name ? t('modal.title.edit', { name: tool.name }) : t('modal.title.editFallback'))}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 py-4">
          <CustomToolForm
            tool={tool}
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
