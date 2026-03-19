import { useState, useEffect } from 'react';
import { Input, Label, Badge, Checkbox } from '@evoapi/design-system';
import { Building2, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { contactsService } from '@/services/contacts';

interface CompanyMultiSelectProps {
  selectedCompanyIds: string[];
  onChange: (companyIds: string[]) => void;
  disabled?: boolean;
}

export default function CompanyMultiSelect({
  selectedCompanyIds,
  onChange,
  disabled = false,
}: CompanyMultiSelectProps) {
  const { t } = useLanguage('contacts');
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar todas as empresas uma única vez
  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      try {
        const response = await contactsService.getCompaniesList();
        setCompanies(response);
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  // Filtrar empresas em memória com base no termo de busca
  const filteredCompanies = (companies || []).filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pegar empresas selecionadas para mostrar badges
  const selectedCompanies = (companies || []).filter(c => selectedCompanyIds.includes(c.id));

  // Toggle selection
  const handleToggle = (companyId: string) => {
    const newIds = selectedCompanyIds.includes(companyId)
      ? selectedCompanyIds.filter(id => id !== companyId)
      : [...selectedCompanyIds, companyId];

    onChange(newIds);
  };

  return (
    <div className="space-y-3">
      <Label>{t('form.fields.companies.label')}</Label>

      {/* Selected Companies Badges */}
      {selectedCompanies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCompanies.map(company => (
            <Badge key={company.id} variant="secondary" className="gap-2">
              <Building2 className="h-3 w-3" />
              {company.name}
              <button
                type="button"
                onClick={() => handleToggle(company.id)}
                disabled={disabled}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <Input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder={t('form.fields.companies.searchPlaceholder')}
        disabled={disabled}
      />

      {/* Companies List */}
      <div className="border rounded-lg max-h-48 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            {searchTerm
              ? t('form.fields.companies.noResults')
              : t('form.fields.companies.noCompanies')}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredCompanies.map(company => (
              <label
                key={company.id}
                className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer"
              >
                <Checkbox
                  checked={selectedCompanyIds.includes(company.id)}
                  onCheckedChange={() => handleToggle(company.id)}
                  disabled={disabled}
                />
                <span className="flex-1 text-sm">{company.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
