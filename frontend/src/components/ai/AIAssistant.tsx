import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertOctagon,
  Info
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../lib/convex";
import { useCurrentUser } from "../../hooks/useConvex";
import { useToast } from "../../hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  metadata?: {
    symptoms?: string[];
    severity?: string;
    recommendations?: string[];
  };
}

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello, I'm **SehatBeat AI**, your personal health companion. Tell me your symptoms, and I'll help analyze them, suggest possible causes, and guide you to the right doctor.",
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'bot',
      content: "I'm here to help you with any health concerns. You can ask me about symptoms, get general health advice, or learn about common conditions. Remember, I provide informational support only - always consult healthcare professionals for medical decisions.",
      timestamp: new Date()
    },
    {
      id: '3',
      type: 'bot',
      content: "To get started, simply describe what you're experiencing in the input field below. I'll analyze your symptoms and provide personalized recommendations based on the information you share.",
      timestamp: new Date()
    },

  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simple scrollbar styles that work across browsers
  const scrollbarStyles = `
    /* Basic scrollbar styling */
    .chat-messages::-webkit-scrollbar {
      width: 8px;
    }
    
    .chat-messages::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }
    
    .chat-messages::-webkit-scrollbar-thumb {
      background: rgba(59, 130, 246, 0.6);
      border-radius: 4px;
    }
    
    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: rgba(59, 130, 246, 0.8);
    }
  `;
  
  const currentUser = useCurrentUser();
  const { toast } = useToast();
  
  // Get user's conversation history
  const conversation = useQuery(api.myFunctions.getConversation, 
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  
  // Convex mutations for AI functionality
  const analyzeSymptoms = useMutation(api.myFunctions.analyzeSymptoms);
  const createConversation = useMutation(api.myFunctions.createConversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history when available
  useEffect(() => {
    if (conversation && conversation.messages && conversation.messages.length > 0) {
      const formattedMessages: Message[] = conversation.messages.map((msg, index) => ({
        id: index.toString(),
        type: msg.role === 'user' ? 'user' : 'bot',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        metadata: msg.metadata,
      }));
      setMessages(prev => {
        // Keep the welcome message and add conversation history
        const welcomeMessage = prev[0];
        return [welcomeMessage, ...formattedMessages];
      });
    }
  }, [conversation]);

  // Listen for new AI responses
  useEffect(() => {
    if (conversation && conversation.messages && conversation.messages.length > 0) {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.metadata) {
        // Check if this is a new AI response
        const existingMessage = messages.find(msg => 
          msg.content.includes(lastMessage.content.substring(0, 50))
        );
        
        if (!existingMessage && lastMessage.metadata.symptoms && lastMessage.metadata.severity) {
          const aiResponse: Message = {
            id: Date.now().toString(),
            type: 'bot',
            content: `🤖 **AI Analysis Complete!**

${lastMessage.content}

**Severity Level:** ${lastMessage.metadata.severity}
**Recommendations:**
${(lastMessage.metadata.recommendations || ["Consult a healthcare professional"]).map(rec => `• ${rec}`).join('\n')}

*This analysis was provided by Perplexity AI. Always consult healthcare professionals for medical decisions.*`,
            timestamp: new Date(lastMessage.timestamp),
            metadata: {
              symptoms: lastMessage.metadata.symptoms,
              severity: lastMessage.metadata.severity,
              recommendations: lastMessage.metadata.recommendations
            }
          };
          setMessages(prev => [...prev, aiResponse]);
        }
      }
    }
  }, [conversation, messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Add a temporary message indicating analysis is in progress
      const analysisMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `🔍 **Analyzing your symptoms with Perplexity AI...**

Please wait while I process your request. This may take a few seconds.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, analysisMessage]);

      // Try to use Convex to analyze symptoms if user is authenticated
      if (currentUser?._id) {
        try {
          const result = await analyzeSymptoms({
            symptoms: inputMessage,
            userId: currentUser._id,
          });

          if (result.success) {
            // Remove the temporary analysis message
            setMessages(prev => prev.filter(msg => msg.id !== analysisMessage.id));
            
            // Add success message
            const successMessage: Message = {
              id: (Date.now() + 2).toString(),
              type: 'bot',
              content: `✅ **Symptoms Submitted Successfully!**

${result.message}

Your symptoms are being analyzed by our AI. The response will appear shortly.`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, successMessage]);
            
            toast({
              title: "Analysis Started",
              description: "Your symptoms are being analyzed by Perplexity AI",
            });
          } else {
            // Remove the temporary analysis message
            setMessages(prev => prev.filter(msg => msg.id !== analysisMessage.id));
            
            // Handle non-health-related response
            const nonHealthMessage: Message = {
              id: (Date.now() + 2).toString(),
              type: 'bot',
              content: result.message,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, nonHealthMessage]);
            
            toast({
              title: "Not Health-Related",
              description: "Please ask health-related questions",
            });
            
            return; // Don't proceed with AI analysis
          }
        } catch (convexError) {
          console.error('Convex Error:', convexError);
          
          // Remove the temporary analysis message
          setMessages(prev => prev.filter(msg => msg.id !== analysisMessage.id));
          
          // Fallback to local AI analysis
          await performLocalAIAnalysis(inputMessage, analysisMessage.id);
        }
      } else {
        // No user ID, use local AI analysis instead
        await performLocalAIAnalysis(inputMessage, analysisMessage.id);
      }
      
      setIsTyping(false);
      
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      
      // Remove the temporary analysis message
      setMessages(prev => prev.filter(msg => msg.id !== analysisMessage.id));
      
      // Fallback to local AI analysis
      await performLocalAIAnalysis(inputMessage, null);
      setIsTyping(false);
    }
  };

  // Function to perform local AI analysis when backend is not available
  const performLocalAIAnalysis = async (symptoms: string, analysisMessageId: string | null) => {
    try {
      // Remove the temporary analysis message if it exists
      if (analysisMessageId) {
        setMessages(prev => prev.filter(msg => msg.id !== analysisMessageId));
      }

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate AI response using local logic
      const aiResponse = await generateLocalAIResponse(symptoms);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: aiResponse.content,
        timestamp: new Date(),
        metadata: {
          symptoms: aiResponse.symptoms,
          severity: aiResponse.severity,
          recommendations: aiResponse.recommendations
        }
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      toast({
        title: "Analysis Complete",
        description: "AI analysis completed successfully",
      });
      
    } catch (error) {
      console.error('Local AI analysis failed:', error);
      
      // Show fallback response
      const fallbackResponse: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `🤖 **AI Analysis Complete!**

**Fallback Advice for "${symptoms}":**
• Rest and stay hydrated
• Monitor your symptoms closely
• Consider over-the-counter relief if appropriate
• Consult a healthcare professional if symptoms persist

This is general advice only. Please consult a healthcare professional for proper diagnosis.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    }
  };

  // Function to generate local AI response
  const generateLocalAIResponse = async (symptoms: string): Promise<{
    content: string;
    symptoms: string[];
    severity: string;
    recommendations: string[];
  }> => {
    const lowerSymptoms = symptoms.toLowerCase();
    
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
    
    const isHealthRelated = healthKeywords.some(keyword => 
      lowerSymptoms.includes(keyword)
    );
    
    // If not health-related, return a polite redirect message
    if (!isHealthRelated) {
      return {
        content: `🤖 **SehatBeat AI Assistant**

I'm a specialized health and medical symptom analyzer. I can help you with:

**Health-related topics I can assist with:**
• **Symptoms**: pain, fever, cough, headache, stomach issues, etc.
• **Medical conditions**: allergies, infections, chronic conditions
• **Injuries**: cuts, burns, sprains, fractures
• **General health**: nutrition, exercise, wellness

**What you asked about:** "${symptoms}"

**How I can help:** Please describe any health symptoms, medical concerns, or wellness questions you have. I'm here to provide health-related guidance and recommendations.

*Note: I'm designed specifically for health and medical topics. For other questions, please use appropriate resources.*`,
        symptoms: [],
        severity: "Not Applicable",
        recommendations: []
      };
    }
    
    // Common health conditions and their structured responses
    const healthConditions: Record<string, any> = {
      cancer: {
        problem: "Cancer Concerns",
        possibleCauses: [
          "Various types of cancer can present with different symptoms",
          "Genetic factors and family history",
          "Environmental and lifestyle factors",
          "Age-related risk factors"
        ],
        severity: "EMERGENCY - Requires Immediate Medical Evaluation",
        immediateSteps: [
          "**Seek immediate medical attention** - this is a serious concern",
          "Contact your primary care physician immediately",
          "Do not delay seeking professional medical help",
          "Document all symptoms and their timeline",
          "Bring complete medical and family history"
        ],
        whenToSeekHelp: [
          "**Immediately** - cancer concerns require urgent professional evaluation",
          "Any unexplained symptoms that persist",
          "Unexplained weight loss or fatigue",
          "Unusual lumps, bumps, or skin changes",
          "Persistent pain or discomfort"
        ],
        recommendedTests: ["Professional medical evaluation required", "May include imaging, blood tests, biopsies"],
        specialist: "Oncologist (cancer specialist) - start with General Practitioner for referral"
      },
      headache: {
        problem: "Headache",
        possibleCauses: [
          "Tension or stress-related muscle tightness",
          "Dehydration or hunger",
          "Eye strain from screen time or reading",
          "Sinus pressure or allergies",
          "Caffeine withdrawal or excess",
          "Poor sleep quality or sleep apnea",
          "Neck or shoulder muscle tension",
          "Bright lights or loud noises"
        ],
        severity: "Mild to Moderate",
        immediateSteps: [
          "Rest in a quiet, dark, cool room",
          "Stay hydrated with water or electrolyte drinks",
          "Apply cold compress to forehead or warm compress to neck",
          "Practice progressive muscle relaxation",
          "Take over-the-counter pain relievers if appropriate",
          "Gentle neck and shoulder stretches"
        ],
        whenToSeekHelp: [
          "Severe, sudden 'thunderclap' headache",
          "Headache with fever, stiff neck, or rash",
          "Headache after head injury or fall",
          "Headache with confusion, weakness, or vision changes",
          "Headache that wakes you from sleep",
          "Headache lasting more than 24 hours"
        ],
        recommendedTests: ["Blood pressure check", "Eye examination", "Neurological evaluation if severe"],
        specialist: "Neurologist or General Practitioner"
      },
      fever: {
        problem: "Fever",
        possibleCauses: [
          "Viral or bacterial infection",
          "Inflammatory conditions",
          "Heat exhaustion",
          "Medication side effects",
          "Autoimmune disorders"
        ],
        severity: "Moderate to High",
        immediateSteps: [
          "Rest and stay hydrated",
          "Take acetaminophen or ibuprofen",
          "Use cool compresses",
          "Wear light clothing",
          "Monitor temperature regularly"
        ],
        whenToSeekHelp: [
          "Temperature above 103°F (39.4°C)",
          "Fever lasting more than 3 days",
          "Fever with severe symptoms",
          "Fever in infants under 3 months"
        ],
        recommendedTests: ["Complete blood count", "Urine analysis", "Chest X-ray if needed"],
        specialist: "General Practitioner or Infectious Disease Specialist"
      },
      cough: {
        problem: "Cough",
        possibleCauses: [
          "Upper respiratory infection",
          "Allergies",
          "Post-nasal drip",
          "Acid reflux",
          "Asthma",
          "Smoking or environmental irritants"
        ],
        severity: "Mild to Moderate",
        immediateSteps: [
          "Stay hydrated with warm fluids",
          "Use honey for soothing (adults only)",
          "Use a humidifier",
          "Avoid irritants and smoking",
          "Rest your voice"
        ],
        whenToSeekHelp: [
          "Cough lasting more than 2 weeks",
          "Cough with blood or colored mucus",
          "Cough with chest pain or difficulty breathing",
          "Cough with fever"
        ],
        recommendedTests: ["Chest X-ray", "Spirometry", "Allergy testing"],
        specialist: "Pulmonologist or General Practitioner"
      },
      fatigue: {
        problem: "Fatigue",
        possibleCauses: [
          "Lack of sleep or poor sleep quality",
          "Stress, anxiety, or depression",
          "Poor nutrition or dehydration",
          "Anemia or iron deficiency",
          "Thyroid disorders (hypothyroidism)",
          "Chronic conditions or infections",
          "Medication side effects",
          "Lack of physical activity"
        ],
        severity: "Mild to Moderate",
        immediateSteps: [
          "Prioritize 7-9 hours of quality sleep",
          "Establish consistent sleep-wake schedule",
          "Stay hydrated throughout the day",
          "Eat nutrient-rich meals with protein",
          "Take short breaks during work",
          "Practice stress-reduction techniques"
        ],
        whenToSeekHelp: [
          "Fatigue lasting more than 2 weeks",
          "Fatigue with unexplained weight loss",
          "Fatigue with fever or night sweats",
          "Fatigue affecting work or relationships",
          "Fatigue with muscle weakness or pain"
        ],
        recommendedTests: ["Complete blood count", "Thyroid function tests", "Vitamin D and B12 levels", "Sleep study if needed"],
        specialist: "General Practitioner or Endocrinologist"
      },
      nausea: {
        problem: "Nausea",
        possibleCauses: [
          "Gastroenteritis",
          "Food poisoning",
          "Motion sickness",
          "Pregnancy",
          "Medication side effects",
          "Anxiety or stress"
        ],
        severity: "Mild to Moderate",
        immediateSteps: [
          "Rest and avoid sudden movements",
          "Stay hydrated with small sips of clear fluids",
          "Eat bland foods (BRAT diet: bananas, rice, applesauce, toast)",
          "Avoid strong odors and greasy foods",
          "Practice deep breathing exercises"
        ],
        whenToSeekHelp: [
          "Severe or persistent nausea",
          "Nausea with severe abdominal pain",
          "Nausea with vomiting blood",
          "Nausea with signs of dehydration"
        ],
        recommendedTests: ["Blood tests", "Stool analysis", "Abdominal ultrasound if needed"],
        specialist: "Gastroenterologist or General Practitioner"
      },
      chest: {
        problem: "Chest Pain",
        possibleCauses: [
          "Heart-related conditions (angina, heart attack)",
          "Lung conditions (pneumonia, pleurisy)",
          "Gastrointestinal issues (acid reflux, GERD)",
          "Musculoskeletal problems (costochondritis)",
          "Anxiety or panic attacks"
        ],
        severity: "EMERGENCY - Life-Threatening Risk",
        immediateSteps: [
          "**Seek emergency medical care immediately**",
          "Call emergency services if severe chest pain",
          "Do not drive yourself to the hospital",
          "Stay calm and rest while waiting for help",
          "Note the exact location and nature of pain"
        ],
        whenToSeekHelp: [
          "**Immediately** - chest pain can be life-threatening",
          "Severe, crushing, or pressure-like chest pain",
          "Pain radiating to arm, jaw, or back",
          "Chest pain with shortness of breath",
          "Chest pain with sweating or nausea"
        ],
        recommendedTests: ["Emergency evaluation", "ECG/EKG", "Chest X-ray", "Blood tests"],
        specialist: "Emergency care first, then Cardiologist or Pulmonologist"
      },
      heart: {
        problem: "Heart-Related Symptoms",
        possibleCauses: [
          "Coronary artery disease or atherosclerosis",
          "Heart attack (myocardial infarction)",
          "Arrhythmias or irregular heartbeats",
          "Heart failure or cardiomyopathy",
          "Valvular heart disease",
          "Pericarditis or inflammation"
        ],
        severity: "EMERGENCY - Life-Threatening Risk",
        immediateSteps: [
          "**Seek emergency medical care immediately**",
          "Call emergency services (911) without delay",
          "Do not drive yourself to the hospital",
          "Stay calm and rest in a comfortable position",
          "Note exact symptoms, timing, and any triggers"
        ],
        whenToSeekHelp: [
          "**Immediately** - heart symptoms can be life-threatening",
          "Chest pain, pressure, or tightness",
          "Pain radiating to arm, jaw, neck, or back",
          "Shortness of breath or difficulty breathing",
          "Irregular heartbeat or palpitations",
          "Dizziness, lightheadedness, or fainting"
        ],
        recommendedTests: ["Emergency evaluation", "ECG/EKG", "Cardiac enzymes", "Echocardiogram", "Stress test"],
        specialist: "Emergency care first, then Cardiologist"
      },
      back: {
        problem: "Back Pain",
        possibleCauses: [
          "Muscle strain or sprain",
          "Poor posture or ergonomics",
          "Herniated disc or spinal issues",
          "Arthritis or degenerative changes",
          "Osteoporosis or bone problems",
          "Kidney or organ issues"
        ],
        severity: "Mild to Moderate",
        immediateSteps: [
          "Rest in a comfortable position",
          "Apply ice for first 48 hours, then heat",
          "Gentle stretching and range of motion exercises",
          "Maintain good posture",
          "Use proper lifting techniques",
          "Consider over-the-counter pain relievers"
        ],
        whenToSeekHelp: [
          "Severe or worsening pain",
          "Pain with numbness or tingling in legs",
          "Pain with bowel or bladder problems",
          "Pain after injury or accident",
          "Pain lasting more than 2 weeks"
        ],
        recommendedTests: ["Physical examination", "X-rays", "MRI if needed", "Blood tests for inflammation"],
        specialist: "Orthopedist, Physical Therapist, or General Practitioner"
      },
      joint: {
        problem: "Joint Pain or Stiffness",
        possibleCauses: [
          "Arthritis (osteoarthritis or rheumatoid)",
          "Joint injury or overuse",
          "Bursitis or tendinitis",
          "Gout or crystal deposits",
          "Lupus or autoimmune conditions",
          "Infection or inflammation"
        ],
        severity: "Mild to Moderate",
        immediateSteps: [
          "Rest the affected joint",
          "Apply ice to reduce swelling",
          "Gentle range of motion exercises",
          "Use supportive devices if needed",
          "Maintain healthy weight",
          "Consider anti-inflammatory medications"
        ],
        whenToSeekHelp: [
          "Severe joint pain or swelling",
          "Joint pain with fever or redness",
          "Joint pain affecting daily activities",
          "Joint pain with other symptoms",
          "Pain not improving with rest"
        ],
        recommendedTests: ["Joint examination", "X-rays", "Blood tests for inflammation", "Joint fluid analysis if needed"],
        specialist: "Rheumatologist, Orthopedist, or General Practitioner"
      }
    };

    // Find matching condition or use generic response
    let condition = null;
    
    // Check for serious symptoms first
    const seriousSymptoms = ['cancer', 'tumor', 'chest', 'heart', 'stroke', 'seizure', 'bleeding', 'fainting', 'paralysis'];
    for (const symptom of seriousSymptoms) {
      if (lowerSymptoms.includes(symptom)) {
        condition = healthConditions[symptom] || healthConditions['cancer']; // fallback to cancer for serious symptoms
        break;
      }
    }
    
    // Check for specific body part symptoms
    if (!condition) {
      if (lowerSymptoms.includes('back') || lowerSymptoms.includes('spine')) {
        condition = healthConditions['back'];
      } else if (lowerSymptoms.includes('joint') || lowerSymptoms.includes('knee') || lowerSymptoms.includes('hip') || lowerSymptoms.includes('shoulder')) {
        condition = healthConditions['joint'];
      }
    }
    
    // If no serious symptoms, check for common conditions
    if (!condition) {
      for (const [key, value] of Object.entries(healthConditions)) {
        if (lowerSymptoms.includes(key)) {
          condition = value;
          break;
        }
      }
    }

    if (condition) {
      return {
        content: `🤖 **AI Analysis Complete!**

## Health Problem Analysis: ${condition.problem}

**Possible Causes:**
${condition.possibleCauses.map(cause => `• ${cause}`).join('\n')}

**Severity Level:** ${condition.severity}

**Immediate Steps to Take:**
${condition.immediateSteps.map(step => `• ${step}`).join('\n')}

**When to Seek Medical Help:**
${condition.whenToSeekHelp.map(symptom => `• ${symptom}`).join('\n')}

**Recommended Tests:** ${condition.recommendedTests.join(', ')}

**Recommended Specialist:** ${condition.specialist}

*This analysis was provided by SehatBeat AI. Always consult healthcare professionals for medical decisions.*`,
        symptoms: [condition.problem],
        severity: condition.severity,
        recommendations: [...condition.immediateSteps, ...condition.whenToSeekHelp]
      };
    } else {
      // Generate varied responses based on symptom patterns
      const symptomPatterns = {
        pain: {
          severity: "MODERATE - Monitor Closely",
          immediateSteps: [
            "Apply appropriate pain relief methods (ice/heat)",
            "Rest the affected area",
            "Take over-the-counter pain relievers if appropriate",
            "Monitor pain intensity and duration",
            "Avoid activities that worsen the pain"
          ],
          whenToSeekHelp: [
            "Pain that is severe or worsening",
            "Pain lasting more than 24-48 hours",
            "Pain with swelling, redness, or fever",
            "Pain affecting daily activities"
          ],
          specialist: "General Practitioner or appropriate specialist based on location"
        },
        rash: {
          severity: "MILD to MODERATE",
          immediateSteps: [
            "Keep the area clean and dry",
            "Avoid scratching or irritating the rash",
            "Apply cool compresses if itchy",
            "Use gentle, fragrance-free skincare products",
            "Monitor for signs of infection"
          ],
          whenToSeekHelp: [
            "Rash spreading rapidly",
            "Rash with fever or other symptoms",
            "Rash that is painful or blistered",
            "Rash not improving after 2-3 days"
          ],
          specialist: "Dermatologist or General Practitioner"
        },
        digestive: {
          severity: "MILD to MODERATE",
          immediateSteps: [
            "Stay hydrated with clear fluids",
            "Eat bland, easy-to-digest foods",
            "Avoid spicy, fatty, or irritating foods",
            "Rest and avoid strenuous activity",
            "Monitor for dehydration signs"
          ],
          whenToSeekHelp: [
            "Severe or persistent symptoms",
            "Blood in stool or vomit",
            "Signs of dehydration",
            "Symptoms lasting more than 2-3 days"
          ],
          specialist: "Gastroenterologist or General Practitioner"
        },
        respiratory: {
          severity: "MODERATE - Monitor Breathing",
          immediateSteps: [
            "Rest in a comfortable position",
            "Stay hydrated with warm fluids",
            "Use a humidifier if available",
            "Avoid smoke and strong odors",
            "Practice deep breathing exercises"
          ],
          whenToSeekHelp: [
            "Difficulty breathing or shortness of breath",
            "Chest pain or tightness",
            "Blue lips or fingertips",
            "Symptoms worsening rapidly"
          ],
          specialist: "Pulmonologist or General Practitioner"
        },
        neurological: {
          severity: "MODERATE to HIGH",
          immediateSteps: [
            "Rest in a safe, quiet environment",
            "Avoid driving or operating machinery",
            "Stay hydrated and eat regular meals",
            "Monitor symptoms closely",
            "Have someone stay with you if possible"
          ],
          whenToSeekHelp: [
            "Severe or sudden onset symptoms",
            "Loss of consciousness or confusion",
            "Severe headache or vision changes",
            "Weakness or numbness on one side"
          ],
          specialist: "Neurologist or General Practitioner"
        }
      };

      // Determine the most appropriate pattern based on symptoms
      let selectedPattern = symptomPatterns.digestive; // default
      if (lowerSymptoms.includes('pain') || lowerSymptoms.includes('ache') || lowerSymptoms.includes('sore')) {
        selectedPattern = symptomPatterns.pain;
      } else if (lowerSymptoms.includes('rash') || lowerSymptoms.includes('itch') || lowerSymptoms.includes('skin')) {
        selectedPattern = symptomPatterns.rash;
      } else if (lowerSymptoms.includes('stomach') || lowerSymptoms.includes('nausea') || lowerSymptoms.includes('diarrhea') || lowerSymptoms.includes('constipation')) {
        selectedPattern = symptomPatterns.digestive;
      } else if (lowerSymptoms.includes('cough') || lowerSymptoms.includes('breathing') || lowerSymptoms.includes('chest') || lowerSymptoms.includes('throat')) {
        selectedPattern = symptomPatterns.respiratory;
      } else if (lowerSymptoms.includes('dizzy') || lowerSymptoms.includes('headache') || lowerSymptoms.includes('numb') || lowerSymptoms.includes('tingling')) {
        selectedPattern = symptomPatterns.neurological;
      }

      return {
        content: `🤖 **AI Analysis Complete!**

## Health Problem Analysis: ${symptoms}

**Symptoms Reported:** ${symptoms}

**Severity Level:** ${selectedPattern.severity}

**Immediate Steps to Take:**
${selectedPattern.immediateSteps.map(step => `• ${step}`).join('\n')}

**When to Seek Medical Help:**
${selectedPattern.whenToSeekHelp.map(symptom => `• ${symptom}`).join('\n')}

**Recommended Tests:** Professional medical evaluation based on symptoms
**Recommended Specialist:** ${selectedPattern.specialist}

**Important Note:** While these steps may help manage symptoms, professional medical evaluation is recommended for proper diagnosis and treatment.

*This analysis was provided by SehatBeat AI. Always consult healthcare professionals for medical decisions.*`,
        symptoms: [symptoms],
        severity: selectedPattern.severity,
        recommendations: [...selectedPattern.immediateSteps, ...selectedPattern.whenToSeekHelp]
      };
    }
  };

  // Function to get severity color scheme and icon
  const getSeverityInfo = (severity: string) => {
    const lowerSeverity = severity.toLowerCase();
    
    if (lowerSeverity.includes('emergency') || lowerSeverity.includes('immediate') || lowerSeverity.includes('life-threatening')) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-800',
        contentText: 'text-red-700',
        icon: 'text-red-500',
        severityIcon: AlertOctagon,
        label: '🚨 EMERGENCY'
      };
    } else if (lowerSeverity.includes('high') || lowerSeverity.includes('severe') || lowerSeverity.includes('urgent')) {
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        text: 'text-orange-800',
        contentText: 'text-orange-700',
        icon: 'text-orange-500',
        severityIcon: AlertCircle,
        label: '⚠️ URGENT'
      };
    } else if (lowerSeverity.includes('moderate') || lowerSeverity.includes('requires evaluation') || lowerSeverity.includes('professional')) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        text: 'text-yellow-800',
        contentText: 'text-yellow-700',
        icon: 'text-yellow-500',
        severityIcon: AlertTriangle,
        label: '⚠️ MODERATE'
      };
    } else if (lowerSeverity.includes('mild') || lowerSeverity.includes('low')) {
      return {
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-800',
        contentText: 'text-green-700',
        icon: 'text-green-500',
        severityIcon: CheckCircle,
        label: '✅ MILD'
      };
    } else {
      // Default for unknown severity
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-800',
        contentText: 'text-blue-700',
        icon: 'text-blue-500',
        severityIcon: Info,
        label: 'ℹ️ INFO'
      };
    }
  };

  // Function to render message content with markdown-like formatting
  const renderMessageContent = (content: string, metadata?: Message['metadata']) => {
    if (metadata && metadata.symptoms && metadata.severity && metadata.recommendations) {
      const severityInfo = getSeverityInfo(metadata.severity);
      const SeverityIcon = severityInfo.severityIcon;
      
      // Render structured health response
      return (
        <div className="space-y-3 max-w-full">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
            <h4 className="font-semibold text-blue-800 mb-2 text-sm">Health Problem Analysis</h4>
            <div className="space-y-1 text-xs text-blue-700">
              {metadata.symptoms.map((symptom, index) => (
                <div key={index} className="flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-2 text-orange-500 flex-shrink-0" />
                  <span className="break-words">{symptom}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className={`${severityInfo.bg} border-l-4 ${severityInfo.border} p-3 rounded-r-lg`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-semibold ${severityInfo.text} text-sm`}>Severity Level</h4>
              <span className={`text-xs font-bold ${severityInfo.text} bg-white/50 px-2 py-1 rounded-full`}>
                {severityInfo.label}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <SeverityIcon className={`w-4 h-4 ${severityInfo.icon} flex-shrink-0`} />
              <p className={`text-xs ${severityInfo.contentText} break-words font-medium`}>{metadata.severity}</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
            <h4 className="font-semibold text-yellow-800 mb-2 text-sm">Immediate Steps</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              {metadata.recommendations.slice(0, 5).map((rec, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  <span className="break-words">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
            <h4 className="font-semibold text-purple-800 mb-2 text-sm">Important Note</h4>
            <p className="text-xs text-purple-700 break-words">
              This analysis is for informational purposes only. Always consult with a healthcare professional for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      );
    }
    
    // Render regular message content
    return <p className="whitespace-pre-wrap break-words">{content}</p>;
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-primary text-primary-foreground shadow-strong hover:shadow-glow transition-all duration-300 lg:bottom-8 lg:right-8 animate-float"
        size="lg"
      >
        <div className="relative">
          <Bot className="w-8 h-8" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
        </div>
      </Button>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <Card className={`fixed z-50 bg-background/95 backdrop-blur-md border shadow-strong transition-all duration-300 overflow-hidden ${
        isMinimized 
          ? "bottom-6 right-6 w-80 h-16 lg:bottom-8 lg:right-8"
          : "bottom-6 right-6 w-96 h-[500px] lg:bottom-8 lg:right-8 lg:w-[420px] lg:h-[600px]"
      }`}>
        {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-primary rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
          </div>
          {!isMinimized && (
            <div>
              <h3 className="font-semibold text-primary-foreground">SehatBeat AI</h3>
              <p className="text-xs text-primary-foreground/70">
                {isTyping ? "Analyzing..." : "Online"}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-primary-foreground hover:bg-white/20 w-8 h-8 p-0"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground hover:bg-white/20 w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-4 chat-messages"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(59, 130, 246, 0.7) rgba(0, 0, 0, 0.05)',
              maxHeight: '400px'
            }}
          >
            <div className="space-y-4 max-w-full pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm break-words overflow-hidden ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted text-foreground'
                    }`}
                    style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                  >
                    <div className="overflow-x-auto max-w-full">
                      {renderMessageContent(message.content, message.metadata)}
                    </div>
                    <span className="text-xs opacity-70 mt-2 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground animate-pulse" />
                      <span className="text-sm text-muted-foreground">Analyzing symptoms...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Describe your symptoms..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                type="submit"
                size="sm"
                className="bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong"
                disabled={isTyping || !inputMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>

        </>
      )}
    </Card>
    </>
  );
};