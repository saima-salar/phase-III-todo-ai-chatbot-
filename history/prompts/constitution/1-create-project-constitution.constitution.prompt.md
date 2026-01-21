---
id: 1
title: Create Project Constitution
stage: constitution
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: user
command: sp.constitution
labels: [constitution,spec-driven-development,todo-app]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - /specs/sp.constitution.md
tests:
 - none
---

## Prompt

 You are an expert Claude Code agent for the Phase II Todo Full-Stack Web App Hackathon.
Your task is to create a **detailed project constitution** file: `/specs/sp.constitution.md`.

Follow these instructions strictly:

1. **Project Mandate**
   - All development must strictly follow **Spec-Kit Plus** workflow.
   - No manual coding allowed; all implementation must be done using **Claude Code agents and skills**.
   - Every feature, API endpoint, frontend component, and database model must comply with **Spec-Kit Plus specs**.

2. **Project Overview Section**
   - Phase II: Full-Stack Web App (Next.js 16+, FastAPI, SQLModel, Better Auth)
   - Multi-user, JWT-secured, spec-driven development
   - Persistent storage in Neon Serverless PostgreSQL
   - List all 5 basic features as objectives.

3. **Workflow Rules**
   - All code generation must reference **Spec-Kit Plus specs** before implementation.
   - Agents must read CLAUDE.md before generating code.
   - Every feature must be broken into tasks and assigned to appropriate agents.
   - Skills must be called according to their purpose (e.g., GenerateCodeFromSpec, CreateAPIEndpoint, CreateDatabaseModel, etc.).
   - Any deviation must be corrected using the `IterateFix` skill.

4. **Agents & Responsibilities**
   - **TodoMasterAgent**: Orchestrates tasks, assigns agents, validates overall compliance.
   - **BackendAgent**: Generates FastAPI code, endpoints, models, JWT middleware.
   - **FrontendAgent**: Generates Next.js pages/components, connects APIs, applies Tailwind styling.
   - **AuthAgent**: Handles Better Auth, JWT issuance, verification.
   - **SpecValidationAgent**: Validates code against Spec-Kit Plus specs and acceptance criteria.

5. **API Rules**
   - Include RESTful endpoints:
     GET /api/{user_id}/tasks
     POST /api/{user_id}/tasks
     GET /api/{user_id}/tasks/{id}
     PUT /api/{user_id}/tasks/{id}
     DELETE /api/{user_id}/tasks/{id}
     PATCH /api/{user_id}/tasks/{id}/complete
   - All backend requests must validate JWT using `BETTER_AUTH_SECRET`.
   - Backend must return **only data for authenticated user**.
   - Invalid or missing tokens → 401 Unauthorized.

6. **Authentication Rules**
   - Use **Better Auth** on frontend.
   - Frontend must send JWT token in `Authorization` header.
   - Backend verifies JWT, extracts user ID, and filters data accordingly.
   - Tokens must expire (e.g., 7 days).

7. **Frontend Rules**
   - All API calls must go through `/lib/api.ts`.
   - Use server components by default; client components only when interactivity is needed.
   - Tailwind CSS must be used; no inline styles allowed.
   - Components must be reusable and follow Next.js 16 conventions.

8. **Database Rules**
   - Use SQLModel for all database operations.
   - Schema must match @specs/database/schema.md.
   - Tables: `users` (Better Auth managed), `tasks` (with user_id, title, description, completed, timestamps).
   - Indexes for user_id and completed status must exist.

9. **Skill Usage**
   - Only use **10 reusable skills** in `.claude/skills`.
   - Skills must be called appropriately per task:
     - Code generation
     - API creation
     - Database modeling
     - Frontend components
     - JWT validation
     - Data filtering
     - Testing
     - Deployment

10. **Validation**
    - Every feature must satisfy acceptance criteria from Spec-Kit Plus.
    - Any failing code must be corrected using `IterateFix`.
    - SpecValidationAgent ensures full compliance before moving to next feature.

11. **Deployment Rules**
    - Frontend deployable on Vercel.
    - Backend deployable on Render or Vercel Serverless.
    - Required environment variables:
      - `DATABASE_URL`
      - `BETTER_AUTH_SECRET`
    - Use `DeployProject` skill to automate deployment.

12. **Bottom Line**
    - Claude Code and all agents **must strictly follow this constitution**.
    - Spec-Kit Plus is mandatory for everything.
    - All code, API, frontend, database, auth, and deployment logic must comply fully.

**Deliverable Format for Claude Code:**
- Generate a markdown file `/specs/sp.constitution.md`.
- Include sections:
  1. Project Mandate
  2. Project Overview
  3. Workflow Rules
  4. Agents & Responsibilities
  5. API Rules
  6. Authentication Rules
  7. Frontend Rules
  8. Database Rules
  9. Skill Usage
  10. Validation
  11. Deployment Rules
  12. Bottom Line
- Use headings, bullet points, and tables where appropriate for clarity.

## Response snapshot

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

## Outcome

- ✅ Impact: Created the required project constitution file with all 12 specified sections
- 🧪 Tests: none
- 📁 Files: Created /specs/sp.constitution.md with detailed constitution
- 🔁 Next prompts: Ready to proceed with spec, plan, and task creation
- 🧠 Reflection: Constitution provides clear governance and workflow rules for the todo app project

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A