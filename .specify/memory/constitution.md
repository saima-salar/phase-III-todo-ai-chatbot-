<!--
Sync Impact Report:
- Version change: N/A → 1.0.0
- List of modified principles: [PRINCIPLE_1_NAME] → Project Mandate, [PRINCIPLE_2_NAME] → Project Overview, [PRINCIPLE_3_NAME] → Workflow Rules, [PRINCIPLE_4_NAME] → Agents & Responsibilities, [PRINCIPLE_5_NAME] → API Rules, [PRINCIPLE_6_NAME] → Authentication Rules
- Added sections: Frontend Rules, Database Rules, Skill Usage, Validation, Deployment Rules, Bottom Line
- Removed sections: None (replaced placeholders)
- Templates requiring updates: ✅ updated / ⚠ pending: .specify/templates/plan-template.md, .specify/templates/spec-template.md, .specify/templates/tasks-template.md
- Follow-up TODOs: None
-->
# Phase II Todo Full-Stack Web App Constitution

## Project Mandate

All development must strictly follow **Spec-Kit Plus** workflow. No manual coding allowed; all implementation must be done using **Claude Code agents and skills**. Every feature, API endpoint, frontend component, and database model must comply with **Spec-Kit Plus specs**.

## Project Overview

Phase II: Full-Stack Web App (Next.js 16+, FastAPI, SQLModel, Better Auth). Multi-user, JWT-secured, spec-driven development. Persistent storage in Neon Serverless PostgreSQL. The 5 basic features as objectives are:

1. User authentication and management
2. Task creation, reading, updating, and deletion (CRUD operations)
3. Task completion tracking
4. User-specific task filtering
5. Responsive UI with Tailwind styling

## Workflow Rules

All code generation must reference **Spec-Kit Plus specs** before implementation. Agents must read CLAUDE.md before generating code. Every feature must be broken into tasks and assigned to appropriate agents. Skills must be called according to their purpose (e.g., GenerateCodeFromSpec, CreateAPIEndpoint, CreateDatabaseModel, etc.). Any deviation must be corrected using the `IterateFix` skill.

## Agents & Responsibilities

- **TodoMasterAgent**: Orchestrates tasks, assigns agents, validates overall compliance.
- **BackendAgent**: Generates FastAPI code, endpoints, models, JWT middleware.
- **FrontendAgent**: Generates Next.js pages/components, connects APIs, applies Tailwind styling.
- **AuthAgent**: Handles Better Auth, JWT issuance, verification.
- **SpecValidationAgent**: Validates code against Spec-Kit Plus specs and acceptance criteria.

## API Rules

Include RESTful endpoints:
- GET /api/{user_id}/tasks
- POST /api/{user_id}/tasks
- GET /api/{user_id}/tasks/{id}
- PUT /api/{user_id}/tasks/{id}
- DELETE /api/{user_id}/tasks/{id}
- PATCH /api/{user_id}/tasks/{id}/complete

All backend requests must validate JWT using `BETTER_AUTH_SECRET`. Backend must return **only data for authenticated user**. Invalid or missing tokens → 401 Unauthorized.

## Authentication Rules

Use **Better Auth** on frontend. Frontend must send JWT token in `Authorization` header. Backend verifies JWT, extracts user ID, and filters data accordingly. Tokens must expire (e.g., 7 days).

## Frontend Rules

All API calls must go through `/lib/api.ts`. Use server components by default; client components only when interactivity is needed. Tailwind CSS must be used; no inline styles allowed. Components must be reusable and follow Next.js 16 conventions.

## Database Rules

Use SQLModel for all database operations. Schema must match @specs/database/schema.md. Tables: `users` (Better Auth managed), `tasks` (with user_id, title, description, completed, timestamps). Indexes for user_id and completed status must exist.

## Skill Usage

Only use **10 reusable skills** in `.claude/skills`. Skills must be called appropriately per task:
- Code generation
- API creation
- Database modeling
- Frontend components
- JWT validation
- Data filtering
- Testing
- Deployment

## Validation

Every feature must satisfy acceptance criteria from Spec-Kit Plus. Any failing code must be corrected using `IterateFix`. SpecValidationAgent ensures full compliance before moving to next feature.

## Deployment Rules

Frontend deployable on Vercel. Backend deployable on Render or Vercel Serverless. Required environment variables:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`

Use `DeployProject` skill to automate deployment.

## Bottom Line

Claude Code and all agents **must strictly follow this constitution**. Spec-Kit Plus is mandatory for everything. All code, API, frontend, database, auth, and deployment logic must comply fully.

## Governance

This constitution governs all development activities for the Phase II Todo Full-Stack Web App project. All team members must adhere to these principles and rules. Any deviations must be documented and approved through the proper channels. Regular compliance reviews should be conducted to ensure ongoing adherence to these standards.

**Version**: 1.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-08
