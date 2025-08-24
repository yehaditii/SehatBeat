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

    // Check if input is health-related
    const healthKeywords = [
      'pain', 'ache', 'hurt', 'sore', 'fever', 'cough', 'cold', 'flu', 'headache', 'migraine',
      'stomach', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'indigestion', 'heartburn',
      'rash', 'itch', 'skin', 'burn', 'cut', 'bruise', 'swelling', 'inflammation',
      'dizzy', 'dizziness', 'faint', 'weakness', 'fatigue', 'tired', 'exhausted',
      'breathing', 'shortness of breath', 'chest pain', 'heart', 'blood pressure',
      'joint', 'muscle', 'back', 'neck', 'shoulder', 'knee', 'hip', 'arm', 'leg',
      'vision', 'eye', 'ear', 'nose', 'throat', 'mouth', 'tooth', 'dental',
      'cancer', 'tumor', 'lump', 'bump', 'growth', 'bleeding', 'infection',
      'allergy', 'asthma', 'diabetes', 'hypertension', 'arthritis', 'depression', 'anxiety'
    ];
    
    const lowerSymptoms = symptoms.toLowerCase();
    const isHealthRelated = healthKeywords.some(keyword => 
      lowerSymptoms.includes(keyword)
    );
    
    if (!isHealthRelated) {
      return NextResponse.json({
        analysis: `I'm a specialized health and medical symptom analyzer. I can help you with health-related topics like symptoms, medical conditions, injuries, and general wellness. 

What you asked about: "${symptoms}"

Please describe any health symptoms, medical concerns, or wellness questions you have. I'm here to provide health-related guidance and recommendations.`,
        severity: "Not Applicable",
        recommendations: [
          "Describe health symptoms or medical concerns",
          "Ask about specific health conditions",
          "Inquire about wellness and prevention",
          "Seek guidance for injuries or pain"
        ]
      });
    }

    // Perplexity AI API integration
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
    
    console.log('Environment check:', {
      hasApiKey: !!PERPLEXITY_API_KEY,
      apiKeyLength: PERPLEXITY_API_KEY?.length || 0,
      apiKeyStart: PERPLEXITY_API_KEY?.substring(0, 10) || 'none'
    });
    
    if (!PERPLEXITY_API_KEY) {
      console.log('No API key found, using fallback response');
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
    
    console.log('Perplexity AI response received:', {
      status: response.status,
      responseLength: aiResponse.length,
      hasContent: !!aiResponse
    });

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
