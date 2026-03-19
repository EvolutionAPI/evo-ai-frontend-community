import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from '@evoapi/design-system';
import { Contact, ContactFormData } from '@/types/contacts';
import ContactForm from './ContactForm';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact;
  isNew?: boolean;
  loading?: boolean;
  onSubmit: (data: ContactFormData) => void;
}

export default function ContactModal({
  open,
  onOpenChange,
  contact,
  isNew = false,
  loading = false,
  onSubmit,
}: ContactModalProps) {
  const { t } = useLanguage('contacts');

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = (data: ContactFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">
            {isNew ? t('form.title.new') : t('form.title.edit')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 py-4">
          <ContactForm
            contact={contact}
            isNew={isNew}
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
