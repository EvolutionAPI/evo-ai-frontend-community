/**
 * Helper functions to validate agent types and determine which features are available
 */

export type AgentType = 'llm' | 'a2a' | 'task' | 'sequential' | 'parallel' | 'loop' | 'workflow' | 'external';

/**
 * Check if agent is LLM type
 */
export const isLLMAgent = (type?: string): boolean => {
  return type === 'llm';
};

/**
 * Check if agent is A2A type
 */
export const isA2AAgent = (type?: string): boolean => {
  return type === 'a2a';
};

/**
 * Check if agent is Task type
 */
export const isTaskAgent = (type?: string): boolean => {
  return type === 'task';
};

/**
 * Check if agent is External type
 */
export const isExternalAgent = (type?: string): boolean => {
  return type === 'external';
};

/**
 * Check if agent is an orchestrator type (task, sequential, parallel, loop)
 */
export const isOrchestratorAgent = (type?: string): boolean => {
  return ['task', 'sequential', 'parallel', 'loop'].includes(type || '');
};

/**
 * Check if agent supports model and API configuration
 */
export const supportsModelConfig = (type?: string): boolean => {
  return isLLMAgent(type);
};

/**
 * Check if agent supports behavior settings (transfer, emojis, reminders, pipeline)
 */
export const supportsBehaviorSettings = (type?: string): boolean => {
  return isLLMAgent(type);
};

/**
 * Check if agent supports message handling (wait time, signature, segmentation)
 */
export const supportsMessageHandling = (type?: string): boolean => {
  return isLLMAgent(type) || isExternalAgent(type);
};

/**
 * Check if agent supports capabilities (memory, knowledge, planner)
 */
export const supportsCapabilities = (type?: string): boolean => {
  return isLLMAgent(type);
};

/**
 * Check if agent supports output format configuration
 * LLM and all orchestrator types (task, sequential, parallel, loop) support output format
 */
export const supportsOutputFormat = (type?: string): boolean => {
  return isLLMAgent(type) || isOrchestratorAgent(type);
};

/**
 * Check if agent supports inactivity actions
 */
export const supportsInactivityActions = (type?: string): boolean => {
  return isLLMAgent(type);
};

/**
 * Check if agent supports transfer rules
 */
export const supportsTransferRules = (type?: string): boolean => {
  return isLLMAgent(type);
};

/**
 * Check if agent supports pipeline rules
 */
export const supportsPipelineRules = (type?: string): boolean => {
  return isLLMAgent(type);
};

/**
 * Get list of available tabs for agent type
 */
export const getAvailableTabs = (type?: string): string[] => {
  const tabs = ['general'];

  if (supportsBehaviorSettings(type) || supportsMessageHandling(type)) {
    tabs.push('system');
  }

  if (supportsInactivityActions(type)) {
    tabs.push('inactivity');
  }

  return tabs;
};
