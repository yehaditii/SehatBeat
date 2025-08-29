@echo off
echo ========================================
echo    Document Storage System Setup
echo ========================================
echo.

echo [1/4] Checking Convex backend...
cd backend
if not exist "convex" (
    echo ❌ Convex directory not found!
    echo Please ensure you're in the correct directory.
    pause
    exit /b 1
)

echo ✅ Convex backend found
echo.

echo [2/4] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
echo.

echo [3/4] Starting Convex development server...
start "Convex Dev Server" cmd /k "npx convex dev"
echo ✅ Convex development server started in new window
echo.

echo [4/4] Opening test page...
cd ..
start test_document_storage.html
echo ✅ Test page opened in browser
echo.

echo ========================================
echo           Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Wait for Convex server to fully start
echo 2. Test the health check button in the browser
echo 3. Try uploading a test document
echo 4. Check the Convex dashboard for new documents
echo.
echo For help, see DOCUMENT_STORAGE_SETUP.md
echo.
pause
