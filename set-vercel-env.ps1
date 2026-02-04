# Set Vercel Environment Variables for Production

Write-Host "🔐 Setting Vercel environment variables..." -ForegroundColor Cyan

# DATABASE_URL
Write-Host "Setting DATABASE_URL..." -ForegroundColor White
"file:./prod.db" | npx vercel env add DATABASE_URL production

# JWT_SECRET
Write-Host "Setting JWT_SECRET..." -ForegroundColor White
"linkedin-automation-super-secret-jwt-key-min-32-characters-long-2024" | npx vercel env add JWT_SECRET production

# JWT_REFRESH_SECRET
Write-Host "Setting JWT_REFRESH_SECRET..." -ForegroundColor White
"linkedin-automation-super-secret-refresh-key-min-32-characters-long-2024" | npx vercel env add JWT_REFRESH_SECRET production

# OPENAI_API_KEY
Write-Host "Setting OPENAI_API_KEY..." -ForegroundColor White
"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" | npx vercel env add OPENAI_API_KEY production

# NEXT_PUBLIC_API_URL
Write-Host "Setting NEXT_PUBLIC_API_URL..." -ForegroundColor White
"https://backend-3p0emrl1u-arwebcrafts-projects-eca5234b.vercel.app" | npx vercel env add NEXT_PUBLIC_API_URL production

Write-Host ""
Write-Host "✅ All environment variables set!" -ForegroundColor Green
Write-Host "🚀 Redeploying with new environment variables..." -ForegroundColor Cyan

# Redeploy
npx vercel --prod

Write-Host ""
Write-Host "🎉 Production deployment complete!" -ForegroundColor Green
