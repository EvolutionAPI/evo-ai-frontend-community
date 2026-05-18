# EVO AI Interface System - Quick Reference Guide

## Services at a Glance

| Service | Tech Stack | Base URL | Key Endpoints |
|---------|-----------|----------|---------------|
| **CRM** (evo-ai-crm-community) | Rails REST | `/api/v1/` | /contacts, /conversations, /pipelines, /agents |
| **Auth** (evo-auth-service-community) | Rails + Devise | `/api/v1/auth`, `/api/v1/` | /auth, /profile, /mfa, /users, /roles |
| **AI Core** (evo-ai-core-service-community) | Go/Gin | `/api/v1/` | /agents, /custom_tools, /mcp_servers, /folders |
| **EvoFlow** (evo-flow) | NestJS + TypeORM | `/api/v1/` | /events, /journeys, /campaigns, /segments |

## Domain Grouping (60 Tools Total)

```
Contacts & Pipeline (8)        → Contact CRUD, Deals, Labels, Merging
Conversations & Messaging (7)  → Message Send, History, Bulk Actions
Agents & Tools (9)             → Agent Config, Custom Tools, MCP, Folders
Journeys & Automation (8)      → Workflow Creation, Triggers, Pausing
Campaigns & Segments (8)       → Audience, Campaign Execution, Analytics
Channels & Templates (5)       → Inbox Setup, Message Templates
Reports & Insights (5)         → KPIs, Analytics, Exports
Click Tracking (3)             → Tracked Links, Domains
Privacy & Compliance (3)       → GDPR/LGPD, Consent Management
Integrations (4)               → Linear, HubSpot, External CRM Sync
```

## Top 15 High-Value Tools (Start Here)

1. `create_contact_with_attributes` — Contact CRUD + attributes
2. `get_contact_full_history` — Timeline of interactions
3. `send_message_to_contact` — Send via any channel
4. `move_contact_to_pipeline_stage` — Deals management
5. `create_agent_with_tools_and_mcp` — AI agent setup
6. `create_segment_with_filter_conditions` — Audience targeting
7. `create_campaign_from_template` — Campaign orchestration
8. `trigger_journey_for_segment` — Automation enrollment
9. `create_journey_with_nodes_and_edges` — Workflow design
10. `schedule_campaign_execution` — Campaign scheduling
11. `get_campaign_performance_report` — ROI tracking
12. `summarize_contact_conversation_history` — AI summarization
13. `bulk_import_contacts_from_file` — Data onboarding
14. `pause_resume_journey` — Workflow control
15. `link_conversation_to_linear_issue` — Cross-tool integration

## Key Endpoints by Domain

### Contacts (Top 10)
```
GET    /contacts                    List all
GET    /contacts/:id                Get one
POST   /contacts                    Create
PUT    /contacts/:id                Update
DELETE /contacts/:id                Delete
POST   /contacts/import             Bulk import
POST   /contacts/export             Bulk export
POST   /contacts/filter             Advanced filtering
GET    /contacts/search             Full-text search
POST   /actions/contact_merge       Merge two contacts
```

### Conversations (Top 10)
```
GET    /conversations               List all
GET    /conversations/:id           Get one
POST   /conversations               Create
PUT    /conversations/:id           Update
GET    /conversations/:id/messages  Get messages
POST   /conversations/:id/messages  Send message
POST   /conversations/:id/mute      Mute thread
POST   /conversations/:id/archive   Archive
POST   /conversations/:id/labels    Add label
GET    /conversations/search        Search messages
```

### Agents & AI (Top 10)
```
GET    /agents                      List agents
POST   /agents                      Create agent
GET    /agents/:id                  Get agent
PUT    /agents/:id                  Update agent
GET    /custom_tools                List tools
POST   /custom_tools                Create tool
GET    /mcp_servers                 List MCP servers
POST   /mcp_servers                 Register MCP
POST   /agents/apikeys              Create API key
DELETE /agents/apikeys/:id          Revoke key
```

### Journeys (Top 10)
```
GET    /journeys                    List journeys
POST   /journeys                    Create journey
GET    /journeys/:id                Get journey
PUT    /journeys/:id                Update definition
DELETE /journeys/:id                Delete
POST   /journeys/:id/publish        Go live
POST   /journeys/:id/pause          Pause
GET    /journeys/:id/sessions       Active enrollments
GET    /journeys/:id/analytics      Performance metrics
POST   /scheduled_actions           One-time actions
```

### Campaigns (Top 10)
```
GET    /campaigns                   List campaigns
POST   /campaigns                   Create campaign
GET    /campaigns/:id               Get campaign
PUT    /campaigns/:id               Update
POST   /campaigns/:id/execute       Start execution
GET    /campaigns/:id/executions    Run history
GET    /campaigns/:id/analytics     Performance
GET    /segments                    List segments
POST   /segments                    Create segment
POST   /segments/:id/compute        Compute audience
```

## Authentication & Authorization

**Bearer Token**: All requests include `Authorization: Bearer <token>` from Auth service

**Required Scopes** (by tool domain):
- `ai_agents:read/create/update/delete` — Agent management
- `contacts:read/create/update/delete` — Contact CRUD
- `conversations:read/create/update/delete` — Message management
- `campaigns:read/create/update/delete` — Campaign access
- `journeys:read/create/update/delete` — Journey workflows
- `segments:read/create/update/delete` — Audience targeting

## Rate Limiting

- **Global**: 1000 req/sec per account
- **Per-Client**: 100 req/sec per API key
- **Burst**: 200 requests allowed in 10sec window

## Common Response Format

```json
{
  "success": true,
  "data": { /* entity data */ },
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 10
  }
}
```

## Error Handling

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid contact email",
    "details": [
      { "field": "email", "message": "Invalid format" }
    ]
  }
}
```

## Tool Implementation Checklist

For each atomic tool, ensure:

- [ ] Input validation DTO with JSDoc
- [ ] Multi-step orchestration logic (may call 3-5 endpoints)
- [ ] Error handling + clear messages
- [ ] Rate limit awareness
- [ ] Logging/tracing (OpenTelemetry compatible)
- [ ] E2E tests (happy path + error cases)
- [ ] Response envelope consistency
- [ ] Permission checks (via EvoAuth)
- [ ] Documentation with example usage
- [ ] Performance monitoring

## Roadmap Integration

**Phase 1** (Week 1-2): Contacts, Conversations, Basic Agents  
**Phase 2** (Week 3-4): Journeys, Campaigns, Segments  
**Phase 3** (Week 5-6): Channels, Reports, Compliance  
**Phase 4** (Week 7-8): Integrations, Click Tracking, Advanced Features

---

**Last Updated**: 2026-05-18  
**Document**: Part of EVO AI Interface System PRD
