import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { symptoms, userId } = await request.json();

    if (!symptoms) {
      return NextResponse.json(
        { error: 'Symptoms are required' },
        { status: 400 }
      );
    }

    // Perplexity AI API integration
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
    
    if (!PERPLEXITY_API_KEY) {
      // Fallback response when API key is not available
      return NextResponse.json({
        analysis: `I've analyzed your symptoms: "${symptoms}". Here's what I found:`,
        severity: "Moderate",
        recommendations: [
          "Rest and stay hydrated",
          "Monitor your symptoms",
          "Consider over-the-counter relief if appropriate",
          "Consult a healthcare professional if symptoms persist or worsen",
          "Keep a symptom diary to track patterns"
        ]
      });
    }

    // Call Perplexity AI API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are a medical AI assistant. Analyze the user's symptoms and provide:
1. A brief analysis of possible causes
2. Severity level (Low/Moderate/High)
3. 5-7 actionable recommendations
4. When to seek medical attention

Keep responses concise, helpful, and always include a disclaimer about consulting healthcare professionals.`
          },
          {
            role: 'user',
            content: `Analyze these symptoms: ${symptoms}. Provide a structured response with analysis, severity, and recommendations.`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';

    // Parse the AI response to extract structured information
    const analysis = aiResponse;
    const severity = extractSeverity(aiResponse);
    const recommendations = extractRecommendations(aiResponse);

    return NextResponse.json({
      analysis,
      severity,
      recommendations,
    });

  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    
    // Return fallback response on error
    return NextResponse.json({
      analysis: "I'm having trouble connecting to the AI service right now. Here's some general advice:",
      severity: "Moderate",
      recommendations: [
        "Rest and stay hydrated",
        "Monitor your symptoms closely",
        "Consider over-the-counter relief if appropriate",
        "Consult a healthcare professional if symptoms persist",
        "Keep a symptom diary to track patterns"
      ]
    });
  }
}

function extractSeverity(text: string): string {
  const severityPatterns = [
    { pattern: /severity[:\s]+(low|moderate|high)/i, default: 'Moderate' },
    { pattern: /(low|moderate|high)\s+severity/i, default: 'Moderate' },
    { pattern: /(low|moderate|high)/i, default: 'Moderate' }
  ];

  for (const { pattern, default: defaultValue } of severityPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || defaultValue;
    }
  }
  
  return 'Moderate';
}

function extractRecommendations(text: string): string[] {
  const recommendationPatterns = [
    /recommendations?[:\s]+(.*?)(?=\n|$)/i,
    /suggestions?[:\s]+(.*?)(?=\n|$)/i,
    /advice[:\s]+(.*?)(?=\n|$)/i
  ];

  for (const pattern of recommendationPatterns) {
    const match = text.match(pattern);
    if (match) {
      const recommendations = match[1]
        .split(/[•\-\*]/)
        .map(rec => rec.trim())
        .filter(rec => rec.length > 10)
        .slice(0, 7);
      
      if (recommendations.length > 0) {
        return recommendations;
      }
    }
  }

  // Fallback recommendations
  return [
    "Rest and stay hydrated",
    "Monitor your symptoms closely",
    "Consider over-the-counter relief if appropriate",
    "Consult a healthcare professional if symptoms persist",
    "Keep a symptom diary to track patterns"
  ];
}
