# Backend API Testing Guide

## ⚠️ Current Status

**Issue**: Disk space error when running migrations
**Solution**: Clear disk space and retry, or use cloud database

## 🔧 Setup Steps (Once Disk Space Available)

### 1. Push Database Schema
```bash
npx prisma db push
```

### 2. Seed Database
```bash
npm run prisma:seed
```

### 3. Start Development Server
```bash
npm run dev
```

## 🧪 API Testing Commands

### Test 1: Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"Test@123456\",\"name\":\"Test User\"}"
```

**Expected Response**:
```json
{
  "success": true,
  "user": {
    "id": "clxxx...",
    "email": "test@example.com",
    "name": "Test User",
    "plan": {
      "name": "Free",
      "dailyComments": 10,
      "dailyLikes": 20
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Test 2: Login
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"Test@123456\"}"
```

**Expected Response**:
```json
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Test 3: Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@linkedin-automation.com\",\"password\":\"Admin@123456\"}"
```

### Test 4: Invalid Credentials
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"wrongpassword\"}"
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### Test 5: Duplicate Registration
```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"Test@123456\",\"name\":\"Test User\"}"
```

**Expected Response**:
```json
{
  "success": false,
  "error": "User already exists"
}
```

## 📊 View Database

```bash
npx prisma studio
```

Opens at: http://localhost:5555

## ✅ Verification Checklist

- [ ] Database created successfully
- [ ] Migrations applied
- [ ] Seed data created (3 plans + 1 admin)
- [ ] Server starts without errors
- [ ] Registration endpoint works
- [ ] Login endpoint works
- [ ] JWT tokens generated
- [ ] Password hashing works
- [ ] Plan assignment works
- [ ] Error handling works

## 🔍 Troubleshooting

### Disk Space Error
```bash
# Check disk space
dir C:\ 

# Clear npm cache
npm cache clean --force

# Clear temp files
del /q /f %TEMP%\*
```

### Database Issues
```bash
# Reset database
del prisma\dev.db
npx prisma db push
npm run prisma:seed
```

### Port Already in Use
```bash
# Use different port
$env:PORT=3001; npm run dev
```

## 🎯 Next Steps After Testing

1. ✅ Verify all authentication endpoints work
2. Create remaining API endpoints:
   - AI generation endpoints
   - Usage tracking endpoints
   - Admin management endpoints
3. Build admin dashboard UI
4. Deploy to Vercel
5. Integrate with Chrome extension

## 📝 Notes

- Database file: `prisma/dev.db` (SQLite)
- JWT tokens expire in 7 days
- Refresh tokens expire in 30 days
- Default admin password: `Admin@123456` (CHANGE IN PRODUCTION!)
