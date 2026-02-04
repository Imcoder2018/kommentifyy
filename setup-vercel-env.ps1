# Setup Vercel Environment Variables
Write-Host "Setting up Vercel environment variables..."

# Add environment variables to Vercel
npx vercel env add JWT_SECRET production
npx vercel env add JWT_REFRESH_SECRET production
npx vercel env add OPENAI_API_KEY production
npx vercel env add DATABASE_URL production
npx vercel env add NEXT_PUBLIC_API_URL production

Write-Host "Environment variables setup complete!"
Write-Host "You'll need to enter the values manually when prompted."
