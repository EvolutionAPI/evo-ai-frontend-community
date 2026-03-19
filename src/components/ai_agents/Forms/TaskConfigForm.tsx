import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Checkbox,
} from '@evoapi/design-system';
import { Maximize2, Save, X, ArrowDown, List, Search, Edit, PenTool, Loader2 } from 'lucide-react';
import { listAgents } from '@/services/agents';
import { useLanguage } from '@/hooks/useLanguage';
import { Agent } from '@/types/agents';

type AgentPageMode = 'create' | 'edit' | 'view';

interface TaskConfig {
  agent_id: string;
  description: string;
  expected_output: string;
  enabled_tools: string[];
}

export interface TaskConfigData {
  tasks: TaskConfig[];
}

interface TaskConfigFormProps {
  mode: AgentPageMode;
  data: TaskConfigData;
  onChange: (data: TaskConfigData) => void;
  onValidationChange: (isValid: boolean, errors: string[]) => void;
  editingAgentId?: string;
  folderId?: string;
}

const getAgentTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    llm: 'LLM',
    sequential: 'Sequential',
    parallel: 'Parallel',
    loop: 'Loop',
    task: 'Task',
  };
  return typeMap[type] || type;
};

const getAgentTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    llm: 'bg-blue-500 text-white',
    sequential: 'bg-orange-500 text-white',
    parallel: 'bg-green-500 text-white',
    loop: 'bg-pink-500 text-white',
    task: 'bg-green-500 text-white',
  };
  return colorMap[type] || 'bg-gray-500 text-white';
};

const TaskConfigForm = ({
  mode,
  data,
  onChange,
  onValidationChange,
  editingAgentId,
  folderId,
}: TaskConfigFormProps) => {
  const { t } = useLanguage('aiAgents');
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTask, setNewTask] = useState<TaskConfig>({
    agent_id: '',
    description: '',
    expected_output: '',
    enabled_tools: [],
  });

  const [taskAgentSearchQuery, setTaskAgentSearchQuery] = useState<string>('');
  const [filteredTaskAgents, setFilteredTaskAgents] = useState<Agent[]>([]);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState('');
  const [shouldSubmitAfterDescriptionSave, setShouldSubmitAfterDescriptionSave] = useState(false);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [toolSearchQuery, setToolSearchQuery] = useState<string>('');
  const [filteredTools, setFilteredTools] = useState<{ id: string; name: string }[]>([]);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [tempSelectedTools, setTempSelectedTools] = useState<string[]>([]);

  const isReadOnly = mode === 'view';

  // Validation - at least one task required
  useEffect(() => {
    const isValid = data.tasks && data.tasks.length > 0;
    onValidationChange(isValid, isValid ? [] : ['At least one task is required']);
  }, [data.tasks, onValidationChange]);

  // Load available agents
  useEffect(() => {
    loadAvailableAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, editingAgentId]);

  const loadAvailableAgents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listAgents(0, 100, folderId);
      // Filter out current agent to avoid self-reference
      const filteredAgents = response.data.filter((agent: Agent) => agent.id !== editingAgentId);
      setAvailableAgents(filteredAgents);
    } catch (err) {
      console.error('Error loading agents:', err);
      setError(t('subAgents.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isToolsModalOpen) {
      if (isEditing && editingTaskIndex !== null && data.tasks) {
        setTempSelectedTools(data.tasks[editingTaskIndex]?.enabled_tools || []);
      } else {
        setTempSelectedTools([...(newTask.enabled_tools || [])]);
      }
    }
  }, [isToolsModalOpen, isEditing, editingTaskIndex, data.tasks, newTask.enabled_tools]);

  const getAvailableTaskAgents = (currentTaskAgentId?: string) =>
    availableAgents.filter(
      agent =>
        !data.tasks?.some(task => task.agent_id === agent.id) || agent.id === currentTaskAgentId,
    );

  useEffect(() => {
    const currentTaskAgentId =
      isEditing && editingTaskIndex !== null && data.tasks
        ? data.tasks[editingTaskIndex].agent_id
        : undefined;

    const availableTaskAgents = getAvailableTaskAgents(currentTaskAgentId);

    if (taskAgentSearchQuery.trim() === '') {
      setFilteredTaskAgents(availableTaskAgents);
    } else {
      const query = taskAgentSearchQuery.toLowerCase();
      setFilteredTaskAgents(
        availableTaskAgents.filter(
          agent =>
            agent.name.toLowerCase().includes(query) ||
            (agent.description?.toLowerCase() || '').includes(query),
        ),
      );
    }
  }, [taskAgentSearchQuery, availableAgents, data.tasks, isEditing, editingTaskIndex]);

  const getAvailableTools = () => {
    if (!data.tasks || data.tasks.length === 0) {
      return [];
    }

    const taskAgentIds = data.tasks.map(task => task.agent_id);

    const toolsList: { id: string; name: string }[] = [];
    const toolsMap: Record<string, boolean> = {};

    taskAgentIds.forEach(agentId => {
      const agent = availableAgents.find(a => a.id === agentId);

      if (agent?.type === 'llm' && agent.config?.tools) {
        agent.config.tools.forEach((tool: Record<string, unknown>) => {
          const toolId = tool.id as string;
          if (toolId && !toolsMap[toolId]) {
            toolsList.push({ id: toolId, name: toolId });
            toolsMap[toolId] = true;
          }
        });
      }
    });

    return toolsList;
  };

  useEffect(() => {
    const availableTools = getAvailableTools();

    if (toolSearchQuery.trim() === '') {
      setFilteredTools(availableTools);
    } else {
      const query = toolSearchQuery.toLowerCase();
      setFilteredTools(
        availableTools.filter(
          tool => tool.name.toLowerCase().includes(query) || tool.id.toLowerCase().includes(query),
        ),
      );
    }
  }, [toolSearchQuery, data.tasks, availableAgents]);

  const saveTask = useCallback(
    (taskToSave: TaskConfig) => {
      if (isEditing && editingTaskIndex !== null) {
        const tasks = [...(data.tasks || [])];
        tasks[editingTaskIndex] = taskToSave;
        onChange({ ...data, tasks });
        setIsEditing(false);
        setEditingTaskIndex(null);
      } else {
        const tasks = [...(data.tasks || [])];
        tasks.push(taskToSave);
        onChange({ ...data, tasks });
      }

      setNewTask({
        agent_id: '',
        description: '',
        expected_output: '',
        enabled_tools: [],
      });
    },
    [isEditing, editingTaskIndex, data, onChange],
  );

  const handleAddTask = useCallback(() => {
    if (!newTask.agent_id) {
      return;
    }

    const normalizedDescription = newTask.description.trim();
    if (!normalizedDescription) {
      setExpandedDescription(newTask.description);
      setShouldSubmitAfterDescriptionSave(true);
      setIsDescriptionModalOpen(true);
      return;
    }

    saveTask({
      ...newTask,
      description: normalizedDescription,
    });
  }, [newTask, saveTask]);

  const handleEditTask = useCallback(
    (index: number) => {
      const task = data.tasks?.[index];
      if (task) {
        setNewTask({ ...task });
        setIsEditing(true);
        setEditingTaskIndex(index);
      }
    },
    [data.tasks],
  );

  const handleCancelEdit = useCallback(() => {
    setNewTask({
      agent_id: '',
      description: '',
      expected_output: '',
      enabled_tools: [],
    });
    setIsEditing(false);
    setEditingTaskIndex(null);
  }, []);

  const handleRemoveTask = useCallback(
    (index: number) => {
      if (editingTaskIndex === index) {
        handleCancelEdit();
      }

      const tasks = [...(data.tasks || [])];
      tasks.splice(index, 1);
      onChange({ ...data, tasks });
    },
    [editingTaskIndex, data, onChange, handleCancelEdit],
  );

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setNewTask({
      ...newTask,
      description: newValue,
    });
  };

  const handleExpandDescription = () => {
    setShouldSubmitAfterDescriptionSave(false);
    setExpandedDescription(newTask.description);
    setIsDescriptionModalOpen(true);
  };

  const handleSaveExpandedDescription = () => {
    const normalizedDescription = expandedDescription.trim();
    const updatedTask = {
      ...newTask,
      description: expandedDescription,
    };

    setNewTask(updatedTask);
    setIsDescriptionModalOpen(false);
    if (shouldSubmitAfterDescriptionSave && normalizedDescription && updatedTask.agent_id) {
      saveTask({
        ...updatedTask,
        description: normalizedDescription,
      });
    }
    setShouldSubmitAfterDescriptionSave(false);
  };

  const handleDescriptionModalOpenChange = (open: boolean) => {
    setIsDescriptionModalOpen(open);
    if (!open) {
      setShouldSubmitAfterDescriptionSave(false);
    }
  };

  const handleToggleTool = (toolId: string) => {
    const index = tempSelectedTools.indexOf(toolId);

    if (index > -1) {
      setTempSelectedTools(tempSelectedTools.filter(id => id !== toolId));
    } else {
      setTempSelectedTools([...tempSelectedTools, toolId]);
    }
  };

  const isToolEnabled = (toolId: string) => {
    return tempSelectedTools.includes(toolId);
  };

  const handleSaveTools = () => {
    if (isEditing && editingTaskIndex !== null && data.tasks) {
      const tasks = [...(data.tasks || [])];

      const updatedTask = {
        ...tasks[editingTaskIndex],
        enabled_tools: [...tempSelectedTools],
      };

      tasks[editingTaskIndex] = updatedTask;
      onChange({ ...data, tasks });
    } else if (newTask.agent_id) {
      const updatedNewTask = {
        ...newTask,
        enabled_tools: [...tempSelectedTools],
      };

      setNewTask(updatedNewTask);
    }

    setIsToolsModalOpen(false);
  };

  const getAgentNameById = (id: string) => {
    const agent = availableAgents.find(a => a.id === id);
    return agent?.name || id;
  };

  const renderAgentTypeBadge = (agentId: string) => {
    const agent = availableAgents.find(a => a.id === agentId);
    if (!agent) {
      return null;
    }

    return (
      <Badge className={`ml-2 ${getAgentTypeColor(agent.type)} text-xs`}>
        {getAgentTypeLabel(agent.type)}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Tasks List Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-500/10">
              <List className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-sm">{t('wizard.step3.taskConfig.tasks')}</CardTitle>
              <CardDescription className="text-xs">
                {t('wizard.step3.taskConfig.subtitle')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 pb-3">
          {data.tasks && data.tasks.length > 0 ? (
            <div className="space-y-2">
              {data.tasks.map((task, index) => (
                <div
                  key={index}
                  className={`border rounded-md p-2.5 ${
                    editingTaskIndex === index ? 'bg-primary/5 border-primary' : 'bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium mr-2">
                          {index + 1}
                        </span>
                        <h4 className="font-medium text-sm flex items-center">
                          {getAgentNameById(task.agent_id)}
                          {renderAgentTypeBadge(task.agent_id)}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-6">{task.description}</p>
                      {task.expected_output && (
                        <div className="mt-1.5 ml-6">
                          <span className="text-xs text-muted-foreground">
                            {t('wizard.step3.taskConfig.expectedOutput')}:
                          </span>
                          <Badge
                            variant="outline"
                            className="ml-1 text-primary border-primary/30 text-xs"
                          >
                            {task.expected_output}
                          </Badge>
                        </div>
                      )}
                      {task.enabled_tools && task.enabled_tools.length > 0 && (
                        <div className="mt-1.5 ml-6">
                          <span className="text-xs text-muted-foreground">
                            {t('wizard.step3.taskConfig.enabledTools')}:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.enabled_tools.map(toolId => (
                              <Badge
                                key={toolId}
                                className="text-primary border-primary/30 text-xs"
                                variant="outline"
                              >
                                {toolId}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {!isReadOnly && (
                      <div className="flex gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(index)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTask(index)}
                          className="text-destructive hover:text-destructive h-7 w-7 p-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {index < (data.tasks?.length || 0) - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-md">
              <List className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium text-sm">{t('wizard.step3.taskConfig.noTasks')}</p>
              <p className="text-xs">
                {isReadOnly
                  ? t('wizard.step3.taskConfig.noTasks')
                  : t('wizard.step3.taskConfig.addTasksHint')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Task Card */}
      {!isReadOnly && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {isEditing
                  ? t('wizard.step3.taskConfig.editTask')
                  : t('wizard.step3.taskConfig.addNewTask')}
              </CardTitle>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-7 text-xs"
                >
                  <X className="h-3.5 w-3.5 mr-1" /> {t('wizard.step3.taskConfig.cancel')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0">
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {t('subAgents.loadingAgents')}
                </span>
              </div>
            )}

            {error && (
              <div className="text-center py-4 text-destructive">
                <p className="font-medium text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAvailableAgents}
                  className="mt-2 h-7 text-xs"
                >
                  {t('actions.tryAgain')}
                </Button>
              </div>
            )}

            {!isLoading && !error && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="agent_id" className="text-xs mb-1 block">
                      {t('wizard.step3.taskConfig.agentLabel')}
                    </Label>
                    <Select
                      value={newTask.agent_id}
                      onValueChange={value => setNewTask({ ...newTask, agent_id: value })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={t('wizard.step3.taskConfig.selectAgent')} />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="sticky top-0 z-10 p-1.5 bg-background border-b">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input
                              placeholder={t('wizard.step3.taskConfig.searchAgents')}
                              className="h-7 pl-7 text-xs"
                              value={taskAgentSearchQuery}
                              onChange={e => setTaskAgentSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="max-h-[200px] overflow-y-auto py-1">
                          {filteredTaskAgents.length > 0 ? (
                            filteredTaskAgents.map(agent => (
                              <SelectItem key={agent.id} value={agent.id} className="text-xs">
                                <div className="flex items-center">
                                  <span className="mr-1.5">{agent.name}</span>
                                  <Badge className={`${getAgentTypeColor(agent.type)} text-xs`}>
                                    {getAgentTypeLabel(agent.type)}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="text-muted-foreground px-3 py-2 text-center text-xs">
                              {t('wizard.step3.taskConfig.noAgentsFound')}
                            </div>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="description" className="text-xs mb-1 block">
                      {t('wizard.step3.taskConfig.descriptionLabel')}
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="description"
                        value={newTask.description}
                        onChange={handleDescriptionChange}
                        className="w-full pr-8 text-xs"
                        rows={2}
                        onClick={handleExpandDescription}
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-muted-foreground hover:text-primary focus:outline-none"
                        onClick={handleExpandDescription}
                      >
                        <Maximize2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {t('wizard.step3.taskConfig.contentPlaceholder')}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="expected_output" className="text-xs mb-1 block">
                    {t('wizard.step3.taskConfig.expectedOutputLabel')}
                  </Label>
                  <Input
                    id="expected_output"
                    placeholder={t('wizard.step3.taskConfig.expectedOutputPlaceholder')}
                    value={newTask.expected_output}
                    onChange={e => setNewTask({ ...newTask, expected_output: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                {newTask.enabled_tools && newTask.enabled_tools.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-xs mb-1 block">
                      {t('wizard.step3.taskConfig.selectedTools')}:
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {newTask.enabled_tools.map(toolId => (
                        <Badge
                          key={toolId}
                          className="text-primary border-primary/30 text-xs"
                          variant="outline"
                        >
                          {toolId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newTask.agent_id) setIsToolsModalOpen(true);
                    }}
                    disabled={!newTask.agent_id}
                    className="h-7 text-xs"
                  >
                    <PenTool className="h-3 w-3 mr-1.5" />
                    {t('wizard.step3.taskConfig.configureTools')}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleAddTask}
                    disabled={!newTask.agent_id}
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Save className="h-3 w-3 mr-1.5" />
                    {isEditing
                      ? t('wizard.step3.taskConfig.updateTask')
                      : t('wizard.step3.taskConfig.addTask')}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Description Modal */}
      <Dialog open={isDescriptionModalOpen} onOpenChange={handleDescriptionModalOpenChange}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('wizard.step3.taskConfig.taskDescription')}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col min-h-[60vh]">
            <Textarea
              value={expandedDescription}
              onChange={e => setExpandedDescription(e.target.value)}
              className="flex-1 min-h-full p-4 resize-none text-sm"
              placeholder={t('wizard.step3.taskConfig.descriptionPlaceholder')}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDescriptionModalOpen(false)} size="sm">
              {t('wizard.step3.taskConfig.cancel')}
            </Button>
            <Button onClick={handleSaveExpandedDescription} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {t('wizard.step3.taskConfig.saveDescription')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tools Modal */}
      <Dialog open={isToolsModalOpen} onOpenChange={setIsToolsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('wizard.step3.taskConfig.availableTools')}</DialogTitle>
          </DialogHeader>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('wizard.step3.taskConfig.searchTools')}
              className="pl-9"
              value={toolSearchQuery}
              onChange={e => setToolSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredTools.length > 0 ? (
              filteredTools.map(tool => (
                <div
                  key={tool.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition duration-150"
                >
                  <Checkbox
                    id={tool.id}
                    checked={isToolEnabled(tool.id)}
                    onCheckedChange={() => handleToggleTool(tool.id)}
                  />
                  <Label htmlFor={tool.id} className="cursor-pointer flex-1 text-sm">
                    {tool.name}
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {tool.id}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  {t('wizard.step3.taskConfig.noToolsAvailable')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('wizard.step3.taskConfig.toolsFromAgents')}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleSaveTools} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {t('wizard.step3.taskConfig.saveSettings')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskConfigForm;
