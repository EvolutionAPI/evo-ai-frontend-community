import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Checkbox,
} from '@evoapi/design-system';
import { Edit, Eye, Key, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiKey, ApiKeyCreate, ApiKeyUpdate } from '@/types/agents';
import { createApiKey, listApiKeys, updateApiKey, deleteApiKey } from '@/services/agents';

interface ApiKeysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeysChange?: () => void;
}

const CUSTOM_OPENAI_PROVIDER = 'custom_openai_compatible';

// Providers disponíveis
const availableProviders = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'azure', label: 'Azure OpenAI' },
  { value: 'groq', label: 'Groq' },
  { value: 'mistral', label: 'Mistral AI' },
  { value: 'cohere', label: 'Cohere' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'together_ai', label: 'Together AI' },
  { value: 'fireworks_ai', label: 'Fireworks AI' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'bedrock', label: 'AWS Bedrock' },
  { value: 'vertex_ai', label: 'Google Vertex AI' },
  { value: CUSTOM_OPENAI_PROVIDER, label: 'Custom (OpenAI-compatible)' },
];

export function ApiKeysModal({ open, onOpenChange, onApiKeysChange }: ApiKeysModalProps) {
  const { t } = useLanguage('apiKeys');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<
    Partial<ApiKey & { key_value?: string; base_url?: string }>
  >({});
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getProviderLabel = (providerValue: string) => {
    return availableProviders.find(provider => provider.value === providerValue)?.label || providerValue;
  };

  const loadApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const keys = await listApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error('Erro ao carregar chaves API:', error);
      toast.error(t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (open) {
      loadApiKeys();
    }
  }, [open, loadApiKeys]);

  const handleAddClick = () => {
    setCurrentApiKey({});
    setIsAddingKey(true);
    setIsEditingKey(false);
  };

  const handleEditClick = (apiKey: ApiKey) => {
    setCurrentApiKey({ ...apiKey, key_value: '' });
    setIsAddingKey(true);
    setIsEditingKey(true);
  };

  const handleDeleteClick = (apiKey: ApiKey) => {
    setKeyToDelete(apiKey);
    setShowDeleteDialog(true);
  };

  const handleSaveApiKey = async () => {
    const isCustomProvider = currentApiKey.provider === CUSTOM_OPENAI_PROVIDER;

    if (
      !currentApiKey.name ||
      !currentApiKey.provider ||
      (isCustomProvider && !currentApiKey.base_url?.trim()) ||
      (!isCustomProvider && !isEditingKey && !currentApiKey.key_value)
    ) {
      toast.error(t('messages.requiredFields'));
      return;
    }

    try {
      setLoading(true);

      if (currentApiKey.id) {
        const updateData: ApiKeyUpdate = {
          name: currentApiKey.name,
          provider: currentApiKey.provider,
          base_url: currentApiKey.base_url,
          is_active: currentApiKey.is_active !== false,
        };

        if (currentApiKey.key_value) {
          updateData.key_value = currentApiKey.key_value;
        }

        await updateApiKey(currentApiKey.id, updateData);
        toast.success(t('messages.updateSuccess'));
      } else {
        const createData: ApiKeyCreate = {
          name: currentApiKey.name,
          provider: currentApiKey.provider,
          key_value: currentApiKey.key_value,
          base_url: currentApiKey.base_url,
        };

        await createApiKey(createData);
        toast.success(t('messages.createSuccess'));
      }

      setCurrentApiKey({});
      setIsAddingKey(false);
      setIsEditingKey(false);
      loadApiKeys();

      // Notificar o componente pai que as chaves foram alteradas
      if (onApiKeysChange) {
        onApiKeysChange();
      }
    } catch (error) {
      console.error('Erro ao salvar chave API:', error);
      toast.error(t('messages.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!keyToDelete) {
      return;
    }

    try {
      setLoading(true);
      await deleteApiKey(keyToDelete.id);
      toast.success(t('messages.deleteSuccess'));
      setKeyToDelete(null);
      setShowDeleteDialog(false);
      loadApiKeys();

      // Notificar o componente pai que as chaves foram alteradas
      if (onApiKeysChange) {
        onApiKeysChange();
      }
    } catch (error) {
      console.error('Erro ao deletar chave API:', error);
      toast.error(t('messages.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>
              {t('description')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {isAddingKey ? (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {isEditingKey ? t('form.title.edit') : t('form.title.new')}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingKey(false);
                      setIsEditingKey(false);
                      setCurrentApiKey({});
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name">{t('form.labels.name')}</Label>
                    <Input
                      id="name"
                      value={currentApiKey.name || ''}
                      onChange={e =>
                        setCurrentApiKey({
                          ...currentApiKey,
                          name: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder={t('form.placeholders.name')}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="provider">{t('form.labels.provider')}</Label>
                    <Select
                      value={currentApiKey.provider}
                      onValueChange={value =>
                        setCurrentApiKey({
                          ...currentApiKey,
                          provider: value,
                          ...(value !== CUSTOM_OPENAI_PROVIDER ? { base_url: '' } : {}),
                        })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={t('form.placeholders.provider')} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProviders.map(provider => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentApiKey.provider === CUSTOM_OPENAI_PROVIDER && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="base_url">Base URL</Label>
                      <Input
                        id="base_url"
                        value={currentApiKey.base_url || ''}
                        onChange={e =>
                          setCurrentApiKey({
                            ...currentApiKey,
                            base_url: e.target.value,
                          })
                        }
                        className="col-span-3"
                        placeholder="https://api.example.com/v1"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="key_value">
                      {t('form.labels.key')}
                      {currentApiKey.provider !== CUSTOM_OPENAI_PROVIDER && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="key_value"
                        value={currentApiKey.key_value || ''}
                        onChange={e =>
                          setCurrentApiKey({
                            ...currentApiKey,
                            key_value: e.target.value,
                          })
                        }
                        className="pr-10"
                        type={isKeyVisible ? 'text' : 'password'}
                        placeholder={
                          isEditingKey
                            ? t('form.placeholders.keyEdit')
                            : t('form.placeholders.keyNew')
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setIsKeyVisible(!isKeyVisible)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isEditingKey && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="is_active">{t('form.labels.status')}</Label>
                      <div className="col-span-3 flex items-center space-x-2">
                        <Checkbox
                          id="is_active"
                          checked={currentApiKey.is_active !== false}
                          onCheckedChange={checked =>
                            setCurrentApiKey({
                              ...currentApiKey,
                              is_active: !!checked,
                            })
                          }
                        />
                        <Label htmlFor="is_active">{t('form.labels.active')}</Label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingKey(false);
                      setIsEditingKey(false);
                      setCurrentApiKey({});
                    }}
                  >
                    {t('actions.cancel')}
                  </Button>
                  <Button onClick={handleSaveApiKey} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditingKey ? t('actions.update') : t('actions.save')}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{t('list.title')}</h3>
                  <Button onClick={handleAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('actions.add')}
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : apiKeys.length > 0 ? (
                  <div className="space-y-3">
                    {apiKeys.map(apiKey => (
                      <div
                        key={apiKey.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{apiKey.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {apiKey.base_url && (
                              <span className="text-sm text-muted-foreground">
                                {apiKey.base_url}
                              </span>
                            )}
                            <Badge variant="outline">{getProviderLabel(apiKey.provider)}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {t('list.createdAt')} {new Date(apiKey.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            {!apiKey.is_active && <Badge variant="destructive">{t('list.inactive')}</Badge>}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(apiKey)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(apiKey)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <Key className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('empty.title')}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t('empty.description')}
                    </p>
                    <Button onClick={handleAddClick}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('actions.addFirst')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('actions.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('deleteDialog.description', { name: keyToDelete?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('deleteDialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('deleteDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
