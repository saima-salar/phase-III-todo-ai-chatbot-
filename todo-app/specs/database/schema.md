# Database Schema Specification

## Overview
The application uses PostgreSQL as the primary database with SQLModel for ORM mapping.

## Tables

### users
```
id: INTEGER (Primary Key, Auto-increment)
email: VARCHAR(255) (Unique, Not Null)
hashed_password: VARCHAR(255) (Not Null)
first_name: VARCHAR(100) (Nullable)
last_name: VARCHAR(100) (Nullable)
created_at: TIMESTAMP (Not Null, Default: NOW())
updated_at: TIMESTAMP (Nullable)
```

### tasks
```
id: INTEGER (Primary Key, Auto-increment)
user_id: INTEGER (Foreign Key to users.id, Not Null)
title: VARCHAR(255) (Not Null)
description: TEXT (Nullable)
completed: BOOLEAN (Not Null, Default: FALSE)
created_at: TIMESTAMP (Not Null, Default: NOW())
updated_at: TIMESTAMP (Nullable)
```

## Relationships
- One user can have many tasks (user_id foreign key in tasks table)
- Tasks are always associated with a user

## Indexes
- Index on users.email for fast login lookups
- Index on tasks.user_id for efficient task retrieval by user
- Index on tasks.completed for filtering operations

## Constraints
- Email uniqueness in users table
- Foreign key constraint ensuring tasks.user_id references valid user
- Not null constraints on required fields