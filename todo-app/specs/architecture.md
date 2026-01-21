# Todo App - Architecture

## System Architecture
The application follows a microservices-like architecture with separate frontend and backend services.

### Frontend Architecture
- Next.js 14+ with App Router
- Client-side authentication using React Context
- API communication through dedicated service layer
- Tailwind CSS for styling with responsive design

### Backend Architecture
- FastAPI for REST API endpoints
- SQLModel for database modeling and ORM
- JWT-based authentication middleware
- PostgreSQL database with connection pooling

### Security Architecture
- JWT tokens for authentication
- User authorization on each API request
- Password hashing with bcrypt
- Input validation and sanitization

## Data Flow
1. User authenticates via login/register
2. JWT token stored in localStorage
3. API requests include Authorization header
4. Backend validates token and user permissions
5. Database operations through SQLModel ORM