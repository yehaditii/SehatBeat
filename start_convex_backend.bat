@echo off
echo ========================================
echo Starting Convex Backend for Medicine DB
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Checking if Convex is installed...
cd backend
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting Convex backend...
echo This will start the backend on http://127.0.0.1:3210
echo.
echo Press Ctrl+C to stop the backend
echo.

npx convex dev

pause
