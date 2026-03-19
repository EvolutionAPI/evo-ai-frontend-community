// ============================================
// TYPES INDEX - Organized by Domain
// ============================================

// Core - Fundamental API types
export * from './core';

// Auth - Authentication and Authorization
export * from './auth';

// Users - Users, Teams, and Profiles
export * from './users';

// Agents - AI Agents
export * from './agents';

// Contacts - Contact Management
export * from './contacts';

// Channels - Communication Channels
export * from './channels';

// Chat - Conversations and Messages
// Note: Chat types are NOT exported from main index to avoid naming conflicts
// Import chat types directly from '@/types/chat' when needed

// Integrations - External Integrations
export * from './integrations';

// Automation - Workflows and Automations
export * from './automation';

// AI - Tools and MCP Servers
export * from './ai';

// Settings - Configuration and Customization
export * from './settings';

// Analytics - Reports and Tracking
export * from './analytics';

// Admin - Administration and Super Admin
export * from './admin';

// Notifications - Notifications and Events
export * from './notifications';
