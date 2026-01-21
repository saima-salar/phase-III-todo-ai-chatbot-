# ADR 001: Full-Stack Technology Stack Selection

## Status
Accepted

## Date
2026-01-09

## Context
We need to build a full-stack todo application with user authentication, task management, and a responsive UI. The technology stack must support rapid development, be maintainable, and follow modern web development practices.

## Decision
We will use the following technology stack:

- **Frontend**: Next.js 14+ with React and TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **Backend**: FastAPI with Python for high-performance API development
- **Database**: PostgreSQL (with Neon Serverless option)
- **ORM**: SQLModel for type-safe database operations
- **Authentication**: JWT-based custom authentication system
- **Deployment**: Vercel for frontend, Render/Vercel for backend

## Alternatives Considered
- React + Vite vs Next.js: Chose Next.js for built-in routing and SSR capabilities
- Express.js vs FastAPI: Chose FastAPI for automatic API documentation and type validation
- Prisma vs SQLModel: Chose SQLModel for better integration with Python typing
- Traditional JWT vs Better Auth: Chose custom JWT for more control over auth flow

## Consequences
### Positive
- FastAPI provides automatic OpenAPI documentation
- Next.js offers excellent developer experience with hot reloading
- SQLModel provides type safety with SQL databases
- JWT authentication is lightweight and scalable
- Tailwind CSS enables rapid UI development

### Negative
- Learning curve for team members unfamiliar with Python/FastAPI
- Additional complexity in managing two separate applications
- Need to handle CORS between frontend and backend

## Implementation Notes
- Frontend communicates with backend via REST API
- User isolation ensures users can only access their own tasks
- All API endpoints require JWT authentication
- Database schema supports user and task models with proper relationships