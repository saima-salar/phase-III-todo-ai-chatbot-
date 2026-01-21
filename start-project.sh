#!/bin/bash
echo "Starting Todo Full-Stack Application..."
echo

echo "Setting up environment variables..."
export DATABASE_URL="sqlite:///./todo.db"
export BETTER_AUTH_JWT_SECRET="dev-secret-key-change-in-production"
export BETTER_AUTH_SECRET="secret-that-is-at-least-32-characters-long-for-dev"
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8000"
export NEXT_PUBLIC_BETTER_AUTH_JWT_SECRET="dev-secret-key-change-in-production"
export NEXT_PUBLIC_APP_URL="http://localhost:3001"

echo
echo "Starting Backend Server in background..."
cd ./todo-app/backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &

echo
echo "Waiting for backend to start..."
sleep 5

echo
echo "Starting Frontend Server in background..."
cd ./todo-app/frontend && npm run dev &

echo
echo "Servers are starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3001 (or next available port)"
echo
echo "Application is now running!"