import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import { pipelineTasksService } from '@/services/pipelines/pipelineTasksService';

import type {
  PipelineTask,
  CreateTaskData,
  UpdateTaskData,
  PipelineTasksListParams,
} from '@/types/analytics';

interface UsePipelineTasksProps {
  pipelineId: string;
  pipelineItemId: string;
  autoLoad?: boolean;
  filters?: PipelineTasksListParams;
}

export function usePipelineTasks({
  pipelineId,
  pipelineItemId,
  autoLoad = true,
  filters,
}: UsePipelineTasksProps) {
  const { t } = useLanguage('pipelines');

  const [tasks, setTasks] = useState<PipelineTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load tasks
  const loadTasks = useCallback(async () => {
    if (!pipelineId || !pipelineItemId) return;

    setLoading(true);
    try {
      const response = await pipelineTasksService.getTasksForItem(
        pipelineId,
        pipelineItemId,
        filters,
      );
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error(t('tasks.messages.loadError'));
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [pipelineId, pipelineItemId, filters, t]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadTasks();
    }
  }, [autoLoad, loadTasks]);

  // Create task
  const createTask = useCallback(
    async (data: CreateTaskData): Promise<PipelineTask | null> => {
      if (!pipelineId || !pipelineItemId) return null;

      setCreating(true);
      try {
        const newTask = await pipelineTasksService.createTask(pipelineId, pipelineItemId, data);
        // Reload all tasks to get updated hierarchy
        await loadTasks();
        toast.success(t('tasks.messages.createSuccess'));
        return newTask;
      } catch (error) {
        console.error('Error creating task:', error);
        toast.error(t('tasks.messages.createError'));
        return null;
      } finally {
        setCreating(false);
      }
    },
    [pipelineId, pipelineItemId, t, loadTasks],
  );

  // Update task
  const updateTask = useCallback(
    async (taskId: string, data: UpdateTaskData): Promise<PipelineTask | null> => {
      if (!pipelineId) return null;

      setUpdating(true);
      try {
        const updatedTask = await pipelineTasksService.updateTask(pipelineId, taskId, data);
        // Reload all tasks to get updated hierarchy
        await loadTasks();
        toast.success(t('tasks.messages.updateSuccess'));
        return updatedTask;
      } catch (error) {
        console.error('Error updating task:', error);
        toast.error(t('tasks.messages.updateError'));
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [pipelineId, t, loadTasks],
  );

  // Delete task
  const deleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      if (!pipelineId) return false;

      setDeleting(true);
      try {
        await pipelineTasksService.deleteTask(pipelineId, taskId);
        // Reload all tasks to get updated hierarchy
        await loadTasks();
        toast.success(t('tasks.messages.deleteSuccess'));
        return true;
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error(t('tasks.messages.deleteError'));
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [pipelineId, t, loadTasks],
  );

  // Complete task
  const completeTask = useCallback(
    async (taskId: string): Promise<PipelineTask | null> => {
      if (!pipelineId) return null;

      try {
        const completedTask = await pipelineTasksService.completeTask(pipelineId, taskId);
        // Reload all tasks to get updated hierarchy and completion percentages
        await loadTasks();
        toast.success(t('tasks.messages.completeSuccess'));
        return completedTask;
      } catch (error) {
        console.error('Error completing task:', error);
        toast.error(t('tasks.messages.completeError'));
        return null;
      }
    },
    [pipelineId, t, loadTasks],
  );

  // Cancel task
  const cancelTask = useCallback(
    async (taskId: string): Promise<PipelineTask | null> => {
      if (!pipelineId) return null;

      try {
        const cancelledTask = await pipelineTasksService.cancelTask(pipelineId, taskId);
        // Reload all tasks to get updated hierarchy
        await loadTasks();
        toast.success(t('tasks.messages.cancelSuccess'));
        return cancelledTask;
      } catch (error) {
        console.error('Error cancelling task:', error);
        toast.error(t('tasks.messages.cancelError'));
        return null;
      }
    },
    [pipelineId, t, loadTasks],
  );

  // Reopen task
  const reopenTask = useCallback(
    async (taskId: string): Promise<PipelineTask | null> => {
      if (!pipelineId) return null;

      try {
        const reopenedTask = await pipelineTasksService.reopenTask(pipelineId, taskId);
        // Reload all tasks to get updated hierarchy
        await loadTasks();
        toast.success(t('tasks.messages.reopenSuccess'));
        return reopenedTask;
      } catch (error) {
        console.error('Error reopening task:', error);
        toast.error(t('tasks.messages.reopenError'));
        return null;
      }
    },
    [pipelineId, t, loadTasks],
  );

  // Get filtered tasks
  const getPendingTasks = useCallback(() => {
    return tasks.filter(task => task.status === 'pending');
  }, [tasks]);

  const getOverdueTasks = useCallback(() => {
    return tasks.filter(task => task.status === 'overdue');
  }, [tasks]);

  const getCompletedTasks = useCallback(() => {
    return tasks.filter(task => task.status === 'completed');
  }, [tasks]);

  // Move task to different parent
  const moveTask = useCallback(
    async (taskId: string, newParentId: string | null): Promise<PipelineTask | null> => {
      if (!pipelineId) return null;

      try {
        const movedTask = await pipelineTasksService.moveTask(pipelineId, taskId, {
          new_parent_id: newParentId,
        });
        // Reload all tasks to get updated hierarchy
        await loadTasks();
        toast.success(t('tasks.messages.moveSuccess'));
        return movedTask;
      } catch (error) {
        console.error('Error moving task:', error);
        toast.error(t('tasks.messages.moveError'));
        return null;
      }
    },
    [pipelineId, t, loadTasks],
  );

  return {
    tasks,
    loading,
    creating,
    updating,
    deleting,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    cancelTask,
    reopenTask,
    moveTask,
    getPendingTasks,
    getOverdueTasks,
    getCompletedTasks,
    pendingCount: getPendingTasks().length,
    overdueCount: getOverdueTasks().length,
    completedCount: getCompletedTasks().length,
  };
}
