# EVO AI Interface System - Tools Inventory & Atomic Tools Proposal

## Overview

This folder contains a comprehensive inventory of API endpoints from the 4 core EVO CRM services, plus a proposal for 60 atomic ADK tools designed to encapsulate high-value business tasks.

## Generated Documents

### 1. **[C]tools-inventory-ai-interface-system.md** (30 KB, 743 lines)
**The Main Document** - Comprehensive inventory with 5 sections:

- **Section 1**: Full endpoint inventory for all 4 services (335+ endpoints)
- **Section 2**: Key business entities across services
- **Section 3**: Proposed 60 atomic tools organized by business domain
- **Section 4**: Design principles for ADK tool implementation
- **Section 5**: Notes and next steps for PRD integration

**Read this first for complete technical reference.**

### 2. **TOOLS-INVENTORY-SUMMARY.txt** (6 KB)
**Executive Summary** - High-level overview including:
- Service breakdown (endpoints per service)
- All 60 tools grouped by domain (10 categories)
- Key design principles
- Coverage gaps and next steps

**Read this for stakeholder meetings/reviews.**

### 3. **QUICK-REFERENCE.md** (7 KB)
**Developer Cheat Sheet** - Fast lookup including:
- Services at a glance (table)
- Top 15 high-value tools
- Key endpoints by domain (50+ most-used)
- Authentication, rate limiting, response format
- Tool implementation checklist
- Phased roadmap

**Keep this open while coding.**

## Key Insights

### Services Inventoried

| Service | Tech | Endpoints | Key Domains |
|---------|------|-----------|-------------|
| **CRM** | Rails | 160+ | Contacts, Conversations, Pipelines, Agents, Channels |
| **Auth** | Rails + Devise | 45+ | Auth, Profile, MFA, Users, Roles, Privacy |
| **AI Core** | Go/Gin | 50+ | AI Agents, Custom Tools, MCP Servers, Folders |
| **EvoFlow** | NestJS | 80+ | Events, Journeys, Campaigns, Segments, Click Tracking |

### Atomic Tools (60 Total)

Organized by business value, NOT by service or endpoint:

```
Contacts & Pipeline (8)       Conversations & Messaging (7)    Agents & Tools (9)
Journeys & Automation (8)     Campaigns & Segments (8)         Channels & Templates (5)
Reports & Insights (5)        Click Tracking (3)               Privacy & Compliance (3)
Integrations (4)
```

### Coverage

- **High-Value**: ~70% of core CRM/marketing functionality
- **Not Exhaustive**: Health checks, internal endpoints, metrics excluded
- **Not 1:1 Mapping**: Deliberately grouped to reduce AI agent complexity

## Implementation Strategy

### Phase 1: Foundation (Week 1-2)
- Contacts (CRUD, import, merge)
- Conversations (send, search, history)
- Basic Agents (create, config)

### Phase 2: Marketing (Week 3-4)
- Journeys (create, trigger, pause)
- Campaigns (create, execute, pause)
- Segments (create, compute, analytics)

### Phase 3: Operations (Week 5-6)
- Channels (setup, templates, send)
- Reports (KPIs, analytics, exports)
- Compliance (GDPR, consent)

### Phase 4: Integrations (Week 7-8)
- External CRM sync (Linear, HubSpot)
- Click tracking (links, domains)
- Advanced features (folder sharing, bulk actions)

## Using These Documents

### For Product Managers
1. Read **TOOLS-INVENTORY-SUMMARY.txt** (5 min)
2. Review **[C]tools-inventory-ai-interface-system.md** sections 2-4 (15 min)
3. Validate against business requirements

### For Engineers
1. Start with **QUICK-REFERENCE.md** (10 min)
2. Deep-dive **[C]tools-inventory-ai-interface-system.md** section 3 (30 min)
3. Reference section 4 (design principles) during implementation

### For Integration Partners
1. Read **TOOLS-INVENTORY-SUMMARY.txt** (5 min)
2. Review **QUICK-REFERENCE.md** "Key Endpoints by Domain" (10 min)
3. Check specific tool definition in main document

## Key Decision Points for PRD

1. **Prioritization**: Start with tools 3.1-3.5 (Contacts through Campaigns)
2. **Scope**: Which of the 10 tool categories in Phase 1?
3. **Implementation**: NestJS controllers or separate ADK service?
4. **Testing**: E2E coverage depth for each tool?
5. **Rate Limiting**: Current limits sufficient or tune per domain?

## Technical Notes

- **Authentication**: All tools use bearer token from EvoAuth service
- **Response Format**: Consistent JSON envelope (see QUICK-REFERENCE)
- **Multi-Step**: Each tool may call 3-5 endpoints internally
- **Error Handling**: Built-in validation, rate limiting, clear messages
- **Integration**: OpenTelemetry tracing compatible

## Files Structure

```
ai-interface-system/
├── README.md (this file)
├── [C]tools-inventory-ai-interface-system.md  (main document - 30KB)
├── TOOLS-INVENTORY-SUMMARY.txt               (executive summary - 6KB)
├── QUICK-REFERENCE.md                        (developer cheat sheet - 7KB)
└── prd.md                                     (PRD artifact, if exists)
```

## Next Steps

1. **Review & Validate**: Team review of 60 tools against business needs
2. **Prioritize**: Lock Phase 1 tool list (recommend 30-35 tools)
3. **Spec**: Create detailed spec for first batch of tools
4. **Implement**: Build as NestJS controllers or separate service
5. **Test**: E2E tests for each tool (happy path + errors)
6. **Document**: API reference + SDK examples

## Contact & Questions

For questions or clarifications on:
- Specific tool definitions → See main document section 3
- Implementation approach → See QUICK-REFERENCE checklist
- Business mapping → See main document section 4 (principles)

---

**Generated**: 2026-05-18  
**Version**: 1.0 - Draft for PRD Review  
**Status**: Ready for stakeholder review
