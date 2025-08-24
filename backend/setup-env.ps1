Write-Host "Creating .env.local file for SehatBeat backend..." -ForegroundColor Green
Write-Host ""

# Create the .env.local file
$envContent = @"
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=http://localhost:8000

# Clerk Configuration (you'll need to add your actual Clerk keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Perplexity AI Configuration (for symptom analysis)
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Deployment used by `npx convex dev`
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host ".env.local file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.local and add your actual Clerk keys" -ForegroundColor White
Write-Host "2. Edit .env.local and add your Perplexity AI API key" -ForegroundColor White
Write-Host "3. Start Convex dev server: npm run dev:convex" -ForegroundColor White
Write-Host "4. Start Next.js dev server: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

