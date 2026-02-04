# System Status Check
Write-Host "🚀 LinkedIn Automation Extension - System Status" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if server is running
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/database/status" -Method Get
    if ($response.success) {
        Write-Host "✅ Backend Server: Running (Port 3001)" -ForegroundColor Green
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
    $plans = Invoke-RestMethod -Uri "http://localhost:3001/api/plans" -Method Get
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

# Database file status
if (Test-Path "dev.db") {
    $dbSize = (Get-Item "dev.db").Length
    Write-Host "💾 Database File: $([math]::Round($dbSize/1KB, 2)) KB" -ForegroundColor Green
} else {
    Write-Host "❌ Database File: Not found" -ForegroundColor Red
}

Write-Host ""

# Admin credentials
Write-Host "👤 Admin Access:" -ForegroundColor Cyan
Write-Host "   URL: http://localhost:3001/admin-login" -ForegroundColor White  
Write-Host "   Email: admin@linkedin-automation.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White

Write-Host ""

# Extension setup
Write-Host "🔧 Extension Setup:" -ForegroundColor Cyan
Write-Host "   1. Reload extension in chrome://extensions/" -ForegroundColor White
Write-Host "   2. Open popup - should show login screen" -ForegroundColor White
Write-Host "   3. Register new account or use existing one" -ForegroundColor White
Write-Host "   4. All features should work without database errors" -ForegroundColor White

Write-Host ""
Write-Host "System is ready for development!" -ForegroundColor Green
