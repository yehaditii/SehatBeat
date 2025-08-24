# Sehatbeat AI Setup Guide

## Overview
The Sehatbeat AI system has been rebuilt to use Convex functions with Perplexity AI integration. This provides a more robust, scalable, and real-time AI experience for health symptom analysis.

## What's New in the Rebuilt System

### 1. **Convex Integration**
- AI functions now run on Convex backend instead of Next.js API routes
- Real-time updates when AI responses are ready
- Better error handling and fallback systems
- Scalable architecture

### 2. **Perplexity AI Integration**
- Direct integration with Perplexity AI for intelligent symptom analysis
- Fallback to structured health responses when AI is unavailable
- Environment variable configuration for API keys

### 3. **Improved User Experience**
- Real-time conversation updates
- Better error messages and fallback advice
- Toast notifications for user feedback
- Structured health analysis with severity levels and recommendations

## Setup Instructions

### Step 1: Environment Configuration

1. **Create/Update `.env.local` file:**
   ```bash
   cd backend
   .\setup-env.ps1  # For PowerShell
   # OR
   .\setup-env.bat  # For Command Prompt
   ```

2. **Edit `.env.local` and add your actual keys:**
   ```bash
   # Convex Configuration
   NEXT_PUBLIC_CONVEX_URL=http://localhost:8000
   
   # Clerk Configuration (you'll need to add your actual Clerk keys)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   
   # Perplexity AI Configuration (for symptom analysis)
   PERPLEXITY_API_KEY=your_perplexity_api_key_here
   
   # Deployment used by `npx convex dev`
   ```

### Step 2: Get Perplexity AI API Key

1. Visit [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for an account
3. Navigate to API section
4. Generate an API key
5. Copy the key and paste it in your `.env.local` file

### Step 3: Start the Development Servers

1. **Start Convex Development Server:**
   ```bash
   cd backend
   npm run dev:convex
   ```

2. **Start Next.js Development Server (in a new terminal):**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend Development Server (in another terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

## How the New System Works

### 1. **User Input Flow**
1. User types symptoms in the AI chat
2. Frontend calls Convex `analyzeSymptoms` mutation
3. Convex creates/updates conversation and schedules AI analysis
4. User sees immediate feedback that analysis is in progress

### 2. **AI Analysis Flow**
1. Convex `analyzeHealthSymptoms` action is triggered
2. System attempts to call Perplexity AI API
3. If successful, AI response is parsed and structured
4. If failed, fallback health response is generated
5. Response is added to conversation and sent to frontend

### 3. **Real-time Updates**
1. Frontend listens for conversation changes
2. When AI response is ready, it's automatically displayed
3. User sees structured health analysis with:
   - Problem summary
   - Severity level
   - Immediate steps
   - When to seek medical help
   - Recommended tests and specialists

## API Functions

### Frontend Functions (Convex Client)
- `analyzeSymptoms(symptoms, userId)` - Submit symptoms for analysis
- `getConversation(userId)` - Get user's conversation history
- `createConversation(userId)` - Create new conversation

### Backend Functions (Convex Server)
- `analyzeHealthSymptoms(symptoms, conversationId)` - Internal AI analysis
- `callPerplexityAI(symptoms)` - Call Perplexity AI API
- `updateConversationWithAIResponse(conversationId, aiResponse)` - Update conversation
- `generateFallbackHealthResponse(symptoms)` - Generate fallback response

## Fallback System

The system includes a comprehensive fallback system that provides structured health advice for common symptoms:

- **Headache** - Tension, dehydration, eye strain, etc.
- **Fever** - Infections, inflammatory conditions, etc.
- **Cough** - Respiratory issues, allergies, etc.
- **Fatigue** - Sleep issues, stress, nutritional problems, etc.
- **Nausea** - Gastrointestinal issues, motion sickness, etc.
- **Chest Pain** - Heart issues, musculoskeletal problems, etc.
- **Dizziness** - Inner ear problems, low blood pressure, etc.

Each fallback response includes:
- Problem description
- Possible causes
- Severity assessment
- Immediate steps to take
- When to seek medical help
- Recommended tests
- Recommended specialist

## Troubleshooting

### Common Issues

1. **"Perplexity API key not configured"**
   - Check your `.env.local` file has the correct API key
   - Ensure the key is valid and has sufficient credits

2. **"Convex connection failed"**
   - Make sure Convex dev server is running (`npm run dev:convex`)
   - Check your `NEXT_PUBLIC_CONVEX_URL` in `.env.local`

3. **"Authentication Required"**
   - Ensure user is signed in through Clerk
   - Check Clerk configuration in `.env.local`

4. **AI responses not appearing**
   - Check browser console for errors
   - Verify Convex functions are running properly
   - Check if Perplexity API is responding

### Debug Mode

Enable debug logging by checking the browser console and Convex dev server logs for detailed error information.

## Production Deployment

### Convex Cloud
1. Deploy to Convex Cloud: `npx convex dev --configure`
2. Set environment variables in Convex dashboard
3. Update `NEXT_PUBLIC_CONVEX_URL` to your cloud URL

### Environment Variables
Set these in your production environment:
- `PERPLEXITY_API_KEY` - Your Perplexity AI API key
- `CLERK_SECRET_KEY` - Your Clerk secret key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Monitor API usage and costs
- Implement rate limiting if needed
- Always include medical disclaimers

## Cost Considerations

- Perplexity AI charges per API call
- Monitor usage in your Perplexity dashboard
- Consider implementing caching for common symptoms
- Set up usage alerts to avoid unexpected charges

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Convex and Next.js logs
3. Verify all environment variables are set correctly
4. Ensure all development servers are running

The rebuilt Sehatbeat AI system provides a robust, scalable, and user-friendly experience for health symptom analysis with intelligent fallbacks and real-time updates.
