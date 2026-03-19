import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@evoapi/design-system';
import { Globe } from 'lucide-react';
import EmptyState from '@/components/base/EmptyState';

import { webhooksService } from '@/services/integrations';
import { Webhook } from '@/types/integrations';
import type { PaginationMeta } from '@/types/core';

import WebhooksHeader from './WebhooksHeader';
import WebhooksTable from './WebhooksTable';
import WebhooksPagination from './WebhooksPagination';
import WebhookModal from './WebhookModal';

interface WebhooksState {
  webhooks: Webhook[];
  selectedWebhookIds: string[];
  meta: {
    pagination: PaginationMeta;
  };
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    bulk: boolean;
    test: boolean;
  };
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const INITIAL_STATE: WebhooksState = {
  webhooks: [],
  selectedWebhookIds: [],
  meta: {
    pagination: {
      page: 1,
      page_size: 20,
      total: 0,
      total_pages: 0,
      has_next_page: false,
      has_previous_page: false,
    },
  },
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    bulk: false,
    test: false,
  },
  searchQuery: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

interface WebhooksListParams {
  page?: number;
  per_page?: number;
  q?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface WebhooksListProps {
  onBack?: () => void;
}

export default function WebhooksList({ onBack }: WebhooksListProps = {}) {
  const { t } = useLanguage('integrations');
  const [state, setState] = useState<WebhooksState>(INITIAL_STATE);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<Webhook | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const hasLoaded = useRef(false);

  // Load webhooks
  const loadWebhooks = useCallback(async (params?: Partial<WebhooksListParams>) => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, list: true } }));

    try {
      const requestParams: WebhooksListParams = {
        page: 1,
        per_page: 20,
        sort: 'created_at',
        order: 'desc',
        ...params,
      };

      const response = await webhooksService.getWebhooks(requestParams);

      setState(prev => ({
        ...prev,
        webhooks: response.data,
        meta: {
          pagination: response.meta.pagination,
        },
        loading: { ...prev.loading, list: false },
      }));
    } catch (error) {
      console.error('Error loading webhooks:', error);
      toast.error(t('webhooks.messages.loadError'));
      setState(prev => ({ ...prev, loading: { ...prev.loading, list: false } }));
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadWebhooks();
    }
  }, [loadWebhooks]);

  // Handlers
  const handleSearchChange = (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      meta: {
        ...prev.meta,
        pagination: { ...prev.meta.pagination, page: 1 },
      },
    }));

    // Reload with new search
    loadWebhooks({ page: 1, q: query || undefined });
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        pagination: { ...prev.meta.pagination, page },
      },
    }));

    loadWebhooks({ page });
  };

  const handlePerPageChange = (perPage: number) => {
    setState(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        pagination: { ...prev.meta.pagination, page_size: perPage, page: 1 },
      },
    }));

    loadWebhooks({ page: 1, per_page: perPage });
  };

  // Webhook actions
  const handleCreateWebhook = () => {
    setEditingWebhook(null);
    setWebhookModalOpen(true);
  };

  const handleEditWebhook = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setWebhookModalOpen(true);
  };

  const handleDeleteWebhook = (webhook: Webhook) => {
    setWebhookToDelete(webhook);
    setDeleteDialogOpen(true);
  };

  const handleTestWebhook = async (webhook: Webhook) => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, test: true } }));

    try {
      await webhooksService.testWebhook(webhook.id);
      toast.success(t('webhooks.messages.testSuccess'));
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error(t('webhooks.messages.testError'));
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, test: false } }));
    }
  };

  // Bulk actions
  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  // Confirm delete single webhook
  const confirmDeleteWebhook = async () => {
    if (!webhookToDelete) return;

    setState(prev => ({ ...prev, loading: { ...prev.loading, delete: true } }));

    try {
      await webhooksService.deleteWebhook(webhookToDelete.id);
      toast.success(t('webhooks.messages.deleteSuccess'));

      // Refresh the list
      loadWebhooks();

      setDeleteDialogOpen(false);
      setWebhookToDelete(null);
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error(t('webhooks.messages.deleteError'));
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, delete: false } }));
    }
  };

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    if (state.selectedWebhookIds.length === 0) return;

    setState(prev => ({ ...prev, loading: { ...prev.loading, bulk: true } }));

    try {
      // Delete each webhook individually (no bulk endpoint available)
      await Promise.all(state.selectedWebhookIds.map(id => webhooksService.deleteWebhook(id)));
      toast.success(
        t('webhooks.messages.bulkDeleteSuccess', { count: state.selectedWebhookIds.length }),
      );

      // Clear selection and refresh
      setState(prev => ({ ...prev, selectedWebhookIds: [] }));
      loadWebhooks();

      setBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error bulk deleting webhooks:', error);
      toast.error(t('webhooks.messages.bulkDeleteError'));
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, bulk: false } }));
    }
  };

  // Handle webhook form submission
  const handleWebhookFormSubmit = async (data: Record<string, unknown>) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [editingWebhook ? 'update' : 'create']: true },
    }));

    try {
      if (editingWebhook) {
        // Update existing webhook
        await webhooksService.updateWebhook(editingWebhook.id, data as any);
        toast.success(t('webhooks.messages.updateSuccess'));
      } else {
        // Create new webhook
        await webhooksService.createWebhook(data as any);
        toast.success(t('webhooks.messages.createSuccess'));
      }

      // Refresh the entire list
      loadWebhooks();

      // Close modal and clear editing state
      setWebhookModalOpen(false);
      setEditingWebhook(null);
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast.error(
        editingWebhook ? t('webhooks.messages.updateError') : t('webhooks.messages.createError'),
      );
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, create: false, update: false },
      }));
    }
  };

  // Handle modal close
  const handleWebhookModalClose = (open: boolean) => {
    if (!open) {
      setWebhookModalOpen(false);
      setEditingWebhook(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none p-4 pb-0">
        <WebhooksHeader
          totalCount={state.meta.pagination.total}
          selectedCount={state.selectedWebhookIds.length}
          searchValue={state.searchQuery}
          onSearchChange={handleSearchChange}
          onNewWebhook={handleCreateWebhook}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setState(prev => ({ ...prev, selectedWebhookIds: [] }))}
          onBack={onBack}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 mt-6">
        {state.loading.list ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">{t('webhooks.messages.loading')}</div>
          </div>
        ) : state.webhooks.length === 0 ? (
          <EmptyState
            icon={Globe}
            title={t('webhooks.table.empty.title')}
            description={t('webhooks.table.empty.description')}
            action={{
              label: t('webhooks.header.newWebhook'),
              onClick: handleCreateWebhook,
            }}
            className="h-full"
          />
        ) : (
          <WebhooksTable
            webhooks={state.webhooks}
            selectedWebhooks={state.webhooks.filter(webhook =>
              state.selectedWebhookIds.includes(webhook.id),
            )}
            loading={state.loading.list}
            testingWebhookId={state.loading.test ? 'testing' : null}
            onSelectionChange={webhooks =>
              setState(prev => ({
                ...prev,
                selectedWebhookIds: webhooks.map(w => w.id),
              }))
            }
            onEditWebhook={handleEditWebhook}
            onDeleteWebhook={handleDeleteWebhook}
            onTestWebhook={handleTestWebhook}
            onCreateWebhook={handleCreateWebhook}
            sortBy={state.sortBy}
            sortOrder={state.sortOrder}
            onSort={column => {
              const newOrder =
                state.sortBy === column && state.sortOrder === 'asc' ? 'desc' : 'asc';
              setState(prev => ({ ...prev, sortBy: column, sortOrder: newOrder }));
              loadWebhooks({ sort: column, order: newOrder });
            }}
          />
        )}
      </div>

      {/* Fixed Pagination at Bottom */}
      {state.meta.pagination.total > 0 && (
        <div className="flex-none border-t bg-background px-4 py-2">
          <WebhooksPagination
            currentPage={state.meta.pagination.page}
            totalPages={state.meta.pagination.total_pages}
            totalCount={state.meta.pagination.total}
            perPage={state.meta.pagination.page_size}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            loading={state.loading.list}
          />
        </div>
      )}

      {/* Delete Webhook Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('webhooks.deleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('webhooks.deleteDialog.description', { url: webhookToDelete?.url })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={state.loading.delete}
            >
              {t('webhooks.deleteDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteWebhook}
              disabled={state.loading.delete}
            >
              {state.loading.delete
                ? t('webhooks.deleteDialog.deleting')
                : t('webhooks.deleteDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('webhooks.bulkDeleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('webhooks.bulkDeleteDialog.description', {
                count: state.selectedWebhookIds.length,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              disabled={state.loading.bulk}
            >
              {t('webhooks.bulkDeleteDialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete} disabled={state.loading.bulk}>
              {state.loading.bulk
                ? t('webhooks.bulkDeleteDialog.deleting')
                : t('webhooks.bulkDeleteDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Modal */}
      <WebhookModal
        open={webhookModalOpen}
        onOpenChange={handleWebhookModalClose}
        webhook={editingWebhook || undefined}
        isNew={!editingWebhook}
        loading={state.loading.create || state.loading.update}
        onSubmit={handleWebhookFormSubmit}
      />
    </div>
  );
}
