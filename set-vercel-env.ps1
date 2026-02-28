# Set Vercel Environment Variables for Production

Write-Host "🔐 Setting Vercel environment variables..." -ForegroundColor Cyan

# Prompt for values instead of hardcoding
# DATABASE_URL
Write-Host "Setting DATABASE_URL..." -ForegroundColor White
Write-Host "⚠️ Enter your DATABASE_URL when prompted (or press Enter to skip):" -ForegroundColor Yellow
Read-Host "DATABASE_URL" | npx vercel env add DATABASE_URL production

# JWT_SECRET
Write-Host "Setting JWT_SECRET..." -ForegroundColor White
Write-Host "⚠️ Enter your JWT_SECRET when prompted (or press Enter to skip):" -ForegroundColor Yellow
Read-Host "JWT_SECRET" | npx vercel env add JWT_SECRET production

# JWT_REFRESH_SECRET
Write-Host "Setting JWT_REFRESH_SECRET..." -ForegroundColor White
Write-Host "⚠️ Enter your JWT_REFRESH_SECRET when prompted (or press Enter to skip):" -ForegroundColor Yellow
Read-Host "JWT_REFRESH_SECRET" | npx vercel env add JWT_REFRESH_SECRET production

# OPENAI_API_KEY
Write-Host "Setting OPENAI_API_KEY..." -ForegroundColor White
Write-Host "⚠️ Enter your OPENAI_API_KEY when prompted (or press Enter to skip):" -ForegroundColor Yellow
Read-Host "OPENAI_API_KEY" | npx vercel env add OPENAI_API_KEY production

# NEXT_PUBLIC_API_URL
Write-Host "Setting NEXT_PUBLIC_API_URL..." -ForegroundColor White
$apiUrl = Read-Host "NEXT_PUBLIC_API_URL (e.g., https://your-app.vercel.app)"
if ($apiUrl) {
    $apiUrl | npx vercel env add NEXT_PUBLIC_API_URL production
}

Write-Host ""
Write-Host "✅ Environment variables setup complete!" -ForegroundColor Green
Write-Host "🚀 Redeploying with new environment variables..." -ForegroundColor Cyan

# Redeploy
npx vercel --prod

Write-Host ""
Write-Host "🎉 Production deployment complete!" -ForegroundColor Green
