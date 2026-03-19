import api from '@/services/core/api';
import { extractData, extractResponse } from '@/utils/apiHelpers';

import type {
  PipelineTask,
  CreateTaskData,
  UpdateTaskData,
  PipelineTasksListParams,
  PipelineTasksResponse,
  PipelineTaskStatistics,
  MoveTaskData,
} from '@/types/analytics';

class PipelineTasksService {
  // Get tasks for a pipeline item
  async getTasksForItem(
    pipelineId: string,
    pipelineItemId: string,
    params?: PipelineTasksListParams,
  ): Promise<PipelineTasksResponse> {
    const response = await api.get(
      `/pipelines/${pipelineId}/pipeline_items/${pipelineItemId}/tasks`,
      { params },
    );

    return extractResponse<PipelineTask>(response) as PipelineTasksResponse;
  }

  // Get a specific task
  async getPipelineTaskById(pipelineId: string, taskId: string): Promise<PipelineTask> {
    const response = await api.get(`/pipelines/${pipelineId}/pipeline_tasks/${taskId}`);

    return extractData<PipelineTask>(response);
  }

  // Create a task for a pipeline item
  async createTask(
    pipelineId: string,
    pipelineItemId: string,
    data: CreateTaskData,
  ): Promise<PipelineTask> {
    const response = await api.post(
      `/pipelines/${pipelineId}/pipeline_items/${pipelineItemId}/tasks`,
      { task: data },
    );

    return extractData<PipelineTask>(response);
  }

  // Update a task
  async updateTask(
    pipelineId: string,
    taskId: string,
    data: UpdateTaskData,
  ): Promise<PipelineTask> {
    const response = await api.patch(`/pipelines/${pipelineId}/pipeline_tasks/${taskId}`, {
      task: data,
    });

    return extractData<PipelineTask>(response);
  }

  // Mark task as completed
  async completeTask(pipelineId: string, taskId: string): Promise<PipelineTask> {
    const response = await api.post(`/pipelines/${pipelineId}/pipeline_tasks/${taskId}/complete`);

    return extractData<PipelineTask>(response);
  }

  // Cancel a task
  async cancelTask(pipelineId: string, taskId: string): Promise<PipelineTask> {
    const response = await api.post(`/pipelines/${pipelineId}/pipeline_tasks/${taskId}/cancel`);

    return extractData<PipelineTask>(response);
  }

  // Reopen a task
  async reopenTask(pipelineId: string, taskId: string): Promise<PipelineTask> {
    const response = await api.post(`/pipelines/${pipelineId}/pipeline_tasks/${taskId}/reopen`);

    return extractData<PipelineTask>(response);
  }

  // Get task statistics
  async getStatistics(
    pipelineId: string,
    params?: PipelineTasksListParams,
  ): Promise<PipelineTaskStatistics> {
    const response = await api.get(`/pipelines/${pipelineId}/pipeline_tasks/statistics`, {
      params,
    });

    return extractData<PipelineTaskStatistics>(response);
  }

  // Add subtask to a parent task
  async addSubtask(
    pipelineId: string,
    parentTaskId: string,
    data: CreateTaskData,
  ): Promise<PipelineTask> {
    const response = await api.post(
      `/pipelines/${pipelineId}/pipeline_tasks/${parentTaskId}/add_subtask`,
      { task: data },
    );

    return extractData<PipelineTask>(response);
  }

  // Move task to different parent or position
  async moveTask(pipelineId: string, taskId: string, data: MoveTaskData): Promise<PipelineTask> {
    const response = await api.patch(
      `/pipelines/${pipelineId}/pipeline_tasks/${taskId}/move`,
      data,
    );

    return extractData<PipelineTask>(response);
  }

  // Reorder task within same parent
  async reorderTask(pipelineId: string, taskId: string, position: number): Promise<PipelineTask> {
    const response = await api.patch(`/pipelines/${pipelineId}/pipeline_tasks/${taskId}/reorder`, {
      position,
    });

    return extractData<PipelineTask>(response);
  }

  // Delete task with option to delete subtasks
  async deleteTaskWithSubtasks(
    pipelineId: string,
    taskId: string,
    deleteSubtasks: boolean = true,
  ): Promise<any> {
    const response = await api.delete(`/pipelines/${pipelineId}/pipeline_tasks/${taskId}`, {
      params: { delete_subtasks: deleteSubtasks },
    });

    return extractData<any>(response);
  }

  // Override default deleteTask to always delete subtasks
  async deleteTask(pipelineId: string, taskId: string): Promise<any> {
    const response = await this.deleteTaskWithSubtasks(pipelineId, taskId, true);
    return extractData<any>(response);
  }

  // Build task tree from flat array
  buildTaskTree(tasks: PipelineTask[]): PipelineTask[] {
    const taskMap = new Map<string, PipelineTask>();
    const rootTasks: PipelineTask[] = [];

    // First pass: create map
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, subtasks: [] });
    });

    // Second pass: build tree
    tasks.forEach(task => {
      const taskWithSubtasks = taskMap.get(task.id)!;

      if (task.parent_task_id) {
        const parent = taskMap.get(task.parent_task_id);
        if (parent) {
          parent.subtasks = parent.subtasks || [];
          parent.subtasks.push(taskWithSubtasks);
        }
      } else {
        rootTasks.push(taskWithSubtasks);
      }
    });

    return rootTasks;
  }

  // Flatten task tree
  flattenTaskTree(tasks: PipelineTask[]): PipelineTask[] {
    const result: PipelineTask[] = [];

    const flatten = (task: PipelineTask) => {
      result.push(task);
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(flatten);
      }
    };

    tasks.forEach(flatten);

    return result;
  }

  // Helper: Check if task is overdue
  isOverdue(task: PipelineTask): boolean {
    if (!task.due_date || task.status !== 'pending') return false;
    return new Date(task.due_date) < new Date();
  }

  // Helper: Check if task is due soon (within 1 hour)
  isDueSoon(task: PipelineTask): boolean {
    if (!task.due_date || task.status !== 'pending') return false;
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return dueDate <= oneHourFromNow && dueDate > now;
  }

  // Helper: Get days until due
  getDaysUntilDue(task: PipelineTask): number | null {
    if (!task.due_date) return null;
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Helper: Get hours until due
  getHoursUntilDue(task: PipelineTask): number | null {
    if (!task.due_date) return null;
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.round((diffTime / (1000 * 60 * 60)) * 10) / 10;
  }
}

export const pipelineTasksService = new PipelineTasksService();
