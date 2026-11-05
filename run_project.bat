@echo off
title SPACE LEGACY - The Forgotten Explorers Launcher
echo =====================================================================
echo    SPACE LEGACY: The Forgotten Explorers
echo    NASA Space Apps Challenge 2026 - Team Musicstarsz
echo =====================================================================
echo.

set PATH=C:\Program Files\nodejs;%PATH%
set PYTHONPATH=%~dp0backend

echo [1/3] Verifying SQLite database and ChromaDB vector embeddings...
start "SPACE LEGACY - Backend API" cmd /k "cd /d %~dp0backend && M:\Python312\python.exe scripts\seed_database.py && M:\Python312\python.exe scripts\build_vector_index.py && M:\Python312\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Waiting for Backend to bind port 8000...
timeout /t 4 /nobreak >nul

echo [3/3] Launching React Vite Frontend at http://localhost:5173...
start "SPACE LEGACY - Web Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================================
echo  Web Application running at: http://localhost:5173
echo  FastAPI Swagger API docs at: http://localhost:8000/api/v1/docs
echo =====================================================================
echo.
pause
