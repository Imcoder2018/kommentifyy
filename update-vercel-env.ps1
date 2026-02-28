# Update Vercel Environment Variables for Production
Write-Host "🚀 Updating Vercel environment variables..." -ForegroundColor Green

# Set the new DATABASE_URL for production
Write-Host "📝 Setting DATABASE_URL for production..."
npx vercel env rm DATABASE_URL production --yes 2>$null
# You'll need to manually add the Supabase PostgreSQL URL

Write-Host ""
Write-Host "⚠️ MANUAL STEP REQUIRED:" -ForegroundColor Yellow  
Write-Host "Run this command and paste your Supabase PostgreSQL URL:"
Write-Host "npx vercel env add DATABASE_URL production" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your DATABASE_URL should be:"
Write-Host "postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" -ForegroundColor Gray
Write-Host ""

# Deploy the updated environment
Write-Host "🚀 After setting DATABASE_URL, redeploy with:"
Write-Host "npx vercel --prod" -ForegroundColor Cyan
