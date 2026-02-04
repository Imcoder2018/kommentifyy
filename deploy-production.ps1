# Production Deployment Script
Write-Host "🚀 LinkedIn Automation - Production Deployment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if logged into Vercel
Write-Host "1️⃣ Checking Vercel authentication..." -ForegroundColor Cyan
try {
    $vercelUser = npx vercel whoami 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Logged into Vercel as: $vercelUser" -ForegroundColor Green
    } else {
        Write-Host "❌ Not logged into Vercel" -ForegroundColor Red
        Write-Host "Please run: npx vercel login" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Vercel CLI not found" -ForegroundColor Red
    Write-Host "Please install: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Generate Prisma client for production
Write-Host "2️⃣ Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma client generated" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Set environment variables on Vercel
Write-Host "3️⃣ Setting Vercel environment variables..." -ForegroundColor Cyan

# Database URL (you may need to update this manually)
Write-Host "⚠️ MANUAL STEP: Set DATABASE_URL on Vercel:" -ForegroundColor Yellow
Write-Host "npx vercel env add DATABASE_URL production" -ForegroundColor White
Write-Host "Use: postgresql://postgres.fvoruwepflhyvwxoitov:8q0xoxpz8DJqJReL@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1" -ForegroundColor Gray
Write-Host ""

# JWT Secrets
try {
    npx vercel env add JWT_SECRET production --force 2>$null
    npx vercel env add JWT_REFRESH_SECRET production --force 2>$null
    npx vercel env add OPENAI_API_KEY production --force 2>$null
    npx vercel env add NEXT_PUBLIC_API_URL production --force 2>$null
    Write-Host "⚠️ Environment variables may need to be set manually" -ForegroundColor Yellow
} catch {
    Write-Host "⚠️ Some environment variables may need manual setup" -ForegroundColor Yellow
}

Write-Host ""

# Deploy to production
Write-Host "4️⃣ Deploying to Vercel..." -ForegroundColor Cyan
npx vercel --prod
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully deployed to production!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Update extension for production
Write-Host "5️⃣ Next Steps:" -ForegroundColor Cyan
Write-Host "1. Get your production URL from Vercel" -ForegroundColor White
Write-Host "2. Update popup.js to use production URL" -ForegroundColor White
Write-Host "3. Test extension with production backend" -ForegroundColor White
Write-Host "4. Update Chrome Web Store if needed" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Production deployment setup complete!" -ForegroundColor Green
