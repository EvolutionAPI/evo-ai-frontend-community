import React, { useState, useMemo } from 'react';
import { Input } from '@evoapi/design-system/input';
import { Card } from '@evoapi/design-system/card';
import { Search } from 'lucide-react';
import type { MessageTemplate } from '@/types/channels/inbox';

import { useLanguage } from '@/hooks/useLanguage';

interface TemplatesPickerProps {
  isWhatsAppCloud?: boolean;
  templates: MessageTemplate[];
  onSelect: (template: MessageTemplate) => void;
}

const TemplatesPicker: React.FC<TemplatesPickerProps> = ({ isWhatsAppCloud, templates, onSelect }) => {
  const { t } = useLanguage('chat');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter approved templates without unsupported formats
  const UNSUPPORTED_FORMATS = ['DOCUMENT', 'IMAGE', 'VIDEO'];
  const approvedTemplates = templates.filter((template: MessageTemplate) => {
    if (!isWhatsAppCloud) {
      return true;
    }

    const status = template?.settings?.status;
    if (!status) return false;

    if ((status as string).toLowerCase() !== 'approved') return false;
    if (template.components) {
      // Handle both object format (WhatsApp Cloud) and array format (legacy)
      const hasUnsupportedFormat = Array.isArray(template.components)
        ? template.components.some(c => c.format && UNSUPPORTED_FORMATS.includes(c.format))
        : (template.components?.header?.format && UNSUPPORTED_FORMATS.includes(template.components.header.format)) || false;
      if (hasUnsupportedFormat) return false;
    }
    return true;
  });

  // Filtrar por busca
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) {
      return approvedTemplates;
    }

    const query = searchQuery.toLowerCase();
    return approvedTemplates.filter(template =>
      template.name.toLowerCase().includes(query)
    );
  }, [approvedTemplates, searchQuery]);


  return (
    <div className="w-full">
      {/* Campo de busca */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t('messageTemplates.picker.searchPlaceholder')}
          className="pl-9 bg-muted/50 border-muted-foreground/20 focus:bg-background"
        />
      </div>

      {/* Lista de templates */}
      <Card className="max-h-[300px] overflow-y-auto border border-border">
        <div className="p-2 space-y-2">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template, index) => (
              <div key={template.id || index}>
                <button
                  onClick={() => onSelect(template)}
                  className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{template.name}</p>
                    <span className="inline-block px-2 py-1 text-xs bg-muted rounded-md">
                      {t('messageTemplates.picker.labels.language')}: {template.language}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {t('messageTemplates.picker.labels.category')}
                    </p>
                    <p className="text-xs">{template.category}</p>
                  </div>
                </button>

                {index < filteredTemplates.length - 1 && (
                  <div className="border-b border-border my-2 mx-3" />
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('messageTemplates.picker.noTemplatesFound')}{' '}
              {searchQuery && <strong>{searchQuery}</strong>}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TemplatesPicker;
