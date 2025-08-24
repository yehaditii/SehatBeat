@echo off
echo ========================================
echo    SehatBeat AI Setup Script
echo ========================================
echo.
echo This script will help you set up Perplexity AI integration.
echo.

echo Step 1: Get your Perplexity AI API key
echo - Go to: https://www.perplexity.ai/
echo - Sign up/Login
echo - Go to API section
echo - Generate a new API key
echo - Copy the key (starts with 'pplx-')
echo.
pause

echo.
echo Step 2: Create environment file
echo Creating backend/.env.local file...
echo.

if not exist "backend\.env.local" (
    echo # Convex Configuration > backend\.env.local
    echo NEXT_PUBLIC_CONVEX_URL=http://localhost:8000 >> backend\.env.local
    echo. >> backend\.env.local
    echo # Perplexity AI Configuration >> backend\.env.local
    echo PERPLEXITY_API_KEY=pplx-your_actual_api_key_here >> backend\.env.local
    echo. >> backend\.env.local
    echo # Optional: Clerk for authentication >> backend\.env.local
    echo NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here >> backend\.env.local
    echo CLERK_SECRET_KEY=your_clerk_secret_here >> backend\.env.local
    
    echo ✅ Environment file created!
    echo.
    echo ⚠️  IMPORTANT: Edit backend\.env.local and replace:
    echo    - pplx-your_actual_api_key_here with your real Perplexity API key
    echo    - your_clerk_key_here with your Clerk publishable key (optional)
    echo    - your_clerk_secret_here with your Clerk secret key (optional)
    echo.
) else (
    echo ⚠️  backend\.env.local already exists!
    echo Please edit it manually to add your Perplexity API key.
)

echo.
echo Step 3: Start the services
echo.
echo Open 3 separate terminal windows and run:
echo.
echo Terminal 1 (Backend Convex):
echo   cd backend
echo   npm run dev:convex
echo.
echo Terminal 2 (Backend Next.js):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 3 (Frontend):
echo   cd frontend
echo   npm run dev
echo.

echo Step 4: Test the AI
echo.
echo 1. Open your browser to: http://localhost:5173
echo 2. Click the blue AI chat button
echo 3. Type any symptoms (e.g., "headache", "chest pain")
echo 4. You should now get intelligent AI responses!
echo.

echo ========================================
echo           Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit backend\.env.local with your API key
echo 2. Start all services
echo 3. Test with real symptoms
echo.
echo For help, see PERPLEXITY_AI_SETUP.md
echo.
pause
