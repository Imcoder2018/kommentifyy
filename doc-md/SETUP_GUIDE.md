# LinkedIn Automation Backend API - Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud like Vercel Postgres, Supabase, or Neon)
- OpenAI API key

## Step 1: Install Dependencies

```bash
cd backend-api
npm install
```

## Step 2: Configure Environment Variables

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="generate-a-random-secret-key"
JWT_REFRESH_SECRET="generate-another-random-secret-key"
OPENAI_API_KEY="sk-your-openai-api-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Step 3: Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with default plans and admin
npm run prisma:seed
```

## Step 4: Run Development Server

```bash
npm run dev
```

API will be available at `http://localhost:3000`

## Step 5: Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Step 6: Update Chrome Extension

Update extension to use backend API:

1. Store API URL in extension settings
2. Implement authentication flow
3. Replace direct OpenAI calls with backend API calls
4. Add JWT token management

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/refresh-token` - Refresh JWT
- GET `/api/auth/me` - Get current user

### AI Features
- POST `/api/ai/generate-post` - Generate LinkedIn post
- POST `/api/ai/generate-comment` - Generate comment
- POST `/api/ai/generate-topics` - Generate topic lines

### Usage Tracking
- GET `/api/usage/daily` - Get today's usage
- POST `/api/usage/track` - Track an action

### Admin (Protected)
- GET `/api/admin/users` - List all users
- PUT `/api/admin/users/:id/plan` - Assign plan
- POST `/api/admin/plans` - Create plan
- PUT `/api/admin/plans/:id` - Update plan
- DELETE `/api/admin/plans/:id` - Delete plan

## Default Admin Credentials

After seeding:
- Email: admin@linkedin-automation.com
- Password: Admin@123456

**IMPORTANT: Change these credentials immediately in production!**

## Testing API

Use tools like Postman or curl:

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Generate post (with token)
curl -X POST http://localhost:3000/api/ai/generate-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"topic":"AI in business","template":"lead_magnet","tone":"professional","length":1500}'
```

## Production Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS only
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Add CORS configuration
- [ ] Implement API versioning
- [ ] Add request logging
- [ ] Set up CI/CD pipeline

## Troubleshooting

### Database Connection Issues
- Check DATABASE_URL format
- Verify database is running
- Check firewall rules

### JWT Token Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure Bearer token format

### OpenAI API Errors
- Verify API key is valid
- Check OpenAI account credits
- Review rate limits

## Support

For issues or questions, refer to:
- Prisma docs: https://www.prisma.io/docs
- Next.js docs: https://nextjs.org/docs
- Vercel deployment: https://vercel.com/docs
