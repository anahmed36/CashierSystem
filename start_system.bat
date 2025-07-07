@echo off
TITLE Cashier System - BACKEND

ECHO.
ECHO  ======================================================
ECHO           Starting the Python Backend Server
ECHO  ======================================================
ECHO.
ECHO This window is for the BACKEND.
ECHO A new window will open for the frontend.
ECHO.

REM Check for virtual environment
if not exist "backend\venv\Scripts\activate.bat" (
    ECHO ERROR: Python virtual environment not found in the 'backend' folder!
    ECHO Please run 'python -m venv venv' inside the backend folder first.
    pause
    exit
)

REM --- Activate Python Environment ---
call backend\venv\Scripts\activate.bat

ECHO.
ECHO Starting the Frontend in a new window...
ECHO.

REM --- Launch Frontend in a New Window ---
REM The 'start' command opens a new command prompt.
REM /D "frontend" tells the new window to start in the 'frontend' directory.
REM 'npm run dev' is the command the new window will execute.
start "Cashier System - FRONTEND" cmd /c "cd frontend && npm run dev"


REM --- Start the Backend in THIS window ---
ECHO Starting the Backend in THIS window...
cd backend
flask --app src/main run