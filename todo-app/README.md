# Phase II Todo App

This is a full-stack todo application built with Next.js 16+, FastAPI, SQLModel, and Better Auth. The app features user authentication, task management with CRUD operations, filtering and sorting, and a responsive UI with dark/light mode support.

## Features

- User authentication and management with JWT-based auth
- Task creation, reading, updating, and deletion (CRUD operations)
- Task completion tracking
- User-specific task filtering
- Responsive UI with Tailwind CSS
- Dark/light mode support
- Task filtering and sorting capabilities
- Production-ready deployment configuration

## Tech Stack

- **Frontend**: Next.js 14+, React, Tailwind CSS
- **Backend**: FastAPI, Python
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: JWT with custom auth system
- **ORM**: SQLModel
- **Deployment**: Vercel (Frontend), Render/Vercel (Backend)

## Project Structure

```
todo-app/
├── backend/
│   ├── main.py          # FastAPI application with task and auth endpoints
│   ├── models.py        # SQLModel database models
│   ├── auth.py          # Authentication utilities and JWT handling
│   └── requirements.txt # Python dependencies
└── frontend/
    ├── app/
    │   ├── layout.tsx          # Root layout with AuthProvider
    │   ├── page.tsx            # Main todo page
    │   ├── welcome/page.tsx    # Welcome page for unauthenticated users
    │   ├── login/page.tsx      # Login page
    │   ├── register/page.tsx   # Registration page
    │   ├── components/         # UI components
    │   │   └── Navbar.tsx
    │   └── context/            # Authentication context
    │       └── AuthContext.tsx
    ├── lib/
    │   └── api.ts              # API utility functions
    ├── styles/
    │   └── globals.css
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- PostgreSQL database (or Neon Serverless account)

### Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Create a `.env` file in the `backend` directory with:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
BETTER_AUTH_SECRET=your-secret-key-here
```

### Running Locally

1. Navigate to the backend directory and install dependencies:
```bash
cd todo-app/backend
pip install -r requirements.txt
```

2. Start the backend server:
```bash
cd todo-app/backend
uvicorn main:app --reload --port 8000
```

3. Navigate to the frontend directory and install dependencies:
```bash
cd todo-app/frontend
npm install
```

4. Start the frontend development server:
```bash
cd todo-app/frontend
npm run dev
```

The application will be available at http://localhost:3000

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /api/user` - Get current user profile

### Tasks
- `GET /api/{user_id}/tasks` - Get all tasks for a user
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{task_id}` - Get a specific task
- `PUT /api/{user_id}/tasks/{task_id}` - Update a specific task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete a specific task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle task completion

## Security Features

- JWT-based authentication for all API endpoints
- User authorization to ensure users can only access their own tasks
- Password hashing using bcrypt
- SQL injection protection through SQLModel/SQLAlchemy