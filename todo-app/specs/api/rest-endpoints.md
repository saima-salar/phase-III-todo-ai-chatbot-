# REST API Endpoints Specification

## Authentication Endpoints
- `POST /auth/register`
  - Request: `{ "email": "string", "password": "string", "first_name": "string?", "last_name": "string?" }`
  - Response: `User`
  - Description: Register a new user account

- `POST /auth/login`
  - Request: `{ "email": "string", "password": "string" }`
  - Response: `{ "access_token": "string", "token_type": "string" }`
  - Description: Authenticate user and return JWT token

## User Endpoints
- `GET /api/user`
  - Response: `User`
  - Description: Get current authenticated user profile
  - Requires: Authorization header with Bearer token

## Task Endpoints
- `GET /api/{user_id}/tasks`
  - Query Params: `completed` (boolean, optional), `sort_by` (string, optional), `sort_order` (string, optional)
  - Response: `Task[]`
  - Description: Get all tasks for a specific user
  - Requires: Authorization header with Bearer token

- `POST /api/{user_id}/tasks`
  - Request: `{ "title": "string", "description": "string?", "completed": "boolean" }`
  - Response: `Task`
  - Description: Create a new task for a user
  - Requires: Authorization header with Bearer token

- `GET /api/{user_id}/tasks/{task_id}`
  - Response: `Task`
  - Description: Get a specific task
  - Requires: Authorization header with Bearer token

- `PUT /api/{user_id}/tasks/{task_id}`
  - Request: `{ "title": "string?", "description": "string?", "completed": "boolean?" }`
  - Response: `Task`
  - Description: Update a specific task
  - Requires: Authorization header with Bearer token

- `DELETE /api/{user_id}/tasks/{task_id}`
  - Response: `{ "message": "string" }`
  - Description: Delete a specific task
  - Requires: Authorization header with Bearer token

- `PATCH /api/{user_id}/tasks/{task_id}/complete`
  - Response: `Task`
  - Description: Toggle completion status of a task
  - Requires: Authorization header with Bearer token

## Models

### User
```
{
  "id": number,
  "email": string,
  "first_name": string?,
  "last_name": string?,
  "created_at": string,
  "updated_at": string?
}
```

### Task
```
{
  "id": number,
  "user_id": number,
  "title": string,
  "description": string?,
  "completed": boolean,
  "created_at": string,
  "updated_at": string?
}
```