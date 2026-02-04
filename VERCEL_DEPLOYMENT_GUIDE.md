# 🚀 Vercel Deployment Guide - LinkedIn Automation Backend API

## Prerequisites
- ✅ GitHub account
- ✅ Vercel account (free tier available)
- ✅ PostgreSQL database (we'll use Vercel Postgres)

---

## Step 1: Prepare for Deployment

### 1.1 Update Prisma Schema for PostgreSQL

Open `prisma/schema.prisma` and change:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 1.2 Update Activity Model

Change metadata type back to Json:

```prisma
model Activity {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type          String
  timestamp     DateTime @default(now())
  metadata      Json?    // Change from String to Json
  
  @@index([userId, timestamp])
}
```

---

## Step 2: Push to GitHub

### 2.1 Initialize Git Repository

```bash
cd backend-api

# Initialize git
git init

# Create .gitignore
echo "node_modules/
.env
.next/
prisma/dev.db
prisma/dev.db-journal
.DS_Store" > .gitignore

# Add files
git add .
git commit -m "Initial commit: LinkedIn Automation Backend API"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create new repository: `linkedin-automation-backend`
3. **DO NOT** initialize with README (we already have code)

### 2.3 Push Code

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/linkedin-automation-backend.git

# Push code
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `linkedin-automation-backend`
4. Click **"Import"**

### 3.2 Configure Project

**Framework Preset**: Next.js (auto-detected)
**Root Directory**: `./` (leave as is)
**Build Command**: `npm run build` (auto-filled)
**Output Directory**: `.next` (auto-filled)

### 3.3 Add Environment Variables

Click **"Environment Variables"** and add:

#### Required Variables:

```env
# JWT Secrets (IMPORTANT: Generate new secure secrets!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long-production

# OpenAI API Key
OPENAI_API_KEY=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
```

**⚠️ IMPORTANT**: 
- Generate NEW JWT secrets for production
- Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Run this twice to get two different secrets

### 3.4 Click **"Deploy"**

Wait 2-3 minutes for deployment to complete.

---

## Step 4: Setup Vercel Postgres Database

### 4.1 Create Database

1. In your Vercel project dashboard
2. Go to **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Choose region closest to your users
6. Click **"Create"**

### 4.2 Connect Database

Vercel automatically adds these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` ← **Use this one**
- `POSTGRES_URL_NON_POOLING`

### 4.3 Update Environment Variables

1. Go to **"Settings"** → **"Environment Variables"**
2. Add new variable:

```env
DATABASE_URL=${POSTGRES_PRISMA_URL}
```

This will automatically use the Postgres connection string.

---

## Step 5: Run Database Migrations

### 5.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 5.2 Login to Vercel

```bash
vercel login
```

### 5.3 Link Project

```bash
cd backend-api
vercel link
```

Select your project when prompted.

### 5.4 Pull Environment Variables

```bash
vercel env pull .env.production
```

This downloads your production environment variables.

### 5.5 Run Migrations

```bash
# Set DATABASE_URL from production
$env:DATABASE_URL = (Get-Content .env.production | Select-String "DATABASE_URL").ToString().Split("=")[1]

# Run migration
npx prisma migrate deploy

# Or use db push for quick setup
npx prisma db push
```

### 5.6 Seed Database

```bash
# Update seed.js to use production data
node prisma/seed.js
```

---

## Step 6: Update Extension Configuration

### 6.1 Get Your Vercel URL

After deployment, Vercel gives you a URL like:
```
https://linkedin-automation-backend.vercel.app
```

### 6.2 Update Extension API Service

Edit `shared/utils/apiService.js`:

```javascript
const API_CONFIG = {
    // Change this to your Vercel URL
    baseUrl: 'https://linkedin-automation-backend.vercel.app',
    // ... rest of config
};
```

### 6.3 Add to Extension Settings

Create a settings page where users can configure:
```javascript
// Allow users to set custom API URL if self-hosting
await chrome.storage.local.set({ 
    apiBaseUrl: 'https://your-vercel-url.vercel.app' 
});
```

---

## Step 7: Test Production API

### 7.1 Test Registration

```powershell
$body = @{email='test@example.com';password='Test@123456';name='Test User'} | ConvertTo-Json
Invoke-WebRequest -Uri https://YOUR-VERCEL-URL.vercel.app/api/auth/register -Method POST -Body $body -ContentType 'application/json'
```

### 7.2 Test Login

```powershell
$body = @{email='test@example.com';password='Test@123456'} | ConvertTo-Json
Invoke-WebRequest -Uri https://YOUR-VERCEL-URL.vercel.app/api/auth/login -Method POST -Body $body -ContentType 'application/json'
```

### 7.3 Test Admin Login

```powershell
$body = @{email='admin@linkedin-automation.com';password='Admin@123456'} | ConvertTo-Json
Invoke-WebRequest -Uri https://YOUR-VERCEL-URL.vercel.app/api/admin/login -Method POST -Body $body -ContentType 'application/json'
```

---

## Environment Variables Summary

### For Local Development (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="linkedin-automation-super-secret-jwt-key-min-32-characters-long-2024"
JWT_REFRESH_SECRET="linkedin-automation-super-secret-refresh-key-min-32-characters-long-2024"
OPENAI_API_KEY="sk-proj-..."
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### For Production (Vercel Environment Variables)
```env
DATABASE_URL=${POSTGRES_PRISMA_URL}
JWT_SECRET="GENERATE-NEW-SECRET-FOR-PRODUCTION-32-CHARS-MIN"
JWT_REFRESH_SECRET="GENERATE-NEW-SECRET-FOR-PRODUCTION-32-CHARS-MIN"
OPENAI_API_KEY="sk-proj-..."
NEXT_PUBLIC_API_URL="https://your-app.vercel.app"
```

---

## Admin Access Security

### ✅ Admin Routes are Protected

1. **Separate Admin Table**: Admins are stored in `Admin` table, not `User` table
2. **Admin-Only Login**: `/api/admin/login` endpoint for admin authentication
3. **Role-Based Tokens**: Admin tokens include `role: 'admin'` in JWT payload
4. **Middleware Protection**: `requireAdmin()` middleware checks role before allowing access
5. **403 Forbidden**: Non-admin users get 403 error when accessing admin routes

### Admin Endpoints (Protected)

All these require admin token with `role: 'admin'`:

```
POST   /api/admin/login          - Admin login (no auth required)
GET    /api/admin/users          - List all users (admin only)
PUT    /api/admin/users/:id/plan - Change user plan (admin only)
POST   /api/admin/plans          - Create plan (admin only)
PUT    /api/admin/plans/:id      - Update plan (admin only)
DELETE /api/admin/plans/:id      - Delete plan (admin only)
GET    /api/admin/stats          - View statistics (admin only)
```

### How Admin Protection Works

```typescript
// 1. Admin logs in with admin credentials
POST /api/admin/login
{
  "email": "admin@linkedin-automation.com",
  "password": "Admin@123456"
}

// 2. Receives token with admin role
{
  "token": "eyJhbGci...",
  "admin": { "role": "admin", ... }
}

// 3. Token payload includes role
{
  "userId": "admin_id",
  "email": "admin@...",
  "role": "admin"  // ← This is checked
}

// 4. Admin routes verify role
if (payload.role !== 'admin') {
  return 403 Forbidden
}
```

### Regular Users CANNOT Access Admin Routes

- Regular users login via `/api/auth/login`
- Their tokens don't have `role: 'admin'`
- Admin middleware rejects them with 403 Forbidden
- They can only access user endpoints

---

## Custom Domain (Optional)

### Add Custom Domain

1. Go to **"Settings"** → **"Domains"**
2. Add your domain: `api.yourdomain.com`
3. Add DNS records as shown by Vercel
4. Wait for DNS propagation (5-30 minutes)

### Update Extension

```javascript
baseUrl: 'https://api.yourdomain.com'
```

---

## Monitoring & Logs

### View Logs

1. Go to your Vercel project
2. Click **"Deployments"**
3. Click on latest deployment
4. View **"Functions"** logs

### Monitor Usage

- **Analytics**: Vercel dashboard shows request counts
- **Errors**: Check Functions logs for errors
- **Database**: Vercel Postgres dashboard shows queries

---

## Security Checklist

- ✅ Generate NEW JWT secrets for production
- ✅ Use strong admin password (change default!)
- ✅ Enable HTTPS only (Vercel does this automatically)
- ✅ Set up CORS if needed
- ✅ Monitor API usage
- ✅ Regular database backups
- ✅ Admin routes protected with role-based auth
- ✅ Rate limiting (add if needed)

---

## Troubleshooting

### Database Connection Issues
```bash
# Check DATABASE_URL is set correctly
vercel env ls

# Test connection
npx prisma db push
```

### Migration Errors
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Push schema without migration
npx prisma db push
```

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies in package.json
- Verify TypeScript has no errors

---

## Cost Estimate

### Vercel (Free Tier)
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Edge network

### Vercel Postgres (Free Tier)
- ✅ 256 MB storage
- ✅ 60 hours compute time/month
- ✅ Suitable for ~1000 users

### Upgrade When Needed
- **Pro Plan**: $20/month (more bandwidth)
- **Postgres Pro**: $20/month (more storage)

---

## Next Steps After Deployment

1. ✅ Test all API endpoints
2. ✅ Update extension with production URL
3. ✅ Change admin password
4. ✅ Create test users
5. ✅ Monitor logs for errors
6. ✅ Set up error tracking (Sentry)
7. ✅ Add rate limiting
8. ✅ Build admin dashboard UI

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Deployment Time**: ~15-20 minutes
**Difficulty**: Medium
**Cost**: Free (with free tiers)

🎉 **Your backend API will be live at**: `https://your-project.vercel.app`
