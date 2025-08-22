# Perplexity AI Setup Guide

## Overview
This application uses Perplexity AI to provide intelligent health symptom analysis. The AI analyzes user symptoms and provides structured responses including problem summary, causes, severity, immediate steps, and recommendations.

## Setup Steps

### 1. Get Perplexity AI API Key
1. Visit [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for an account
3. Navigate to API section
4. Generate an API key

### 2. API Key Configuration
✅ **API Key is already configured in the code**

The Perplexity AI API key has been integrated into the backend code. No additional environment variable setup is required.

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Start the Backend
```bash
npm run dev:backend
```

## How It Works

### AI Health Analysis Flow
1. User describes symptoms in the chat
2. Frontend sends symptoms to backend
3. Backend calls Perplexity AI API
4. AI analyzes symptoms and provides structured response
5. Response is parsed and formatted for display
6. User sees comprehensive health analysis

### Response Structure
The AI provides:
- **Problem Summary**: Clear description of the health issue
- **Possible Causes**: List of potential reasons
- **Severity Level**: Assessment of how serious the symptoms are
- **Immediate Steps**: Actions to take right away
- **When to Seek Help**: Warning signs requiring medical attention
- **Recommended Tests**: Diagnostic tests to consider
- **Recommended Specialist**: Type of doctor to consult

### Fallback System
If Perplexity AI is unavailable, the system falls back to:
- Pre-defined health condition responses
- Structured symptom analysis
- General health recommendations

## API Configuration

### Perplexity AI Models Used
- **Primary**: `llama-3.1-sonar-small-128k-online`
- **Features**: Real-time health analysis, structured responses
- **Token Limit**: 1000 tokens per response
- **Temperature**: 0.3 (balanced creativity and accuracy)

### Request Format
```json
{
  "model": "llama-3.1-sonar-small-128k-online",
  "messages": [
    {
      "role": "user",
      "content": "Analyze these health symptoms: [symptoms]..."
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.3
}
```

## Troubleshooting

### Common Issues
1. **API Key Invalid**: Check your Perplexity API key
2. **Rate Limiting**: Perplexity has usage limits
3. **Network Errors**: Check internet connection
4. **Parsing Errors**: AI response format issues

### Fallback Behavior
The system automatically falls back to structured responses if:
- API calls fail
- Network issues occur
- Response parsing fails
- Rate limits are exceeded

## Security Notes
- Never commit API keys to version control
- Use environment variables for sensitive data
- Monitor API usage and costs
- Implement rate limiting if needed

## Cost Considerations
- Perplexity AI charges per API call
- Monitor usage in your dashboard
- Consider implementing caching for common symptoms
- Set up usage alerts
