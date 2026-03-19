import { useState, useCallback } from 'react';
import { RolePermission } from '@/types/auth';

interface UsePermissionModalsReturn {
  // Modal states
  permissionModalOpen: boolean;
  deleteDialogOpen: boolean;
  bulkDeleteDialogOpen: boolean;
  
  // Current permission and mode
  editingPermission: RolePermission | null;
  viewMode: boolean;
  permissionToDelete: RolePermission | null;
  
  // Modal actions
  openCreateModal: () => void;
  openEditModal: (permission: RolePermission) => void;
  openViewModal: (permission: RolePermission) => void;
  closePermissionModal: () => void;
  
  // Delete actions
  openDeleteDialog: (permission: RolePermission) => void;
  closeDeleteDialog: () => void;
  openBulkDeleteDialog: () => void;
  closeBulkDeleteDialog: () => void;
  
  // Success handler
  handleModalSuccess: () => void;
}

export const usePermissionModals = (): UsePermissionModalsReturn => {
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<RolePermission | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<RolePermission | null>(null);

  const openCreateModal = useCallback(() => {
    setEditingPermission(null);
    setViewMode(false);
    setPermissionModalOpen(true);
  }, []);

  const openEditModal = useCallback((permission: RolePermission) => {
    setEditingPermission(permission);
    setViewMode(permission.role.system); // System roles are view-only
    setPermissionModalOpen(true);
  }, []);

  const openViewModal = useCallback((permission: RolePermission) => {
    setEditingPermission(permission);
    setViewMode(true);
    setPermissionModalOpen(true);
  }, []);

  const closePermissionModal = useCallback(() => {
    setPermissionModalOpen(false);
    setEditingPermission(null);
    setViewMode(false);
  }, []);

  const openDeleteDialog = useCallback((permission: RolePermission) => {
    setPermissionToDelete(permission);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setPermissionToDelete(null);
  }, []);

  const openBulkDeleteDialog = useCallback(() => {
    setBulkDeleteDialogOpen(true);
  }, []);

  const closeBulkDeleteDialog = useCallback(() => {
    setBulkDeleteDialogOpen(false);
  }, []);

  const handleModalSuccess = useCallback(() => {
    closePermissionModal();
  }, [closePermissionModal]);

  return {
    permissionModalOpen,
    deleteDialogOpen,
    bulkDeleteDialogOpen,
    editingPermission,
    viewMode,
    permissionToDelete,
    openCreateModal,
    openEditModal,
    openViewModal,
    closePermissionModal,
    openDeleteDialog,
    closeDeleteDialog,
    openBulkDeleteDialog,
    closeBulkDeleteDialog,
    handleModalSuccess,
  };
};