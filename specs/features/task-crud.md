# Task CRUD Feature

## Overview
Basic task management functionality allowing users to Create, Read, Update, and Delete tasks.

## Requirements

### Create Task
- User can create a new task with title, description, priority
- Optional fields: tags, due date, estimated duration
- Advanced fields: recurring, reminder, sharing

### Read Tasks
- User can view all their tasks
- Filter tasks by status, priority, tags
- Search tasks by keyword
- Sort tasks by various criteria

### Update Task
- User can modify existing task details
- Update title, description, priority
- Modify tags, due date, status
- Update advanced fields

### Delete Task
- User can permanently delete a task
- Confirmation required for deletion

## API Endpoints

- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{id}` - Get task details
- `PUT /api/{user_id}/tasks/{id}` - Update a task
- `DELETE /api/{user_id}/tasks/{id}` - Delete a task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion

## Security
- All endpoints require authentication
- Users can only access their own tasks
- Proper authorization checks