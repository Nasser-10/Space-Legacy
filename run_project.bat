@echo off
setlocal
title SPACE LEGACY - The Forgotten Explorers

echo ================================================================
echo   SPACE LEGACY: The Forgotten Explorers
echo   NASA Space Apps Challenge 2026 - Team Musicstarsz
echo ================================================================
echo.

where python >nul 2>nul
if errorlevel 1 (
    echo ERROR: Python was not found on PATH.
    echo Install Python 3.12 or later and enable the PATH option.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js / npm was not found on PATH.
    pause
    exit /b 1
)

set "ROOT=%~dp0"
set "PYTHONPATH=%ROOT%backend"

echo [1/4] Preparing backend database...
if not exist "%ROOT%backend\data\space_legacy.db" (
    pushd "%ROOT%backend"
    python scripts\seed_database.py
    if errorlevel 1 (
        echo ERROR: Database initialization failed.
        popd
        pause
        exit /b 1
    )
    popd
) else (
    echo Existing database found; keeping current local data.
)

echo [2/4] Checking the vector index...
pushd "%ROOT%backend"
python scripts\build_vector_index.py
if errorlevel 1 (
    echo ERROR: Vector index preparation failed.
    popd
    pause
    exit /b 1
)
popd

echo [3/4] Installing frontend dependencies when needed...
if not exist "%ROOT%frontend\node_modules" (
    pushd "%ROOT%frontend"
    call npm install
    if errorlevel 1 (
        echo ERROR: Frontend dependency installation failed.
        popd
        pause
        exit /b 1
    )
    popd
)

echo [4/4] Starting application...
start "SPACE LEGACY - Backend API" cmd /k "cd /d ""%ROOT%backend"" && set PYTHONPATH=%ROOT%backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 /nobreak >nul
start "SPACE LEGACY - Frontend" cmd /k "cd /d ""%ROOT%frontend"" && npm run dev"

echo.
echo Web Application: http://localhost:5173
echo API Documentation: http://localhost:8000/api/v1/docs
echo.
endlocal
