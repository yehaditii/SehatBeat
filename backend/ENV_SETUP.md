# Environment Setup Guide

To fix the white screen issue, you need to create a `.env.local` file in the `backend` directory with the following variables:

## Required Environment Variables

Create a file called `.env.local` in the `backend` directory with:

```bash
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=http://localhost:8000

# Clerk Configuration (you'll need to add your actual Clerk keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Perplexity AI Configuration (for symptom analysis)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

## Steps to Fix White Screen:

1. **Create the .env.local file:**
   - Navigate to the `backend` directory
   - Create a new file called `.env.local`
   - Add the content above

2. **Start Convex Development Server:**
   ```bash
   cd backend
   npm run dev:convex
   ```

3. **Start Next.js Development Server:**
   ```bash
   cd backend
   npm run dev
   ```

4. **Get Clerk Keys:**
   - Go to [clerk.com](https://clerk.com)
   - Create a new application or use existing one
   - Copy the publishable key and secret key
   - Replace the placeholder values in `.env.local`

5. **Get Perplexity AI API Key:**
   - Go to [perplexity.ai](https://perplexity.ai)
   - Sign up or log in to your account
   - Go to API settings
   - Generate a new API key
   - Replace the placeholder value in `.env.local`

## Alternative: Use Convex Cloud

If you want to use Convex Cloud instead of local development:

1. **Deploy to Convex:**
   ```bash
   cd backend
   npx convex dev --configure
   ```

2. **Update .env.local:**
   ```bash
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

## Troubleshooting

- **White screen persists:** Check browser console for errors
- **Convex connection failed:** Ensure Convex dev server is running
- **Clerk errors:** Verify Clerk keys are correct
- **Build errors:** Run `npm run build` to see detailed error messages

## Development Commands

```bash
# Start both servers
npm run dev:convex & npm run dev

# Or use the package.json scripts
npm run dev:convex  # Terminal 1
npm run dev         # Terminal 2
```

