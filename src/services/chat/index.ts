// Chat Service
export { chatService, default as chatServiceDefault } from './chatService';

// WebSocket Connectors
export {
  BaseActionCableConnector,
  type WebSocketEvent,
  type ConnectionParams,
  type EventHandlers,
} from './websocket/BaseActionCableConnector';

export {
  ChatActionCableConnector,
  type ChatEventHandlers,
  type MessageCreatedEvent,
  type MessageUpdatedEvent,
  type ConversationCreatedEvent,
  type ConversationUpdatedEvent,
  type ConversationStatusChangedEvent,
  type AssigneeChangedEvent,
  type TypingEvent,
  type PresenceUpdateEvent,
  type ContactUpdatedEvent,
  type ConversationReadEvent,
} from './websocket/ChatActionCableConnector';
