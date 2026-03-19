import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@evoapi/design-system';
import ContactEditRules, { ContactEditConfig } from '@/pages/Customer/Agents/Agent/sections/ContactEditRules';

interface ContactEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ContactEditConfig;
  onChange: (config: ContactEditConfig) => void;
}

const ContactEditModal = ({ open, onOpenChange, config, onChange }: ContactEditModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edição de Contatos</DialogTitle>
        </DialogHeader>
        <ContactEditRules config={config} onChange={onChange} />
      </DialogContent>
    </Dialog>
  );
};

export default ContactEditModal;
