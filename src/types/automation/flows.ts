import { Node, Edge } from '@xyflow/react';

// ============================================================================
// ENUMS PARA FLOWS
// ============================================================================

export enum NodeTypeEnum {
  TRIGGER = "trigger-node",
  ACTION = "action-node",
  CONDITION = "condition-node",
  COMMUNICATION = "communication-node",
  FLOW = "flow-node",
  START = "start-node",
  END = "end-node",
}

export enum ConditionTypeEnum {
  PREVIOUS_OUTPUT = "previous-output",
  CONTACT_FIELD = "contact-field",
  MESSAGE_CONTENT = "message-content",
  TIME_BASED = "time-based",
  CUSTOM = "custom",
}

export enum MessageTypeEnum {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  DOCUMENT = "document",
  TEMPLATE = "template",
}

export enum DelayUnitEnum {
  SECONDS = "seconds",
  MINUTES = "minutes",
  HOURS = "hours",
  DAYS = "days",
  WEEKS = "weeks",
}

export enum FlowStatusEnum {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
}

export enum ExecutionStatusEnum {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

// ============================================================================
// TIPOS BÁSICOS PARA FLOWS
// ============================================================================

export type FlowMessageType = {
  type: MessageTypeEnum;
  content: string;
  metadata?: Record<string, unknown>;
};

export type DelayType = {
  value: number;
  unit: DelayUnitEnum;
  description?: string;
};

export type ConditionType = {
  id: string;
  type: ConditionTypeEnum;
  field?: string;
  operator?: string;
  value?: unknown;
  data?: Record<string, unknown>;
};

export type FlowNodeData = {
  id: string;
  type: NodeTypeEnum;
  label: string;
  description?: string;
  config?: Record<string, unknown>;
  conditions?: ConditionType[];
  messages?: FlowMessageType[];
  delay?: DelayType;
  isExecuting?: boolean;
  executionStatus?: ExecutionStatusEnum;
  lastExecuted?: Date;
  metadata?: Record<string, unknown>;
};

export type FlowEdgeData = {
  id: string;
  label?: string;
  condition?: ConditionType;
  animated?: boolean;
  style?: Record<string, unknown>;
};

// ============================================================================
// INTERFACES PARA COMPONENTES DE FLOW
// ============================================================================

export interface FlowNode extends Node {
  type: NodeTypeEnum;
  data: FlowNodeData;
}

export interface FlowEdge extends Edge {
  data?: FlowEdgeData;
}

export interface FlowData {
  id?: string;
  name: string;
  description?: string;
  status: FlowStatusEnum;
  nodes: FlowNode[];
  edges: FlowEdge[];
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface FlowExecution {
  id: string;
  flowId: string;
  status: ExecutionStatusEnum;
  startedAt: Date;
  completedAt?: Date;
  currentNodeId?: string;
  context?: Record<string, unknown>;
  logs?: FlowExecutionLog[];
  error?: string;
}

export interface FlowExecutionLog {
  id: string;
  executionId: string;
  nodeId: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// TIPOS PARA CATEGORIAS DE NODES
// ============================================================================

export interface NodeCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  color?: string;
}

export interface NodeTemplate {
  id: string;
  type: NodeTypeEnum;
  category: string;
  label: string;
  description: string;
  icon: string;
  color?: string;
  defaultData?: Partial<FlowNodeData>;
  configSchema?: Record<string, unknown>;
}

// ============================================================================
// TIPOS PARA VALIDAÇÃO DE FLOWS
// ============================================================================

export interface FlowValidationError {
  type: 'error' | 'warning';
  nodeId?: string;
  edgeId?: string;
  message: string;
  code: string;
}

export interface FlowValidationResult {
  isValid: boolean;
  errors: FlowValidationError[];
  warnings: FlowValidationError[];
}

// ============================================================================
// TIPOS PARA CONFIGURAÇÃO DE FLOWS
// ============================================================================

export interface FlowConfig {
  maxNodes?: number;
  maxEdges?: number;
  allowLoops?: boolean;
  requireStartNode?: boolean;
  requireEndNode?: boolean;
  enableSnapToGrid?: boolean;
  snapGridSize?: [number, number];
  enableHelperLines?: boolean;
  enableMiniMap?: boolean;
  enableControls?: boolean;
  enableBackground?: boolean;
  backgroundVariant?: 'dots' | 'lines' | 'cross';
}

// ============================================================================
// TIPOS PARA EVENTOS DE FLOW
// ============================================================================

export interface FlowEvent {
  type: string;
  nodeId?: string;
  edgeId?: string;
  data?: unknown;
  timestamp: Date;
}

export type FlowEventHandler = (event: FlowEvent) => void;

// ============================================================================
// TIPOS PARA EXPORTAÇÃO/IMPORTAÇÃO
// ============================================================================

export interface FlowExportData {
  flow: FlowData;
  version: string;
  exportedAt: Date;
  exportedBy: string;
  metadata?: Record<string, unknown>;
}

export interface FlowImportResult {
  success: boolean;
  flow?: FlowData;
  errors?: string[];
  warnings?: string[];
}

// ============================================================================
// TIPOS UTILITÁRIOS
// ============================================================================

export type FlowPosition = {
  x: number;
  y: number;
};

export type FlowDimensions = {
  width: number;
  height: number;
};

export type FlowBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// ============================================================================
// TIPOS PARA HOOKS E CONTEXTOS
// ============================================================================

export interface FlowContextValue {
  flow: FlowData | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodes: string[];
  selectedEdges: string[];
  isExecuting: boolean;
  executionStatus?: ExecutionStatusEnum;

  // Actions
  updateFlow: (flow: Partial<FlowData>) => void;
  addNode: (node: Omit<FlowNode, 'id'>) => void;
  updateNode: (nodeId: string, data: Partial<FlowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: Omit<FlowEdge, 'id'>) => void;
  updateEdge: (edgeId: string, data: Partial<FlowEdgeData>) => void;
  deleteEdge: (edgeId: string) => void;

  // Selection
  selectNode: (nodeId: string) => void;
  selectEdge: (edgeId: string) => void;
  clearSelection: () => void;

  // Execution
  executeFlow: () => Promise<void>;
  stopExecution: () => void;

  // Validation
  validateFlow: () => FlowValidationResult;

  // Persistence
  saveFlow: () => Promise<void>;
  loadFlow: (flowId: string) => Promise<void>;
}

// ============================================================================
// EXPORTS PARA COMPATIBILIDADE
// ============================================================================

// Re-export dos tipos originais para manter compatibilidade
export type {
  FlowMessageType as OriginalMessageType,
  DelayType as OriginalDelayType,
  ConditionType as OriginalConditionType,
};

export {
  ConditionTypeEnum as OriginalConditionTypeEnum,
  MessageTypeEnum as OriginalMessageTypeEnum,
  DelayUnitEnum as OriginalDelayUnitEnum,
};
