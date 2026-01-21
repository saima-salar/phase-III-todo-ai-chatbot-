# System Architecture

## Tech Stack

- Frontend: Next.js 16+ with App Router
- Backend: Python FastAPI
- Database: Neon Serverless PostgreSQL
- ORM: SQLModel
- Authentication: Better Auth

## Architecture Components

### Frontend
- React components using Next.js App Router
- Client-side authentication with Better Auth
- API calls to FastAPI backend

### Backend
- FastAPI server with SQLAlchemy/SQLModel ORM
- JWT-based authentication
- RESTful API endpoints

### Database
- PostgreSQL schema for users and tasks
- Proper indexing for performance

## Security
- JWT tokens for authentication
- User data isolation
- Input validation