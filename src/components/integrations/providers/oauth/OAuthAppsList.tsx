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
  Card,
} from '@evoapi/design-system';
import { Key, Copy } from 'lucide-react';
import EmptyState from '@/components/base/EmptyState';

import { integrationsService } from '@/services/integrations';
import { OAuthApplication } from '@/types/integrations';
import type { PaginationMeta } from '@/types/core';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';

import OAuthAppsHeader from './OAuthAppsHeader';
import OAuthAppsTable from './OAuthAppsTable';
import OAuthAppsPagination from './OAuthAppsPagination';
import OAuthAppModal from './OAuthAppModal';

interface OAuthAppsState {
  apps: OAuthApplication[];
  selectedAppIds: string[];
  meta: {
    pagination: PaginationMeta;
  };
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    bulk: boolean;
  };
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showSecrets: Record<string, boolean>;
}

const INITIAL_STATE: OAuthAppsState = {
  apps: [],
  selectedAppIds: [],
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
  },
  searchQuery: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  showSecrets: {},
};

interface OAuthAppsListParams {
  page?: number;
  per_page?: number;
  q?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface OAuthAppsListProps {
  onBack?: () => void;
}

export default function OAuthAppsList({ onBack }: OAuthAppsListProps = {}) {
  const { t } = useLanguage('integrations');
  const [state, setState] = useState<OAuthAppsState>(INITIAL_STATE);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<OAuthApplication | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<OAuthApplication | null>(null);
  const hasLoaded = useRef(false);

  // Load OAuth apps
  const loadOAuthApps = useCallback(async (params?: Partial<OAuthAppsListParams>) => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, list: true } }));

    try {
      const response = await integrationsService.getOAuthApplications();

      // Use pagination from response if available, otherwise paginate client-side
      const allApps = response.data || [];
      const pagination = response.meta.pagination;
      // If pagination is available from API, use it directly
      if (pagination) {
        setState(prev => ({
          ...prev,
          apps: allApps,
          meta: {
            pagination: pagination,
          },
          loading: { ...prev.loading, list: false },
        }));
      } else {
        // Fallback: client-side pagination if API doesn't provide it
        const searchQuery = params?.q?.toLowerCase() || '';
        const filteredApps = searchQuery
          ? allApps.filter(
              app =>
                app.name?.toLowerCase().includes(searchQuery) ||
                app.uid?.toLowerCase().includes(searchQuery) ||
                app.scopes?.join(' ').toLowerCase().includes(searchQuery),
            )
          : allApps;

        const currentPage = params?.page || 1;
        const perPage = params?.per_page || DEFAULT_PAGE_SIZE;
        const totalCount = filteredApps.length;
        const totalPages = Math.ceil(totalCount / perPage);
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedApps = filteredApps.slice(startIndex, endIndex);

        setState(prev => ({
          ...prev,
          apps: paginatedApps,
          meta: {
            pagination: {
              page: currentPage,
              page_size: perPage,
              total: totalCount,
              total_pages: totalPages,
              has_next_page: currentPage < totalPages,
              has_previous_page: currentPage > 1,
            },
          },
          loading: { ...prev.loading, list: false },
        }));
      }
    } catch (error) {
      console.error('Error loading OAuth apps:', error);
      toast.error(t('oauth.messages.deleteError'));
      setState(prev => ({ ...prev, loading: { ...prev.loading, list: false } }));
    }
  }, [t]);

  // Initial load
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadOAuthApps();
    }
  }, [loadOAuthApps]);

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
    loadOAuthApps({ page: 1, q: query || undefined });
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        pagination: { ...prev.meta.pagination, page },
      },
    }));

    loadOAuthApps({ page, q: state.searchQuery || undefined });
  };

  const handlePerPageChange = (perPage: number) => {
    setState(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        pagination: { ...prev.meta.pagination, page_size: perPage, page: 1 },
      },
    }));

    loadOAuthApps({ page: 1, per_page: perPage, q: state.searchQuery || undefined });
  };

  // OAuth app actions
  const handleCreateApp = () => {
    setEditingApp(null);
    setAppModalOpen(true);
  };

  const handleEditApp = (app: OAuthApplication) => {
    setEditingApp(app);
    setAppModalOpen(true);
  };

  const handleDeleteApp = (app: OAuthApplication) => {
    setAppToDelete(app);
    setDeleteDialogOpen(true);
  };

  const handleToggleSecret = (appId: string) => {
    setState(prev => ({
      ...prev,
      showSecrets: {
        ...prev.showSecrets,
        [appId]: !prev.showSecrets[appId],
      },
    }));
  };

  // Bulk actions
  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  // Confirm delete single app
  const confirmDeleteApp = async () => {
    if (!appToDelete) return;

    setState(prev => ({ ...prev, loading: { ...prev.loading, delete: true } }));

    try {
      await integrationsService.deleteOAuthApplication(appToDelete.uid);
      toast.success(t('oauth.messages.deleteSuccess'));

      // Refresh the list
      loadOAuthApps({
        page: state.meta.pagination.page,
        q: state.searchQuery || undefined,
      });

      setDeleteDialogOpen(false);
      setAppToDelete(null);
    } catch (error) {
      console.error('Error deleting OAuth app:', error);
      toast.error(t('oauth.messages.deleteError'));
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, delete: false } }));
    }
  };

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    if (state.selectedAppIds.length === 0) return;

    setState(prev => ({ ...prev, loading: { ...prev.loading, bulk: true } }));

    try {
      // Delete each app individually (no bulk endpoint available)
      await Promise.all(
        state.selectedAppIds.map(id => integrationsService.deleteOAuthApplication(id)),
      );
      toast.success(t('oauth.messages.bulkDeleteSuccess', { count: state.selectedAppIds.length }));

      // Clear selection and refresh
      setState(prev => ({ ...prev, selectedAppIds: [] }));
      loadOAuthApps({
        page: state.meta.pagination.page,
        q: state.searchQuery || undefined,
      });

      setBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error bulk deleting OAuth apps:', error);
      toast.error(t('oauth.messages.bulkDeleteError'));
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, bulk: false } }));
    }
  };

  // Handle app form submission
  const handleAppFormSubmit = async (data: any) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [editingApp ? 'update' : 'create']: true },
    }));

    try {
      if (editingApp) {
        // Update existing app
        await integrationsService.updateOAuthApplication(editingApp.uid, data);
        toast.success(t('oauth.messages.updateSuccess'));
      } else {
        // Create new app
        await integrationsService.createOAuthApplication(data);
        toast.success(t('oauth.messages.createSuccess'));
      }

      // Refresh the entire list
      loadOAuthApps({
        page: state.meta.pagination.page,
        q: state.searchQuery || undefined,
      });

      // Close modal and clear editing state
      setAppModalOpen(false);
      setEditingApp(null);
    } catch (error) {
      console.error('Error saving OAuth app:', error);
      toast.error(editingApp ? t('oauth.messages.updateError') : t('oauth.messages.createError'));
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, create: false, update: false },
      }));
    }
  };

  // Handle modal close
  const handleAppModalClose = (open: boolean) => {
    if (!open) {
      setAppModalOpen(false);
      setEditingApp(null);
    }
  };

  const handleCopyToClipboard = (text: string, isSecret: boolean) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(
        isSecret ? t('oauth.messages.clientSecretCopied') : t('oauth.messages.clientIdCopied'),
      );
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none p-4 pb-0">
        <OAuthAppsHeader
          totalCount={state.meta.pagination.total}
          selectedCount={state.selectedAppIds.length}
          searchValue={state.searchQuery}
          onSearchChange={handleSearchChange}
          onNewApp={handleCreateApp}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setState(prev => ({ ...prev, selectedAppIds: [] }))}
          onBack={onBack}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 mt-6">
        {state.loading.list ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">{t('oauth.messages.loading')}</div>
          </div>
        ) : state.apps.length === 0 ? (
          <EmptyState
            icon={Key}
            title={t('oauth.table.empty.title')}
            description={t('oauth.table.empty.description')}
            action={{
              label: t('oauth.header.newApp'),
              onClick: handleCreateApp,
            }}
            className="h-full"
          />
        ) : (
          <div className="space-y-6">
            <OAuthAppsTable
              apps={state.apps}
              selectedApps={state.apps.filter(app => state.selectedAppIds.includes(app.uid))}
              loading={state.loading.list}
              onSelectionChange={apps =>
                setState(prev => ({
                  ...prev,
                  selectedAppIds: apps.map(a => a.uid),
                }))
              }
              onEditApp={handleEditApp}
              onDeleteApp={handleDeleteApp}
              onCreateApp={handleCreateApp}
              sortBy={state.sortBy}
              sortOrder={state.sortOrder}
              onSort={column => {
                const newOrder =
                  state.sortBy === column && state.sortOrder === 'asc' ? 'desc' : 'asc';
                setState(prev => ({ ...prev, sortBy: column, sortOrder: newOrder }));
                loadOAuthApps({
                  sort: column,
                  order: newOrder,
                  q: state.searchQuery || undefined,
                });
              }}
              showSecrets={state.showSecrets}
              onToggleSecret={handleToggleSecret}
            />

            {/* Credentials Display */}
            {state.apps.length > 0 &&
              Object.keys(state.showSecrets).some(id => state.showSecrets[id]) && (
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">{t('oauth.credentials.title')}</h4>
                  <div className="space-y-4">
                    {state.apps
                      .filter(app => state.showSecrets[app.uid])
                      .map(app => (
                        <Card key={app.uid} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium">{app.name}</h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleSecret(app.uid)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-slate-500">
                                {t('oauth.credentials.clientId')}
                              </label>
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex-1 min-w-0 truncate">
                                  {app.uid}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-7 w-7"
                                  onClick={() => handleCopyToClipboard(app.uid, false)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            {app.secret && (
                              <div>
                                <label className="text-xs text-slate-500">
                                  {t('oauth.credentials.clientSecret')}
                                </label>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex-1 min-w-0 truncate">
                                    {app.secret}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-7 w-7"
                                    onClick={() => handleCopyToClipboard(app.secret!, true)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                  </div>
                </Card>
              )}
          </div>
        )}
      </div>

      {/* Fixed Pagination at Bottom */}
      {state.meta.pagination.total > 0 && (
        <div className="flex-none border-t bg-background px-4 py-2">
          <OAuthAppsPagination
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

      {/* Delete App Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('oauth.deleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('oauth.deleteDialog.description', { name: appToDelete?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={state.loading.delete}
            >
              {t('oauth.deleteDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteApp}
              disabled={state.loading.delete}
            >
              {state.loading.delete
                ? t('oauth.deleteDialog.deleting')
                : t('oauth.deleteDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('oauth.bulkDeleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('oauth.bulkDeleteDialog.description', { count: state.selectedAppIds.length })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              disabled={state.loading.bulk}
            >
              {t('oauth.bulkDeleteDialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete} disabled={state.loading.bulk}>
              {state.loading.bulk
                ? t('oauth.bulkDeleteDialog.deleting')
                : t('oauth.bulkDeleteDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OAuth App Modal */}
      <OAuthAppModal
        app={editingApp || undefined}
        open={appModalOpen}
        onOpenChange={handleAppModalClose}
        onSubmit={handleAppFormSubmit}
        isNew={!editingApp}
        loading={state.loading.create || state.loading.update}
      />
    </div>
  );
}
