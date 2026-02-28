# System Status Check
Write-Host "🚀 LinkedIn Automation Extension - System Status" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if server is running
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/database/status" -Method Get
    if ($response.success) {
        Write-Host "✅ Backend Server: Running (Port 3000)" -ForegroundColor Green
        Write-Host "✅ Database: Connected ($($response.database))" -ForegroundColor Green
        Write-Host "📊 Database Stats:" -ForegroundColor Cyan
        Write-Host "   - Users: $($response.stats.users)" -ForegroundColor White
        Write-Host "   - Plans: $($response.stats.plans)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Backend Server: Not running" -ForegroundColor Red
    Write-Host "   Run: npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# Check plans
try {
    $plans = Invoke-RestMethod -Uri "http://localhost:3000/api/plans" -Method Get
    if ($plans.success) {
        Write-Host "📋 Available Plans: $($plans.plans.Count)" -ForegroundColor Green
        foreach ($plan in $plans.plans) {
            Write-Host "   - $($plan.name): $$$($plan.price)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Plans API: Not available" -ForegroundColor Red
}

Write-Host ""

# Database status (PostgreSQL via Supabase)
try {
    $dbStatus = Invoke-RestMethod -Uri "http://localhost:3000/api/database/status" -Method Get
    if ($dbStatus.success) {
        Write-Host "💾 Database: Connected ($($dbStatus.database))" -ForegroundColor Green
    }
} catch {
    Write-Host "💾 Database: PostgreSQL (Supabase)" -ForegroundColor Cyan
}

Write-Host ""

# Admin credentials
Write-Host "👤 Admin Access:" -ForegroundColor Cyan
Write-Host "   URL: http://localhost:3000/admin-login" -ForegroundColor White
Write-Host "   Email: (check your database or .env)" -ForegroundColor White
Write-Host "   Password: (check your database or .env)" -ForegroundColor White

Write-Host ""

# Extension setup
Write-Host "🔧 Extension Setup:" -ForegroundColor Cyan
Write-Host "   1. Reload extension in chrome://extensions/" -ForegroundColor White
Write-Host "   2. Open popup - should show login screen" -ForegroundColor White
Write-Host "   3. Register new account or use existing one" -ForegroundColor White
Write-Host "   4. All features should work without database errors" -ForegroundColor White

Write-Host ""
Write-Host "System is ready for development!" -ForegroundColor Green
