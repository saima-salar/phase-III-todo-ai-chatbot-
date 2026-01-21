# Authentication Feature

## Overview
User authentication system using Better Auth with JWT tokens for secure communication with FastAPI backend.

## Requirements

### User Registration
- User can register with email and password
- Optional first and last name
- Account validation

### User Login
- User can login with email and password
- JWT token issued upon successful login
- Session management

### User Logout
- User can securely logout
- Session termination

### JWT Integration
- Better Auth generates JWT tokens
- FastAPI backend validates JWT tokens
- User ID extracted from JWT for authorization
- Token expiration handling

## API Endpoints

### Better Auth Endpoints
- `/api/auth/signin` - User login
- `/api/auth/signup` - User registration
- `/api/auth/signout` - User logout

### Secured Task Endpoints
- All task endpoints require valid JWT token
- User ID in token validated against URL parameter
- Unauthorized requests return 401

## Security
- JWT tokens with configurable expiration
- Secure token storage
- Proper token validation
- User isolation through token-based authorization