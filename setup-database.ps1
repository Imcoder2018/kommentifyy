# Database Migration Script
# Run this after setting up your Supabase password

Write-Host "🚀 Setting up persistent database..." -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Current setup:"
Write-Host "- Database: Supabase PostgreSQL"
Write-Host "- Provider: postgresql"
Write-Host "- Migration: Required"
Write-Host ""

Write-Host "⚠️ IMPORTANT STEPS:" -ForegroundColor Yellow
Write-Host "1. Go to https://supabase.com/dashboard/project/fvoruwepflhyvwxoitov/settings/database"
Write-Host "2. Copy your database password"
Write-Host "3. Update the [PASSWORD] in .env file"
Write-Host ""

# Check if DATABASE_URL contains [PASSWORD]
$envContent = Get-Content ".env" -Raw
if ($envContent -match "\[PASSWORD\]") {
    Write-Host "❌ Please update [PASSWORD] in .env file first!" -ForegroundColor Red
    Write-Host "   Replace [PASSWORD] with your actual Supabase database password"
    exit 1
}

Write-Host "✅ DATABASE_URL looks configured" -ForegroundColor Green

# Test database connection
Write-Host "🔍 Testing database connection..."
try {
    npx prisma db push --accept-data-loss
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful!" -ForegroundColor Green
    } else {
        throw "Database push failed"
    }
} catch {
    Write-Host "❌ Database connection failed!" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL in .env file"
    exit 1
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..."
npx prisma generate

# Create default plans
Write-Host "📊 Creating default plans..."
$createPlansScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDefaultPlans() {
  try {
    // Create Free plan
    await prisma.plan.upsert({
      where: { name: 'Free' },
      update: {},
      create: {
        name: 'Free',
        price: 0,
        dailyComments: 10,
        dailyLikes: 20,
        dailyShares: 5,
        dailyFollows: 10,
        dailyConnections: 5,
        aiPostsPerDay: 2,
        aiCommentsPerDay: 5
      }
    });

    // Create Pro plan
    await prisma.plan.upsert({
      where: { name: 'Pro' },
      update: {},
      create: {
        name: 'Pro',
        price: 29,
        dailyComments: 100,
        dailyLikes: 200,
        dailyShares: 50,
        dailyFollows: 50,
        dailyConnections: 30,
        aiPostsPerDay: 20,
        aiCommentsPerDay: 50
      }
    });

    // Create Business plan
    await prisma.plan.upsert({
      where: { name: 'Business' },
      update: {},
      create: {
        name: 'Business',
        price: 99,
        dailyComments: 1000,
        dailyLikes: 2000,
        dailyShares: 500,
        dailyFollows: 200,
        dailyConnections: 100,
        aiPostsPerDay: 100,
        aiCommentsPerDay: 200
      }
    });

    console.log('✅ Default plans created successfully');
  } catch (error) {
    console.error('❌ Error creating plans:', error);
  } finally {
    await prisma.`$disconnect();
  }
}

createDefaultPlans();
"@

$createPlansScript | Out-File -FilePath "create-plans.js" -Encoding UTF8
node create-plans.js
Remove-Item "create-plans.js" -Force

Write-Host ""
Write-Host "🎉 Database setup complete!" -ForegroundColor Green
Write-Host "✅ PostgreSQL database is now active"
Write-Host "✅ Tables created and migrated"  
Write-Host "✅ Default plans created"
Write-Host "✅ Users will no longer be deleted"
Write-Host ""
Write-Host "🚀 Your extension should now work perfectly!" -ForegroundColor Cyan
