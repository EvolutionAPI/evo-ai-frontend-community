import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label as UILabel,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@evoapi/design-system';
import { Search } from 'lucide-react';
import type { AccessToken, AccessTokenFormData } from '@/types/auth';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  formatScopesForAPI, 
  generateNameSuggestion, 
  parseScopesFromAPI
} from '@/services/auth/accessTokensService';
import { permissionsService } from '@/services/permissions';

interface AccessTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token?: AccessToken;
  isNew: boolean;
  loading: boolean;
  onSubmit: (data: AccessTokenFormData) => void;
}

export default function AccessTokenModal({
  open,
  onOpenChange,
  token,
  isNew,
  loading,
  onSubmit,
}: AccessTokenModalProps) {
  const { can } = useUserPermissions();
  const { t } = useTranslation('accessTokens');
  const [formData, setFormData] = useState<AccessTokenFormData>({
    name: '',
    scopes: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [loadingScopes, setLoadingScopes] = useState(false);
  const [scopesError, setScopesError] = useState<string>('');
  const [scopeSearch, setScopeSearch] = useState('');
  const [categorizedPermissions, setCategorizedPermissions] = useState<Record<string, {
    name: string;
    description: string;
    permissions: Array<{
      key: string;
      name: string;
      description: string;
      action: string;
    }>;
  }>>({});

  // Load available resource actions
  const loadResourceActions = async () => {
    setLoadingScopes(true);
    setScopesError('');
    
    try {
      const resourceActionsResponse = await permissionsService.getResourceActions();
      const permissionsWithDetails = await permissionsService.getPermissionsWithDetails();

      // Categorize permissions by resource
      const categorized: Record<string, {
        name: string;
        description: string;
        permissions: Array<{
          key: string;
          name: string;
          description: string;
          action: string;
        }>;
      }> = {};
      
      Object.entries(resourceActionsResponse.data.resources).forEach(([resourceKey, resource]) => {
        categorized[resourceKey] = {
          name: resource.name,
          description: resource.description,
          permissions: permissionsWithDetails
            .filter(p => p.resource === resourceKey)
            .map(p => ({
              key: p.key,
              name: p.action_name,
              description: p.description,
              action: p.action
            }))
        };
      });
      
      setCategorizedPermissions(categorized);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setScopesError(t('permissions.loadError'));
      setCategorizedPermissions({});
    } finally {
      setLoadingScopes(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadResourceActions();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (token && !isNew) {
        setFormData({
          name: token.name,
          scopes: token.scopes,
        });
        setSelectedScopes(parseScopesFromAPI(token.scopes));
      } else {
        setFormData({
          name: generateNameSuggestion(),
          scopes: '',
        });
        setSelectedScopes([]);
      }
      setErrors({});
      setScopeSearch('');
    }
  }, [open, token, isNew]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('messages.validation.nameRequired');
    } else if (formData.name.length < 2) {
      newErrors.name = t('messages.validation.nameMinLength');
    }

    if (selectedScopes.length === 0) {
      newErrors.scopes = t('messages.validation.scopesRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const requiredPermission = isNew ? 'create' : 'update';
    if (!can('access_tokens', requiredPermission)) {
      return;
    }

    const submitData: AccessTokenFormData = {
      ...formData,
      scopes: formatScopesForAPI(selectedScopes),
    };

    onSubmit(submitData);
  };



  const handleScopeToggle = (scope: string, checked: boolean) => {
    if (checked) {
      setSelectedScopes(prev => [...prev, scope]);
    } else {
      setSelectedScopes(prev => prev.filter(s => s !== scope));
    }
  };

  const selectAllScopes = () => {
    const allPermissionKeys = Object.values(categorizedPermissions)
      .flatMap(category => category.permissions.map(p => p.key));
    setSelectedScopes(allPermissionKeys);
  };

  const deselectAllScopes = () => {
    setSelectedScopes([]);
  };

  const toggleResourceActions = (resource: string) => {
    const category = categorizedPermissions[resource];
    if (!category) return;

    const categoryPermissionKeys = category.permissions.map(p => p.key);
    const allSelected = categoryPermissionKeys.every(key => selectedScopes.includes(key));

    if (allSelected) {
      // Deselect all from this category
      setSelectedScopes(prev => prev.filter(key => !categoryPermissionKeys.includes(key)));
    } else {
      // Select all from this category
      setSelectedScopes(prev => {
        const newSelected = new Set(prev);
        categoryPermissionKeys.forEach(key => newSelected.add(key));
        return Array.from(newSelected);
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isNew ? t('form.title.new') : t('form.title.edit')}
          </DialogTitle>
          <DialogDescription>
            {isNew
              ? t('description')
              : t('form.title.edit')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <UILabel htmlFor="name">{t('form.labels.name')}</UILabel>
              <Input
                id="name"
                placeholder={t('form.placeholders.name')}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {t('form.descriptions.name')}
              </p>
            </div>

            {/* Scopes */}
            <div className="space-y-3">
              <UILabel>{t('form.labels.scopes')}</UILabel>
              <p className="text-sm text-muted-foreground">
                {t('form.descriptions.scopes')}
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('form.placeholders.searchPermissions')}
                  value={scopeSearch}
                  onChange={(e) => setScopeSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Global actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="select-all-resources"
                    checked={selectedScopes.length > 0 && selectedScopes.length === Object.values(categorizedPermissions).flatMap(c => c.permissions).length}
                    ref={ref => {
                      if (ref) {
                        ref.indeterminate = selectedScopes.length > 0 && selectedScopes.length < Object.values(categorizedPermissions).flatMap(c => c.permissions).length;
                      }
                    }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAllScopes();
                      } else {
                        deselectAllScopes();
                      }
                    }}
                    disabled={loadingScopes}
                    className="w-4 h-4 text-primary bg-background border-2 rounded focus:ring-primary"
                  />
                  <UILabel htmlFor="select-all-resources" className="text-sm font-medium">
                    {t('form.labels.selectAll')}
                  </UILabel>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {t('form.labels.selectedCount', { count: selectedScopes.length })}
                </span>
              </div>

              {/* Accordion with permissions */}
              {loadingScopes ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t('permissions.loadingPermissions')}</p>
                </div>
              ) : scopesError ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-destructive mb-2">{scopesError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadResourceActions()}
                  >
                    {t('permissions.retryLoad')}
                  </Button>
                </div>
              ) : Object.keys(categorizedPermissions).length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t('permissions.noPermissionsAvailable')}</p>
                </div>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {Object.entries(categorizedPermissions)
                    .filter(([resource, category]) => {
                      if (!scopeSearch) return true;
                      const searchLower = scopeSearch.toLowerCase();
                      return (
                        resource.toLowerCase().includes(searchLower) ||
                        category.name.toLowerCase().includes(searchLower) ||
                        category.description.toLowerCase().includes(searchLower) ||
                        category.permissions.some(p => 
                          p.name.toLowerCase().includes(searchLower) ||
                          p.key.toLowerCase().includes(searchLower) ||
                          p.description.toLowerCase().includes(searchLower)
                        )
                      );
                    })
                    .map(([resource, category]) => {
                      const selectedActionsForResource = selectedScopes.filter(scope => 
                        scope.startsWith(`${resource}.`)
                      );
                      const allResourceActionsSelected = selectedActionsForResource.length === category.permissions.length;
                      const someResourceActionsSelected = selectedActionsForResource.length > 0 && !allResourceActionsSelected;

                      return (
                        <AccordionItem key={resource} value={resource} className="border-b-0">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  id={`select-resource-${resource}`}
                                  checked={allResourceActionsSelected}
                                  ref={ref => {
                                    if (ref) {
                                      ref.indeterminate = someResourceActionsSelected;
                                    }
                                  }}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleResourceActions(resource);
                                  }}
                                  disabled={loadingScopes}
                                  className="w-4 h-4 text-primary bg-background border-2 rounded focus:ring-primary"
                                />
                                <span className="font-medium text-left">{category.name}</span>
                              </div>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {selectedActionsForResource.length}/{category.permissions.length}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3">
                            <div className="space-y-2">
                              {category.permissions
                                .filter(permission => {
                                  if (!scopeSearch) return true;
                                  const searchLower = scopeSearch.toLowerCase();
                                  return (
                                    permission.name.toLowerCase().includes(searchLower) ||
                                    permission.key.toLowerCase().includes(searchLower) ||
                                    permission.description.toLowerCase().includes(searchLower)
                                  );
                                })
                                .map((permission) => {
                                  const fullActionKey = permission.key;
                                  return (
                                    <div key={permission.key} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={fullActionKey}
                                        checked={selectedScopes.includes(fullActionKey)}
                                        onChange={(e) => handleScopeToggle(fullActionKey, e.target.checked)}
                                        disabled={loadingScopes}
                                        className="w-4 h-4 text-primary bg-background border-2 rounded focus:ring-primary"
                                      />
                                      <UILabel 
                                        htmlFor={fullActionKey} 
                                        className="text-sm font-normal cursor-pointer flex-1"
                                      >
                                        <div className="flex flex-col">
                                          <span>{permission.name}</span>
                                          {permission.description && (
                                            <span className="text-xs text-muted-foreground">
                                              {permission.description}
                                            </span>
                                          )}
                                        </div>
                                      </UILabel>
                                    </div>
                                  );
                                })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                </Accordion>
              )}
              
              {errors.scopes && (
                <p className="text-sm text-destructive">{errors.scopes}</p>
              )}
            </div>
          </form>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? t('actions.save') + '...' : isNew ? t('actions.create') : t('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
