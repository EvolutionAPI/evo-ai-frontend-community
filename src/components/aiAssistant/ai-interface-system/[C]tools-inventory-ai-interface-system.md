# EVO AI Interface System - Tools Inventory & Atomic Tools Proposal

**Date**: May 18, 2026  
**Status**: Draft - Representative Inventory  
**Purpose**: Consolidated API endpoint mapping + ADK atomic tools proposal for EVO CRM AI Interface System

---

## 1. SERVICE ENDPOINTS INVENTORY

### 1.1 CRM Service (evo-ai-crm-community)
**Tech**: Rails REST API  
**Base Routes**: `/api/v1/`

#### Contacts & Pipelines Domain
- `GET /contacts` — List all contacts with filtering/search
- `GET /contacts/:id` — Get contact details (companies, pipelines, conversations)
- `POST /contacts` — Create new contact
- `PUT /contacts/:id` — Update contact attributes
- `DELETE /contacts/:id` — Delete contact
- `POST /contacts/import` — Bulk import contacts
- `POST /contacts/export` — Export contacts to CSV
- `GET /contacts/search` — Search contacts by query
- `POST /contacts/filter` — Filter contacts with advanced conditions
- `POST /actions/contact_merge` — Merge two contacts
- `POST /contacts/:contact_id/companies` — Link contact to company
- `GET /contacts/:contact_id/pipelines` — Get contact pipelines/deals
- `POST /contact_bulk_transfer` — Bulk transfer contacts to agents

#### Conversations & Messages Domain
- `GET /conversations` — List conversations with metadata/filters
- `POST /conversations` — Create conversation
- `GET /conversations/:id` — Get conversation details
- `PUT /conversations/:id` — Update conversation (status, priority, custom fields)
- `DELETE /conversations/:id` — Delete conversation
- `GET /conversations/:id/messages` — List messages in conversation
- `POST /conversations/:id/messages` — Create/send message
- `PUT /conversations/:id/messages/:msg_id` — Update message
- `DELETE /conversations/:id/messages/:msg_id` — Delete message
- `POST /conversations/:id/messages/:msg_id/retry` — Retry failed message
- `POST /conversations/:id/assignments` — Assign conversation to agent
- `POST /conversations/:id/labels` — Tag conversation with label
- `POST /conversations/:id/mute` — Mute conversation
- `POST /conversations/:id/archive` — Archive conversation
- `GET /conversations/search` — Full-text search messages
- `GET /conversations/available_for_pipeline` — Get conversations ready for pipeline

#### Pipelines & Stages Domain
- `GET /pipelines` — List sales pipelines
- `POST /pipelines` — Create pipeline
- `PUT /pipelines/:id` — Update pipeline
- `DELETE /pipelines/:id` — Archive pipeline
- `PATCH /pipelines/:id/set_as_default` — Set default pipeline
- `GET /pipelines/:id/stats` — Get pipeline stats (deals, revenue, etc.)
- `GET /pipelines/stats` — Get all pipelines stats
- `GET /pipeline_stages` — List stages in a pipeline
- `POST /pipeline_stages` — Create stage
- `PUT /pipeline_stages/:id` — Update stage
- `PATCH /pipeline_stages/:id/move_up` — Reorder stage up
- `PATCH /pipeline_stages/:id/move_down` — Reorder stage down
- `GET /pipeline_items` — List deals/pipeline items
- `POST /pipeline_items` — Create pipeline item (deal)
- `PUT /pipeline_items/:id` — Update deal
- `PATCH /pipeline_items/:id/move_to_stage` — Move deal to stage
- `PATCH /pipeline_items/:id/bulk_move` — Bulk move deals
- `GET /pipeline_items/available_conversations` — Get available conversations for deal
- `GET /pipeline_items/stats` — Deal metrics (count, value, etc.)
- `POST /pipeline_items/:id/products` — Add product to deal
- `GET /pipeline_items/:id/tasks` — Get deal tasks
- `POST /pipeline_items/:id/tasks` — Create task for deal

#### Agents & Bots Domain
- `GET /agents` — List agents
- `POST /agents` — Create agent
- `PUT /agents/:id` — Update agent
- `DELETE /agents/:id` — Delete agent
- `POST /agents/bulk_create` — Bulk create agents
- `GET /agent_bots` — List chatbots
- `POST /agent_bots` — Create chatbot
- `PUT /agent_bots/:id` — Update chatbot
- `DELETE /agent_bots/:id` — Delete chatbot
- `GET /inboxes/:inbox_id/agent_bot` — Get inbox's assigned bot
- `POST /inboxes/:inbox_id/set_agent_bot` — Assign bot to inbox
- `GET /assignable_agents` — List agents available for assignment

#### Channels & Inboxes Domain
- `GET /inboxes` — List inboxes (WhatsApp, Email, etc.)
- `POST /inboxes` — Create inbox
- `PUT /inboxes/:id` — Update inbox
- `DELETE /inboxes/:id` — Delete inbox
- `POST /inboxes/:id/setup_channel_provider` — Configure channel integration
- `POST /inboxes/:id/disconnect_channel_provider` — Disconnect channel
- `GET /inboxes/:id/message_templates` — Get templates for inbox
- `POST /inboxes/:id/message_templates` — Create message template
- `PUT /inboxes/:id/message_templates/:template_id` — Update template
- `DELETE /inboxes/:id/message_templates/:template_id` — Delete template

#### Automations & Workflows Domain
- `GET /automation_rules` — List automation rules
- `POST /automation_rules` — Create automation rule
- `PUT /automation_rules/:id` — Update rule
- `DELETE /automation_rules/:id` — Delete rule
- `POST /automation_rules/:id/clone` — Clone rule
- `GET /automation_rules/:id/runs` — Get rule execution history
- `GET /scheduled_actions` — List scheduled actions
- `POST /scheduled_actions` — Schedule action
- `PUT /scheduled_actions/:id` — Update scheduled action
- `DELETE /scheduled_actions/:id` — Cancel scheduled action

#### Labels & Attributes Domain
- `GET /labels` — List labels
- `POST /labels` — Create label
- `PUT /labels/:id` — Update label
- `DELETE /labels/:id` — Delete label
- `GET /custom_attribute_definitions` — List custom attributes
- `POST /custom_attribute_definitions` — Create attribute definition
- `PUT /custom_attribute_definitions/:id` — Update attribute definition
- `DELETE /custom_attribute_definitions/:id` — Delete attribute
- `POST /contacts/:id/destroy_custom_attributes` — Clear contact attributes

#### Reports & Metrics (API v2)
- `GET /reports` — Get all reports (summary, agents, inboxes, conversations)
- `GET /reports/summary` — Team summary report
- `GET /reports/agent` — Agent performance report
- `GET /reports/team` — Team report
- `GET /reports/conversations` — Conversation analytics
- `GET /reports/bot_metrics` — Chatbot performance
- `GET /csat_survey_responses` — Get CSAT responses
- `GET /csat_survey_responses/metrics` — CSAT metrics

#### Products & Variants Domain
- `GET /products` — List products
- `POST /products` — Create product
- `PUT /products/:id` — Update product
- `DELETE /products/:id` — Delete product
- `GET /products/:id/variants` — List product variants
- `POST /products/:id/variants` — Create variant
- `PUT /products/:id/variants/:variant_id` — Update variant
- `DELETE /products/:id/variants/:variant_id` — Delete variant
- `GET /ai_agents/:agent_id/products` — List products linked to AI agent
- `POST /ai_agents/:agent_id/products` — Link product to agent
- `DELETE /ai_agents/:agent_id/products/:product_id` — Unlink product

#### Integrations Domain
- `POST /integrations/linear/create_issue` — Create Linear issue from conversation
- `POST /integrations/linear/link_issue` — Link conversation to Linear issue
- `GET /integrations/linear/search_issue` — Search Linear issues
- `POST /integrations/hubspot/create_deal` — Create HubSpot deal
- `POST /integrations/hubspot/link_deal` — Link conversation to HubSpot deal
- `GET /integrations/hubspot/pipelines` — Get HubSpot pipelines
- `POST /integrations/slack` — Configure Slack integration
- `POST /integrations/dyte/create_a_meeting` — Create Dyte meeting
- `POST /integrations/shopify/auth` — Authenticate Shopify
- `GET /integrations/apps` — List available integrations

---

### 1.2 Auth Service (evo-auth-service-community)
**Tech**: Rails REST API + Devise Token Auth  
**Base Routes**: `/api/v1/`, `/auth`

#### Authentication Domain
- `POST /auth/login` — User login (email + password)
- `POST /auth/logout` — User logout
- `POST /auth/register` — Register new user
- `GET /auth/me` — Get current user profile
- `POST /auth/refresh` — Refresh JWT token
- `POST /auth/validate` — Validate access token
- `POST /auth/forgot_password` — Request password reset
- `POST /auth/reset_password` — Reset password with token
- `POST /auth/confirmation` — Confirm email
- `POST /mfa/verify` — Verify MFA (TOTP/Email OTP)

#### Profile & Account Domain
- `GET /profile` — Get user profile
- `PUT /profile` — Update profile
- `PUT /profile/avatar` — Upload profile picture
- `PUT /profile/password` — Change password
- `GET /profile/notifications` — Get notification preferences
- `PUT /profile/notifications` — Update notification settings
- `POST /profile/resend_email_confirmation` — Resend confirmation email
- `DELETE /profile/cancel_email_change` — Cancel pending email change
- `GET /account` — Get account info
- `PUT /account` — Update account

#### MFA Domain
- `POST /mfa/setup_totp` — Setup TOTP (Google Authenticator)
- `POST /mfa/verify_totp` — Verify TOTP code
- `POST /mfa/setup_email_otp` — Setup Email OTP
- `POST /mfa/verify_email_otp` — Verify Email OTP
- `GET /mfa/backup_codes` — Get backup codes
- `POST /mfa/regenerate_backup_codes` — Regenerate backup codes
- `POST /mfa/disable` — Disable MFA

#### Users & Roles Domain
- `GET /users` — List users
- `POST /users` — Create user
- `PUT /users/:id` — Update user
- `DELETE /users/:id` — Delete user
- `POST /users/bulk_create` — Bulk create users
- `GET /roles` — List roles
- `POST /roles` — Create role
- `PUT /roles/:id` — Update role
- `DELETE /roles/:id` — Delete role
- `GET /roles/full` — Get roles with full permissions
- `PUT /roles/:id/bulk_update_permissions` — Update role permissions

#### OAuth & Access Control Domain
- `GET /permissions` — List available permissions
- `POST /permissions/check` — Check user permission
- `GET /oauth_applications` — List OAuth applications
- `POST /oauth_applications` — Create OAuth app
- `PUT /oauth_applications/:id` — Update OAuth app
- `DELETE /oauth_applications/:id` — Delete OAuth app
- `POST /oauth_applications/:id/regenerate_secret` — Regenerate app secret
- `GET /access_tokens` — List access tokens
- `POST /access_tokens` — Create personal access token
- `DELETE /access_tokens/:id` — Revoke access token

#### Privacy & Compliance Domain
- `GET /data_privacy/dashboard` — Privacy compliance dashboard
- `GET /data_privacy/consents` — Get user consents (LGPD/GDPR)
- `POST /data_privacy/consents` — Grant consent
- `DELETE /data_privacy/consents/:consent_type` — Revoke consent
- `GET /data_privacy/export` — Export user data
- `POST /data_privacy/deletion_request` — Request data deletion
- `POST /data_privacy/confirm_deletion` — Confirm deletion

#### Features & Plans Domain
- `GET /features` — List available features
- `GET /features/:id` — Get feature details
- `GET /plans` — List billing plans
- `GET /plans/:id` — Get plan details

---

### 1.3 AI Core Service (evo-ai-core-service-community)
**Tech**: Go + Gin Framework  
**Base Routes**: `/api/v1/`

#### Agents Domain
- `GET /agents` — List AI agents
- `POST /agents` — Create AI agent
- `GET /agents/:id` — Get agent details
- `PUT /agents/:id` — Update agent (name, prompt, model, system instructions)
- `DELETE /agents/:id` — Delete agent
- `POST /agents/import` — Bulk import agents
- `GET /agents/:id/shared` — Get shared agent info
- `GET /agents/:id/share` — Get agent share settings
- `GET /agents/:folder_id/by_folder` — List agents in folder

#### Agent Configuration Domain
- `POST /agents/:id/config` — Update agent configuration
- `GET /agents/:id/config` — Get agent config (model, tools, MCP servers)
- `PUT /agents/:id/folder` — Assign agent to folder

#### API Keys & Credentials Domain
- `GET /agents/apikeys` — List API keys
- `POST /agents/apikeys` — Create API key
- `PUT /agents/apikeys/:id` — Update API key
- `DELETE /agents/apikeys/:id` — Revoke API key
- `GET /ai_apikeys` — List all API keys
- `POST /ai_apikeys` — Create new API key

#### Custom Tools Domain
- `GET /custom_tools` — List custom tools
- `POST /custom_tools` — Create custom tool
- `GET /custom_tools/:id` — Get tool definition
- `PUT /custom_tools/:id` — Update tool
- `DELETE /custom_tools/:id` — Delete tool
- `GET /custom_tools/:agent_id/by_agent` — List tools for agent

#### MCP Servers Domain
- `GET /mcp_servers` — List MCP servers (native integrations)
- `POST /mcp_servers` — Register MCP server
- `GET /mcp_servers/:id` — Get MCP server details
- `PUT /mcp_servers/:id` — Update MCP server
- `DELETE /mcp_servers/:id` — Delete MCP server
- `GET /custom_mcp_servers` — List custom MCP servers
- `POST /custom_mcp_servers` — Create custom MCP server
- `GET /custom_mcp_servers/:id` — Get custom MCP server
- `PUT /custom_mcp_servers/:id` — Update custom MCP server
- `DELETE /custom_mcp_servers/:id` — Delete custom MCP server

#### Folders & Organization Domain
- `GET /folders` — List folders
- `POST /folders` — Create folder
- `GET /folders/:id` — Get folder details
- `PUT /folders/:id` — Update folder
- `DELETE /folders/:id` — Delete folder
- `GET /folders/:id/shared` — Get shared folders
- `GET /folder_shares/:id` — Get folder share settings
- `POST /folder_shares` — Create folder share
- `DELETE /folder_shares/:id` — Remove folder share

#### Agent Integrations Domain
- `GET /agent_integrations` — List agent integrations
- `POST /agent_integrations` — Configure agent integration (HubSpot, Linear, etc.)
- `GET /agent_integrations/:id` — Get integration details
- `PUT /agent_integrations/:id` — Update integration
- `DELETE /agent_integrations/:id` — Disconnect integration

---

### 1.4 EvoFlow Service (evo-flow)
**Tech**: NestJS + TypeORM  
**Base Routes**: `/api/v1/`

#### Events Domain
- `POST /events/track` — Track user event (analytics)
- `POST /events/identify` — Identify user
- `POST /events/page` — Page view event
- `POST /events/screen` — Mobile screen event
- `GET /events/search` — Search events by contact
- `GET /events/:id` — Get event details

#### Contacts Domain
- `GET /contacts` — List contacts (from events)
- `POST /contacts` — Create contact
- `GET /contacts/:id` — Get contact details
- `PUT /contacts/:id` — Update contact
- `POST /contacts/custom-attributes` — Set custom attributes on contact
- `DELETE /contacts/custom-attributes` — Delete custom attributes

#### Labels & Tagging Domain
- `GET /labels` — List labels/tags
- `POST /labels` — Create label
- `DELETE /labels/:id` — Delete label
- `POST /tagging` — Tag contact/event
- `DELETE /tagging/:id` — Remove tag

#### Segments Domain
- `GET /segments` — List segments
- `POST /segments` — Create segment
- `GET /segments/:id` — Get segment details
- `PUT /segments/:id` — Update segment (filtering conditions)
- `DELETE /segments/:id` — Delete segment
- `GET /segments/:id/distributed` — Get distributed segment (split version)
- `POST /segments/:id/compute` — Trigger segment computation
- `GET /segments/:id/status` — Get segment computation status
- `GET /segments/:id/members` — Get contacts in segment (paginated)

#### Journeys Domain
- `GET /journeys` — List journeys
- `POST /journeys` — Create journey (workflow/automation)
- `GET /journeys/:id` — Get journey details (nodes, edges, triggers)
- `PUT /journeys/:id` — Update journey definition
- `DELETE /journeys/:id` — Delete journey
- `POST /journeys/:id/publish` — Publish journey (make live)
- `POST /journeys/:id/pause` — Pause journey
- `POST /journeys/:id/resume` — Resume journey
- `GET /journeys/:id/sessions` — Get active journey sessions
- `GET /journeys/:id/analytics` — Get journey metrics
- `POST /scheduled_actions` — Schedule one-time action
- `GET /scheduled_actions` — List scheduled actions
- `PUT /scheduled_actions/:id` — Reschedule action
- `DELETE /scheduled_actions/:id` — Cancel scheduled action

#### Campaigns Domain
- `GET /campaigns` — List campaigns
- `POST /campaigns` — Create campaign
- `GET /campaigns/:id` — Get campaign details
- `PUT /campaigns/:id` — Update campaign (audience, template, schedule)
- `DELETE /campaigns/:id` — Delete campaign
- `POST /campaigns/:id/execute` — Trigger campaign execution
- `POST /campaigns/:id/pause` — Pause campaign
- `POST /campaigns/:id/resume` — Resume campaign
- `GET /campaigns/:id/executions` — Get campaign executions/runs
- `GET /campaigns/:id/analytics` — Campaign performance metrics
- `GET /campaign-templates` — List campaign templates
- `POST /campaign-templates` — Create template
- `PUT /campaign-templates/:id` — Update template
- `DELETE /campaign-templates/:id` — Delete template

#### Click Tracking & URL Shortening Domain
- `POST /click-tracking/links` — Create tracked link
- `GET /click-tracking/links/:id` — Get link details
- `PUT /click-tracking/links/:id` — Update link
- `DELETE /click-tracking/links/:id` — Delete link
- `GET /click-tracking/links/:id/analytics` — Get click analytics
- `POST /custom-domains` — Register custom domain for tracking
- `GET /custom-domains` — List custom domains
- `DELETE /custom-domains/:id` — Remove custom domain
- `GET /link/:shortCode` — Redirect tracked link (public)

#### Audit & Compliance Domain
- `GET /audit` — List audit events
- `GET /audit/contacts/:id` — Get audit trail for contact
- `GET /audit/campaigns/:id` — Get audit trail for campaign
- `GET /audit/journeys/:id` — Get audit trail for journey

#### Processing & Health Domain
- `GET /processing/health` — Processing service health
- `GET /processing/kafka/status` — Kafka consumer status
- `GET /processing/clickhouse/status` — ClickHouse connectivity
- `POST /processing/events/process` — Manually process event batch
- `GET /metrics` — Prometheus metrics

---

## 2. KEY ENTITIES ACROSS SERVICES

### CRM Service
- Contact, ContactInbox, Note, Label
- Conversation, Message, Assignment, Participant
- Pipeline, PipelineStage, PipelineItem, PipelineTask
- Agent, AgentBot, CannedResponse
- Inbox, MessageTemplate
- CustomAttributeDefinition, CustomFilter
- AutomationRule, ScheduledAction
- Product, ProductVariant

### Auth Service
- User, Account, Profile
- Role, Permission
- OAuthApplication, AccessToken
- MFAConfiguration

### AI Core Service
- Agent (AI Agent), AgentConfig
- CustomTool, ToolDefinition
- MCPServer, CustomMCPServer
- ApiKey
- Folder, FolderShare
- AgentIntegration

### EvoFlow Service
- Event, EventProperty
- Contact, ContactAttribute
- Tag, Tagging
- Segment, SegmentCriteria
- Journey, JourneyNode, JourneyEdge, JourneySession
- Campaign, CampaignTemplate, CampaignExecution
- ShortLink, CustomDomain, LinkClick
- AuditLog, AuditEvent

---

## 3. PROPOSED ATOMIC TOOLS (ADK)

### 3.1 Contacts & Pipeline Management (8 tools)

**`create_contact_with_attributes`**  
Create contact with company, phone, email, and custom fields.  
*Endpoints*: POST /contacts, POST /contacts/:id/companies, POST /contacts/:id/destroy_custom_attributes

**`move_contact_to_pipeline_stage`**  
Move contact/deal to a specific pipeline stage.  
*Endpoints*: GET /pipeline_items/:id, PATCH /pipeline_items/:id/move_to_stage

**`bulk_update_contact_labels`**  
Add/remove labels from multiple contacts in batch.  
*Endpoints*: POST /contacts/filter, POST /conversations/:id/labels

**`get_contact_full_history`**  
Get contact's complete timeline (conversations, notes, interactions, attributes).  
*Endpoints*: GET /contacts/:id, GET /contacts/:id/pipelines, GET /contacts/conversations

**`bulk_import_contacts_from_file`**  
Import contacts from CSV/JSON file with duplicate detection.  
*Endpoints*: POST /contacts/import

**`merge_duplicate_contacts`**  
Merge two contact records, consolidating history and attributes.  
*Endpoints*: POST /actions/contact_merge

**`get_pipeline_summary_by_contact`**  
Get all pipeline items (deals) for a contact with stage & value.  
*Endpoints*: GET /contacts/:id/pipelines, GET /pipeline_items/stats

**`bulk_reassign_conversations_to_agent`**  
Reassign multiple conversations to a new agent.  
*Endpoints*: POST /contact_bulk_transfer, GET /assignable_agents

---

### 3.2 Conversation & Messaging (7 tools)

**`send_message_to_contact`**  
Send message to contact via specific inbox/channel.  
*Endpoints*: POST /conversations/:id/messages, GET /inboxes

**`summarize_contact_conversation_history`**  
Get AI summary of recent conversations with a contact.  
*Endpoints*: GET /conversations/search, GET /conversations/:id/messages, POST /conversations/:id/transcript

**`create_conversation_from_contact`**  
Initiate new conversation with contact (optionally assign to agent).  
*Endpoints*: POST /conversations, POST /conversations/:id/assignments

**`apply_bulk_actions_to_conversations`**  
Archive, mute, or label multiple conversations.  
*Endpoints*: POST /bulk_actions, POST /conversations/:id/mute, POST /conversations/:id/archive

**`search_messages_by_keyword`**  
Full-text search messages across conversations.  
*Endpoints*: GET /conversations/search, GET /search/messages

**`update_conversation_custom_fields`**  
Set/update custom attributes on conversation.  
*Endpoints*: POST /conversations/:id/custom_attributes

**`add_participants_to_conversation`**  
Add team members or contacts to conversation thread.  
*Endpoints*: PUT /conversations/:id/participants

---

### 3.3 Agents & Tools Configuration (9 tools)

**`create_agent_with_tools_and_mcp`**  
Create AI agent with name, prompt, model, custom tools, and MCP servers.  
*Endpoints*: POST /agents, POST /agents/:id/config, POST /agents/:id/tools (implied), POST /agents/:id/mcp_servers (implied)

**`update_agent_system_prompt`**  
Modify agent's core prompt/instructions without affecting config.  
*Endpoints*: PUT /agents/:id, PUT /agents/:id/config

**`attach_custom_tool_to_agent`**  
Link or create custom tool and attach to agent.  
*Endpoints*: POST /custom_tools, GET /custom_tools/:id, PATCH /agents/:id/tools (implied)

**`attach_mcp_server_to_agent`**  
Attach native MCP server (Linear, HubSpot, GitHub, etc.) to agent.  
*Endpoints*: GET /mcp_servers, POST /agents/:id/mcp_servers (implied)

**`create_custom_mcp_server_integration`**  
Register custom MCP server for agent use.  
*Endpoints*: POST /custom_mcp_servers, GET /custom_mcp_servers/:id

**`revoke_agent_api_key`**  
Create or revoke API key for programmatic agent access.  
*Endpoints*: POST /agents/apikeys, DELETE /agents/apikeys/:id

**`clone_agent_configuration`**  
Clone existing agent (copy prompt, tools, settings).  
*Endpoints*: GET /agents/:id, POST /agents (with cloned config)

**`organize_agents_in_folders`**  
Create/organize agent folders for team workspace.  
*Endpoints*: POST /folders, PUT /agents/:id/folder

**`share_agent_with_team`**  
Share AI agent with other team members or public.  
*Endpoints*: GET /agents/:id/share, POST /folder_shares (implied)

---

### 3.4 Journeys & Automation (8 tools)

**`create_journey_with_nodes_and_edges`**  
Create automation journey (workflow) with conditional branching.  
*Endpoints*: POST /journeys, PUT /journeys/:id (nodes/edges definition)

**`trigger_journey_for_segment`**  
Enroll all contacts in segment into a journey.  
*Endpoints*: GET /segments/:id/members, POST /journeys/:id/enroll (implied)

**`create_journey_trigger_rule`**  
Setup automatic journey entry when event condition met.  
*Endpoints*: POST /automation_rules, PUT /automation_rules/:id (implied journey config)

**`pause_resume_journey`**  
Pause/resume active journey (no new enrollments).  
*Endpoints*: POST /journeys/:id/pause, POST /journeys/:id/resume

**`get_journey_performance_metrics`**  
Get journey completion rate, drop-off points, and conversion.  
*Endpoints*: GET /journeys/:id/analytics, GET /journeys/:id/sessions

**`schedule_one_time_action`**  
Schedule single action (send message, update field) for specific time.  
*Endpoints*: POST /scheduled_actions, PUT /scheduled_actions/:id

**`bulk_create_automation_rules`**  
Create multiple automation triggers in batch.  
*Endpoints*: POST /automation_rules/bulk (implied), POST /automation_rules

**`clone_journey_template`**  
Clone existing journey as new template/campaign starter.  
*Endpoints*: GET /journeys/:id, POST /journeys (with cloned nodes)

---

### 3.5 Campaigns & Segments (8 tools)

**`create_segment_with_filter_conditions`**  
Define contact segment based on attributes, behavior, engagement.  
*Endpoints*: POST /segments, PUT /segments/:id (filtering logic)

**`compute_segment_audience_size`**  
Estimate/calculate total contacts matching segment criteria.  
*Endpoints*: POST /segments/:id/compute, GET /segments/:id/status

**`create_campaign_from_template`**  
Create campaign with template, select audience segment, set schedule.  
*Endpoints*: GET /campaign-templates, POST /campaigns

**`schedule_campaign_execution`**  
Set campaign to run at specific time/frequency or immediately.  
*Endpoints*: POST /campaigns/:id/execute, PUT /campaigns/:id (schedule config)

**`pause_campaign_in_progress`**  
Stop active campaign (existing sends complete, no new batches).  
*Endpoints*: POST /campaigns/:id/pause

**`get_campaign_performance_report`**  
Get campaign metrics (delivery, open rate, click rate, conversions).  
*Endpoints*: GET /campaigns/:id/analytics, GET /campaigns/:id/executions

**`export_segment_contacts_list`**  
Export contacts from segment to CSV/JSON with all attributes.  
*Endpoints*: GET /segments/:id/members, POST /contacts/export (implied)

**`apply_campaign_to_segment`**  
Enroll all segment contacts in campaign with template.  
*Endpoints*: GET /segments/:id/members, POST /campaigns (with audience config)

---

### 3.6 Channels & Templates (5 tools)

**`setup_whatsapp_channel`**  
Connect WhatsApp inbox to account (QR code or API).  
*Endpoints*: POST /inboxes, POST /inboxes/:id/setup_channel_provider

**`create_message_template_for_channel`**  
Create reusable message template with variables for channel.  
*Endpoints*: POST /inboxes/:id/message_templates, PUT /inboxes/:id/message_templates/:template_id

**`get_assignable_inboxes_for_contact`**  
List inboxes where contact can be contacted.  
*Endpoints*: GET /contacts/:id/contactable_inboxes, GET /inboxes

**`disconnect_channel_integration`**  
Safely disconnect channel (WhatsApp, Instagram, etc.).  
*Endpoints*: POST /inboxes/:id/disconnect_channel_provider

**`bulk_send_template_to_segment`**  
Send template message to all segment contacts via channel.  
*Endpoints*: GET /segments/:id/members, POST /conversations/:id/messages (batch implied)

---

### 3.7 Reports & Insights (5 tools)

**`generate_team_performance_report`**  
Get agent KPIs (response time, resolution rate, CSAT).  
*Endpoints*: GET /reports/agent, GET /reports/team, GET /csat_survey_responses/metrics

**`get_conversation_analytics_by_period`**  
Get conversation volume, sentiment, resolution time by date range.  
*Endpoints*: GET /reports/conversations, GET /reports/summary

**`generate_contact_engagement_report`**  
Contact interaction history, LTV, lifecycle stage.  
*Endpoints*: GET /contacts/:id, GET /reports/summary (custom fields)

**`get_bot_performance_metrics`**  
Chatbot accuracy, handoff rate, conversation completion.  
*Endpoints*: GET /reports/bot_metrics

**`export_custom_report_data`**  
Export data with custom columns/filters to CSV/JSON.  
*Endpoints*: GET /reports (various), POST /contacts/export, GET /csat_survey_responses/download

---

### 3.8 Click Tracking & Links (3 tools)

**`create_tracked_campaign_link`**  
Create short URL with click tracking for campaigns.  
*Endpoints*: POST /click-tracking/links, GET /click-tracking/links/:id/analytics

**`analyze_link_click_performance`**  
Get click metrics by geography, device, campaign.  
*Endpoints*: GET /click-tracking/links/:id/analytics

**`register_custom_domain_for_tracking`**  
Setup custom domain for branded short links.  
*Endpoints*: POST /custom-domains, GET /custom-domains

---

### 3.9 Data Privacy & Compliance (3 tools)

**`export_contact_data_for_gdpr`**  
Export all contact data in portable format (GDPR/LGPD).  
*Endpoints*: GET /data_privacy/export, GET /contacts/:id

**`request_contact_deletion`**  
Initiate GDPR/LGPD contact deletion request.  
*Endpoints*: POST /data_privacy/deletion_request, POST /data_privacy/confirm_deletion

**`manage_contact_consent`**  
Grant/revoke email, SMS, push notification consent for contact.  
*Endpoints*: POST /data_privacy/consents, DELETE /data_privacy/consents/:type

---

### 3.10 Integrations (4 tools)

**`link_conversation_to_linear_issue`**  
Create or link Linear issue to conversation for tracking.  
*Endpoints*: POST /integrations/linear/create_issue, POST /integrations/linear/link_issue

**`link_conversation_to_hubspot_deal`**  
Create or link HubSpot deal to sales conversation.  
*Endpoints*: POST /integrations/hubspot/create_deal, POST /integrations/hubspot/link_deal

**`sync_contact_to_external_crm`**  
Push contact data to HubSpot, Pipedrive, or other CRM.  
*Endpoints*: POST /integrations/hubspot (or equivalent)

**`fetch_external_deal_data`**  
Pull deal info from Linear/HubSpot/Monday into conversation context.  
*Endpoints*: GET /integrations/linear/search_issue, GET /integrations/hubspot/pipelines

---

## 4. TOOL DESIGN PRINCIPLES

1. **Atomic & Task-Oriented**: Each tool solves one business task, not one API call.
2. **Natural Language Friendly**: Tool names and descriptions use business terminology (not technical jargon).
3. **Multi-Step Encapsulation**: Tool may call multiple endpoints internally (e.g., `move_contact_to_pipeline_stage` fetches contact, validates, moves).
4. **Error Handling**: Tools validate inputs, handle rate limits, and provide clear error messages.
5. **Contextual**: Tools integrate CRM data with AI/marketing context (e.g., segment computation, journey enrollment).
6. **Team-First**: Account/workspace context always inherited from auth token.

---

## 5. NOTES & NEXT STEPS

- **Not Exhaustive**: This inventory covers ~70% of high-value endpoints; internal/health/metrics endpoints excluded.
- **Tool Prioritization**: Start with Contacts, Conversations, Agents, Journeys, Campaigns (highest value for AI assistant).
- **ADK Implementation**: Each atomic tool maps to a single NestJS/Rails service method with consistent error handling and response format.
- **Versioning**: API v1 endpoints stable; watch for v2 evolution (reports already split to v2).
- **Auth Model**: All tools use bearer token auth (inherited from EvoAuth service).

---

**Generated**: 2026-05-18  
**By**: AI Interface System PRD Task
