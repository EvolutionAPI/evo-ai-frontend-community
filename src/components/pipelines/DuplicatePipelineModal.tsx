import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
} from '@evoapi/design-system';
import { Pipeline } from '@/types/analytics';

interface DuplicatePipelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline: Pipeline;
  onSubmit: (data: { name: string; description?: string }) => void;
  loading: boolean;
}

export default function DuplicatePipelineModal({
  open,
  onOpenChange,
  pipeline,
  onSubmit,
  loading,
}: DuplicatePipelineModalProps) {
  const { t } = useLanguage('pipelines');
  const [formData, setFormData] = useState({
    name: `${pipeline.name} ${t('duplicatePipeline.copySuffix')}`,
    description: pipeline.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      setFormData({
        name: `${pipeline.name} ${t('duplicatePipeline.copySuffix')}`,
        description: pipeline.description || '',
      });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('duplicatePipeline.title')}</DialogTitle>
            <DialogDescription>
              {t('duplicatePipeline.description', { name: pipeline.name })}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="duplicate-name">{t('duplicatePipeline.name')}</Label>
              <Input
                id="duplicate-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('duplicatePipeline.namePlaceholder')}
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="duplicate-description">{t('duplicatePipeline.descriptionLabel')}</Label>
              <Textarea
                id="duplicate-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('duplicatePipeline.descriptionPlaceholder')}
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Info about what will be copied */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-1">ℹ️ {t('duplicatePipeline.whatWillBeCopied')}</div>
                <div className="space-y-1 text-xs">
                  <div>• {t('duplicatePipeline.copied.settings')}</div>
                  <div>• {t('duplicatePipeline.copied.stages')}</div>
                  <div>• {t('duplicatePipeline.copied.structure')}</div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3">
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <div className="font-medium mb-1">⚠️ {t('duplicatePipeline.noteLabel')}</div>
                <div className="text-xs">
                  {t('duplicatePipeline.noteMessage')}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={loading}
            >
              {t('duplicatePipeline.cancel')}
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? t('duplicatePipeline.duplicating') : t('duplicatePipeline.duplicate')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}