import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@evoapi/design-system';
import { ChevronDown, Search, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Organization {
  id: string;
  name: string;
  role?: string;
}

interface OrganizationSwitcherProps {
  organizations: Organization[];
  selectedOrganization?: Organization;
  onSwitchOrganization: (orgId: string) => void;
  className?: string;
}

export default function OrganizationSwitcher({
  organizations,
  selectedOrganization,
  onSwitchOrganization,
  className,
}: OrganizationSwitcherProps) {
  const { t } = useLanguage('layout');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOrganizations = useMemo(() =>
    organizations.filter(org =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [organizations, searchQuery]
  );

  // Focus no input quando dropdown abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Usar requestAnimationFrame para garantir que o DOM esteja pronto
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Manter foco no input durante digitação - usando timer para evitar conflitos
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, isOpen]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Limpar busca quando fechar o dropdown
      setSearchQuery('');
    }
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleOrganizationSelect = useCallback((orgId: string) => {
    onSwitchOrganization(orgId);
    setSearchQuery('');
    setIsOpen(false);
  }, [onSwitchOrganization]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'bg-background border border-sidebar-border hover:bg-sidebar-accent text-foreground transition-colors',
            'flex items-center gap-2 px-3 py-2 text-sm font-medium shadow-sm w-[280px]',
            isOpen ? 'rounded-t-lg rounded-b-none' : 'rounded-lg',
            className
          )}
        >
          <Building className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <span className="truncate">
            {selectedOrganization?.name || t('organizationSwitcher.selectOrganization')}
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground ml-auto" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        key="organization-dropdown"
        className="min-w-[280px] p-0 bg-sidebar border border-sidebar-border shadow-lg rounded-t-none rounded-b-lg"
        sideOffset={0}
      >
        <div className="flex flex-col">
          {/* Search Bar - sempre aparece quando dropdown está aberto */}
          <div className="p-3 bg-background border-b border-sidebar-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('organizationSwitcher.searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-3 py-2 text-sm bg-background border-0 rounded-lg focus:outline-none text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  // Prevenir que escape feche o dropdown se input estiver vazio
                  if (e.key === 'Escape' && searchQuery.length > 0) {
                    e.stopPropagation();
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }
                }}
              />
            </div>
          </div>

          {/* Organizations List */}
          <div className="max-h-[300px] overflow-y-auto p-1 bg-background">
            {filteredOrganizations.length === 0 ? (
              <div className="px-3 py-3 text-sm text-muted-foreground">
                {searchQuery ? t('organizationSwitcher.noResults') : t('organizationSwitcher.noOrganizations')}
              </div>
            ) : (
              filteredOrganizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleOrganizationSelect(org.id)}
                  className="flex items-start gap-3 px-3 py-3 cursor-pointer text-sm text-foreground hover:bg-sidebar-accent rounded-sm mx-1"
                >
                  <Building className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{org.name}</div>
                    {org.role && (
                      <div className="text-xs text-muted-foreground truncate">
                        {org.role === 'administrator' ? t('organizationSwitcher.roles.administrator') : t('organizationSwitcher.roles.agent')}
                      </div>
                    )}
                  </div>
                  {selectedOrganization?.id === org.id && (
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2" />
                  )}
                </DropdownMenuItem>
              ))
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
