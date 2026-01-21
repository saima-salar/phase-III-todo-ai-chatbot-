@echo off
echo Starting Todo Full-Stack Application...
echo.

echo Setting up environment variables...
set DATABASE_URL=sqlite:///./todo.db
set BETTER_AUTH_JWT_SECRET=dev-secret-key-change-in-production
set BETTER_AUTH_SECRET=secret-that-is-at-least-32-characters-long-for-dev
set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
set NEXT_PUBLIC_BETTER_AUTH_JWT_SECRET=dev-secret-key-change-in-production
set NEXT_PUBLIC_APP_URL=http://localhost:3001

echo.
echo Starting Backend Server in a new window...
start "Todo Backend" cmd /k "cd /d "F:\todo-full-stack-web-application\todo-app\backend" && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server in a new window...
start "Todo Frontend" cmd /k "cd /d "F:\todo-full-stack-web-application\todo-app\frontend" && npm run dev"

echo.
echo Servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3001 (or next available port)
echo.
echo Press any key to exit...
pause >nul