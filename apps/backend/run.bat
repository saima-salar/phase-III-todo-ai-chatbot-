@echo off
REM Script to run the backend server from the monorepo root

cd /d "%~dp0..\.."
cd apps/backend

REM Run the Python server
python server.py