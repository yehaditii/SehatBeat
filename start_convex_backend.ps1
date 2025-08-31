# PowerShell script to start Convex Backend for Medicine DB
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Convex Backend for Medicine DB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking if Node.js is installed..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Checking if Convex is installed..." -ForegroundColor Yellow

# Change to backend directory
if (Test-Path "backend") {
    Set-Location "backend"
} else {
    Write-Host "ERROR: Backend directory not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    } catch {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "Starting Convex backend..." -ForegroundColor Green
Write-Host "This will start the backend on http://127.0.0.1:3210" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the backend" -ForegroundColor Yellow
Write-Host ""

# Start Convex
try {
    npx convex dev
} catch {
    Write-Host "ERROR: Failed to start Convex backend" -ForegroundColor Red
    Write-Host "Make sure you have the correct permissions and dependencies installed" -ForegroundColor Red
}

Read-Host "Press Enter to exit"
