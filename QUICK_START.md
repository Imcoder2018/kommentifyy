# Quick Start Guide - LinkedIn Automation Backend API

## ⚡ Fast Setup (5 Minutes)

### Step 1: Create .env File
```bash
cd backend-api
copy .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/linkedin_automation"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
OPENAI_API_KEY="sk-your-openai-api-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Step 2: Setup Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL
# Create database
createdb linkedin_automation
```

**Option B: Cloud Database (Recommended)**
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Supabase**: https://supabase.com (Free tier available)
- **Neon**: https://neon.tech (Free tier available)

### Step 3: Run Migrations
```bash
npm run prisma:migrate
```

### Step 4: Seed Database
```bash
npm run prisma:seed
```

### Step 5: Start Server
```bash
npm run dev
```

API running at: http://localhost:3000

## 🧪 Test API

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Save the token from response!

## 📊 View Database
```bash
npm run prisma:studio
```

Opens Prisma Studio at http://localhost:5555

## 🚀 Deploy to Vercel

1. Push to GitHub
2. Go to vercel.com
3. Import repository
4. Add environment variables
5. Deploy!

## 🔐 Default Admin Login

After seeding:
- Email: `admin@linkedin-automation.com`
- Password: `Admin@123456`

**⚠️ CHANGE IMMEDIATELY!**

## 📝 Next Steps

1. Create remaining API endpoints (see BACKEND_API_SPEC.md)
2. Build admin dashboard
3. Integrate with Chrome extension
4. Test all features
5. Deploy to production

## 🆘 Troubleshooting

**Database connection error?**
- Check DATABASE_URL format
- Ensure database is running
- Verify credentials

**Prisma errors?**
- Run `npm run prisma:generate`
- Delete `node_modules` and reinstall

**Port already in use?**
- Change port: `PORT=3001 npm run dev`

## 📚 Documentation

- Full API Spec: `BACKEND_API_SPEC.md`
- Setup Guide: `SETUP_GUIDE.md`
- Implementation Status: `FINAL_STATUS.md`
