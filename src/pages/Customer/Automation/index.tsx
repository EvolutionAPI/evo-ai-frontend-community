import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@evoapi/design-system';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { automationService } from '@/services/automation/automationService';
import type { AutomationRule } from '@/types/automation';
import { AutomationsHeader, AutomationsTable, AutomationsPagination } from '@/components/automation';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';

interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

interface State {
  automations: AutomationRule[];
  selectedIds: string[];
  meta: { pagination: Pagination };
  loading: { list: boolean; delete: boolean; clone: boolean };
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const INITIAL_STATE: State = {
  automations: [],
  selectedIds: [],
  meta: {
    pagination: { page: 1, page_size: DEFAULT_PAGE_SIZE, total: 0, total_pages: 0 },
  },
  loading: { list: false, delete: false, clone: false },
  searchQuery: '',
  sortBy: 'name',
  sortOrder: 'asc',
};

export default function AutomationsListPage() {
  const { t } = useLanguage('automation');
  const navigate = useNavigate();
  const { can, isReady: permissionsReady } = useUserPermissions();

  const [state, setState] = useState<State>(INITIAL_STATE);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<AutomationRule | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const hasLoaded = useRef(false);

  const canRead = can('automation_rules', 'read');
  const canCreate = can('automation_rules', 'create');
  const canUpdate = can('automation_rules', 'update');
  const canDeleteCap = can('automation_rules', 'delete');
  const canCloneCap = can('automation_rules', 'clone');

  const loadAutomations = useCallback(async () => {
    if (!canRead) {
      toast.error(t('messages.permissionDenied.read'));
      return;
    }
    setState((prev) => ({ ...prev, loading: { ...prev.loading, list: true } }));
    try {
      const response = await automationService.getAutomations();
      const dataArray = (response as unknown as { data?: AutomationRule[] }).data ?? [];
      const meta = (response as unknown as { meta?: { pagination?: Pagination } }).meta;
      setState((prev) => ({
        ...prev,
        automations: dataArray,
        meta: {
          pagination: {
            page: meta?.pagination?.page ?? 1,
            page_size: meta?.pagination?.page_size ?? DEFAULT_PAGE_SIZE,
            total: meta?.pagination?.total ?? dataArray.length,
            total_pages: meta?.pagination?.total_pages ?? 1,
          },
        },
        loading: { ...prev.loading, list: false },
      }));
    } catch (error) {
      console.error('Error loading automations:', error);
      toast.error(t('messages.loadError'));
      setState((prev) => ({ ...prev, loading: { ...prev.loading, list: false } }));
    }
  }, [canRead, t]);

  useEffect(() => {
    if (!permissionsReady) return;
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadAutomations();
    }
  }, [permissionsReady, loadAutomations]);

  const handleCreate = () => {
    if (!canCreate) {
      toast.error(t('messages.permissionDenied.create'));
      return;
    }
    navigate('/automation/new');
  };

  const handleEdit = (rule: AutomationRule) => {
    if (!canUpdate) {
      toast.error(t('messages.permissionDenied.update'));
      return;
    }
    navigate(`/automation/${rule.id}/edit`);
  };

  const handleDelete = (rule: AutomationRule) => {
    if (!canDeleteCap) {
      toast.error(t('messages.permissionDenied.delete'));
      return;
    }
    setRuleToDelete(rule);
    setDeleteOpen(true);
  };

  const handleClone = async (rule: AutomationRule) => {
    if (!canCloneCap) {
      toast.error(t('messages.permissionDenied.clone'));
      return;
    }
    setState((prev) => ({ ...prev, loading: { ...prev.loading, clone: true } }));
    try {
      await automationService.cloneAutomation(rule.id);
      toast.success(t('messages.cloneSuccess'));
      loadAutomations();
    } catch (error) {
      console.error('Error cloning automation:', error);
      toast.error(t('messages.cloneError'));
    } finally {
      setState((prev) => ({ ...prev, loading: { ...prev.loading, clone: false } }));
    }
  };

  const confirmDelete = async () => {
    if (!ruleToDelete) return;
    setState((prev) => ({ ...prev, loading: { ...prev.loading, delete: true } }));
    try {
      await automationService.deleteAutomation(ruleToDelete.id);
      toast.success(t('messages.deleteSuccess'));
      loadAutomations();
      setDeleteOpen(false);
      setRuleToDelete(null);
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast.error(t('messages.deleteError'));
    } finally {
      setState((prev) => ({ ...prev, loading: { ...prev.loading, delete: false } }));
    }
  };

  const confirmBulkDelete = async () => {
    if (state.selectedIds.length === 0) return;
    setState((prev) => ({ ...prev, loading: { ...prev.loading, delete: true } }));
    try {
      for (const id of state.selectedIds) {
        await automationService.deleteAutomation(id);
      }
      toast.success(t('messages.bulkDeleteSuccess', { count: state.selectedIds.length }));
      setState((prev) => ({ ...prev, selectedIds: [] }));
      loadAutomations();
      setBulkDeleteOpen(false);
    } catch (error) {
      console.error('Error bulk deleting automations:', error);
      toast.error(t('messages.bulkDeleteError'));
    } finally {
      setState((prev) => ({ ...prev, loading: { ...prev.loading, delete: false } }));
    }
  };

  const filteredAutomations = state.searchQuery.trim()
    ? state.automations.filter((rule) =>
        rule.name.toLowerCase().includes(state.searchQuery.toLowerCase()),
      )
    : state.automations;

  const selected = state.automations.filter((rule) => state.selectedIds.includes(rule.id));

  return (
    <div className="h-full flex flex-col p-4">
      <AutomationsHeader
        totalCount={state.meta.pagination.total}
        selectedCount={state.selectedIds.length}
        searchValue={state.searchQuery}
        onSearchChange={(v) => setState((prev) => ({ ...prev, searchQuery: v }))}
        onNewAutomation={handleCreate}
        onBulkDelete={() => setBulkDeleteOpen(true)}
        onClearSelection={() => setState((prev) => ({ ...prev, selectedIds: [] }))}
        canCreate={canCreate}
        canDelete={canDeleteCap}
      />

      <div className="flex-1 overflow-auto mt-6">
        <AutomationsTable
          automations={filteredAutomations}
          selected={selected}
          loading={state.loading.list}
          onSelectionChange={(items) =>
            setState((prev) => ({ ...prev, selectedIds: items.map((r) => r.id) }))
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClone={handleClone}
          onCreate={handleCreate}
          canEdit={canUpdate}
          canDelete={canDeleteCap}
          canClone={canCloneCap}
        />
      </div>

      {state.meta.pagination.total > 0 && (
        <div className="mt-auto pt-4 border-t">
          <AutomationsPagination
            currentPage={state.meta.pagination.page}
            totalPages={state.meta.pagination.total_pages}
            totalCount={state.meta.pagination.total}
            perPage={state.meta.pagination.page_size}
            onPageChange={(page) =>
              setState((prev) => ({
                ...prev,
                meta: { pagination: { ...prev.meta.pagination, page } },
              }))
            }
            onPerPageChange={(perPage) =>
              setState((prev) => ({
                ...prev,
                meta: { pagination: { ...prev.meta.pagination, page_size: perPage, page: 1 } },
              }))
            }
            loading={state.loading.list}
          />
        </div>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialog.delete.title')}</DialogTitle>
            <DialogDescription>
              {t('dialog.delete.description', { name: ruleToDelete?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={state.loading.delete}
            >
              {t('dialog.delete.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={state.loading.delete}
            >
              {state.loading.delete ? t('dialog.delete.deleting') : t('dialog.delete.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialog.bulkDelete.title')}</DialogTitle>
            <DialogDescription>
              {t('dialog.bulkDelete.description', { count: state.selectedIds.length })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteOpen(false)}
              disabled={state.loading.delete}
            >
              {t('dialog.bulkDelete.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={state.loading.delete}
            >
              {state.loading.delete
                ? t('dialog.bulkDelete.deleting')
                : t('dialog.bulkDelete.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
