# Perplexity AI Integration Setup Guide

## Overview
This guide will help you set up Perplexity AI integration for the SehatBeat health symptom analysis feature. The AI will provide intelligent, structured health responses based on user symptoms.

## What's Fixed
✅ **Authentication Error Resolved**: The AI Assistant now works without authentication for demo purposes
✅ **Local AI Analysis**: Fallback system provides intelligent health responses even when backend is unavailable
✅ **Perplexity AI Ready**: Backend is configured to use Perplexity AI when properly set up

## Setup Steps

### 1. Get Perplexity AI API Key
1. Visit [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for an account or log in
3. Navigate to API section
4. Generate a new API key
5. Copy the API key (keep it secure)

### 2. Configure Environment Variables

#### Option A: Backend Environment (Recommended)
Create a `.env.local` file in the `backend` directory:

```bash
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=http://localhost:8000

# Clerk Configuration (for authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Perplexity AI Configuration
PERPLEXITY_API_KEY=your_actual_perplexity_api_key_here
```

#### Option B: Frontend Environment
Create a `.env.local` file in the `frontend` directory:

```bash
# Convex Configuration
VITE_CONVEX_URL=http://localhost:8000

# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Perplexity AI Configuration
VITE_PERPLEXITY_API_KEY=your_actual_perplexity_api_key_here
```

### 3. Start the Backend Services

```bash
# Terminal 1: Start Convex development server
cd backend
npm run dev:convex

# Terminal 2: Start Next.js development server
cd backend
npm run dev
```

### 4. Start the Frontend

```bash
# Terminal 3: Start Vite development server
cd frontend
npm run dev
```

## How It Works

### Current State (Local Mode)
- ✅ AI Assistant works without authentication
- ✅ Provides intelligent health analysis for common symptoms
- ✅ Structured responses with severity, recommendations, and next steps
- ✅ Fallback system for unknown symptoms

### With Perplexity AI (Full Mode)
- 🚀 Real-time AI-powered symptom analysis
- 🧠 Advanced health insights and recommendations
- 📊 Detailed symptom parsing and categorization
- 🔄 Continuous learning and improvement

## Testing the Integration

### 1. Test Local Mode
1. Open the AI Assistant (blue chat button)
2. Type symptoms like "headache", "fever", or "cough"
3. Verify you get intelligent, structured responses

### 2. Test Perplexity AI Mode
1. Ensure environment variables are set
2. Start backend services
3. Type any symptoms
4. Check backend logs for Perplexity API calls

## Troubleshooting

### Common Issues

#### 1. "Authentication Required" Error
**Cause**: Clerk authentication not configured
**Solution**: Set up Clerk keys or use local mode

#### 2. "Perplexity API key not configured"
**Cause**: Missing PERPLEXITY_API_KEY environment variable
**Solution**: Add the API key to your environment file

#### 3. API Rate Limiting
**Cause**: Exceeded Perplexity AI usage limits
**Solution**: Check your Perplexity dashboard for usage

#### 4. Network Errors
**Cause**: Backend services not running
**Solution**: Ensure Convex and Next.js servers are started

### Debug Steps

1. **Check Environment Variables**
   ```bash
   # Backend
   cd backend
   cat .env.local
   
   # Frontend
   cd frontend
   cat .env.local
   ```

2. **Check Backend Logs**
   ```bash
   cd backend
   npm run dev:convex
   # Look for Perplexity API calls in the logs
   ```

3. **Check Browser Console**
   - Open Developer Tools
   - Look for authentication or API errors

## Security Notes

- ⚠️ Never commit API keys to version control
- 🔒 Use environment variables for sensitive data
- 📊 Monitor API usage and costs
- 🚫 Don't share your Perplexity API key publicly

## Cost Considerations

- 💰 Perplexity AI charges per API call
- 📈 Monitor usage in your dashboard
- 🎯 Consider implementing caching for common symptoms
- ⚡ Set up usage alerts to avoid unexpected charges

## Next Steps

1. **Set up Clerk Authentication** for user management
2. **Configure Perplexity AI** for advanced analysis
3. **Deploy to Production** with proper environment variables
4. **Monitor and Optimize** API usage and costs

## Support

If you encounter issues:
1. Check this guide first
2. Review the troubleshooting section
3. Check backend logs for detailed error messages
4. Verify environment variable configuration

---

**Status**: ✅ Ready for Perplexity AI integration
**Current Mode**: Local AI analysis (working)
**Target Mode**: Full Perplexity AI integration
