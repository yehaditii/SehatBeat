@echo off
echo Creating .env.local file for SehatBeat backend...
echo.

REM Create the .env.local file
echo # Convex Configuration > .env.local
echo NEXT_PUBLIC_CONVEX_URL=http://localhost:8000 >> .env.local
echo. >> .env.local
echo # Clerk Configuration (you'll need to add your actual Clerk keys) >> .env.local
echo NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here >> .env.local
echo CLERK_SECRET_KEY=your_clerk_secret_key_here >> .env.local

echo .env.local file created successfully!
echo.
echo Next steps:
echo 1. Edit .env.local and add your actual Clerk keys
echo 2. Start Convex dev server: npm run dev:convex
echo 3. Start Next.js dev server: npm run dev
echo.
echo Press any key to continue...
pause > nul

