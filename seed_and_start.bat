@echo off
echo ========================================
echo   SehatBeat Database Setup & Start
echo ========================================
echo.

echo Step 1: Opening database seeder...
start "" "seed_database.html"

echo.
echo Step 2: Instructions:
echo 1. Click "Check Medicines" to see current database state
echo 2. Click "Seed Database" to add sample medicine data
echo 3. Wait for success message
echo 4. Refresh your Medicine page to see the data
echo.

echo Step 3: Starting frontend server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo           Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Use the seeder page to add data to your database
echo 2. Go to http://localhost:5173 to see your app
echo 3. Navigate to Medicine page to see the loaded medicines
echo.
echo Press any key to close this window...
pause > nul

