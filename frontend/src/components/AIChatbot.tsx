import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  Loader2,
  Stethoscope,
  Heart,
  AlertTriangle,
  Info,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  bodyPart?: string;
  symptoms?: string[];
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  initialBodyPart?: string;
  initialSymptoms?: string[];
}

const AIChatbot: React.FC<AIChatbotProps> = ({ 
  isOpen, 
  onClose, 
  initialBodyPart, 
  initialSymptoms 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Initialize chat with body part context
  useEffect(() => {
    if (isOpen && initialBodyPart && initialSymptoms) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'bot',
        content: `Hello! I'm SehatBeat AI, your health assistant. I see you're experiencing symptoms related to your ${initialBodyPart.toLowerCase()}. 

I can help you:
• Analyze your symptoms
• Provide health insights
• Suggest possible conditions
• Recommend next steps

What specific symptoms are you experiencing with your ${initialBodyPart.toLowerCase()}?`,
        timestamp: new Date(),
        bodyPart: initialBodyPart,
        symptoms: initialSymptoms
      };

      setMessages([welcomeMessage]);
      setChatHistory([welcomeMessage]);
    } else if (isOpen) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'bot',
        content: `Hello! I'm SehatBeat AI, your personal health assistant. I'm here to help you understand your symptoms and provide health guidance.

How can I help you today? You can:
• Describe your symptoms
• Ask about specific health concerns
• Get information about conditions
• Learn about preventive care

Please note: I provide informational guidance only and cannot replace professional medical advice.`,
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);
      setChatHistory([welcomeMessage]);
    }
  }, [isOpen, initialBodyPart, initialSymptoms]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track scroll position
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      setScrollTop(messagesContainerRef.current.scrollTop);
      setScrollHeight(messagesContainerRef.current.scrollHeight);
      setClientHeight(messagesContainerRef.current.clientHeight);
    }
  };

  // Scroll functions
  const scrollUp = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop -= 100;
    }
  };

  const scrollDown = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop += 100;
    }
  };

  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    let aiResponse = '';
    const lowerMessage = userMessage.toLowerCase();

    // Context-aware responses based on body part and symptoms
    if (initialBodyPart && initialSymptoms) {
      aiResponse = generateBodyPartSpecificResponse(userMessage, initialBodyPart, initialSymptoms);
    } else {
      aiResponse = generateGeneralHealthResponse(userMessage);
    }

    const botMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: aiResponse,
      timestamp: new Date(),
      bodyPart: initialBodyPart,
      symptoms: initialSymptoms
    };

    setMessages(prev => [...prev, botMessage]);
    setChatHistory(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const generateBodyPartSpecificResponse = (userMessage: string, bodyPart: string, symptoms: string[]) => {
    const lowerMessage = userMessage.toLowerCase();
    const lowerBodyPart = bodyPart.toLowerCase();

    // Head-specific responses
    if (lowerBodyPart.includes('head')) {
      if (lowerMessage.includes('headache') || lowerMessage.includes('pain')) {
        return `Based on your headache symptoms, here are some insights:

🔍 **Possible Causes:**
• Tension headaches (most common)
• Migraine
• Sinus pressure
• Dehydration
• Eye strain

💡 **Immediate Actions:**
• Rest in a quiet, dark room
• Stay hydrated
• Apply cold compress to forehead
• Practice deep breathing

⚠️ **Seek Medical Attention If:**
• Severe, sudden headache
• Headache with fever and stiff neck
• Headache after head injury
• Headache with confusion or vision changes

Would you like me to help you assess the severity or suggest when to see a doctor?`;
      }
    }

    // Chest-specific responses
    if (lowerBodyPart.includes('chest')) {
      if (lowerMessage.includes('pain') || lowerMessage.includes('pressure')) {
        return `Chest symptoms require careful attention. Here's what you should know:

🔍 **Possible Causes:**
• Muscle strain or costochondritis
• Acid reflux or heartburn
• Anxiety or stress
• Respiratory conditions
• Heart-related issues (less common but serious)

💡 **Immediate Actions:**
• Stay calm and rest
• Note the type and location of pain
• Monitor for other symptoms

🚨 **EMERGENCY - Call 911 if you have:**
• Crushing chest pressure
• Pain radiating to arm, jaw, or back
• Shortness of breath
• Sweating, nausea, or dizziness

This could indicate a heart attack. Always err on the side of caution with chest symptoms.`;
      }
    }

    // Abdomen-specific responses
    if (lowerBodyPart.includes('abdomen')) {
      if (lowerMessage.includes('pain') || lowerMessage.includes('cramp')) {
        return `Abdominal symptoms can have many causes. Let me help you understand:

🔍 **Possible Causes:**
• Digestive issues (gas, bloating)
• Food intolerance
• Stomach virus
• Stress or anxiety
• More serious conditions

💡 **Immediate Actions:**
• Stay hydrated
• Eat bland foods (BRAT diet)
• Rest and avoid strenuous activity
• Monitor for fever or severe pain

⚠️ **Seek Medical Attention If:**
• Severe, persistent pain
• Pain with fever
• Pain with vomiting or diarrhea
• Pain that worsens over time

Can you describe the type of pain (sharp, dull, cramping) and its location?`;
      }
    }

    // General body part response
    return `Thank you for sharing your ${lowerBodyPart} symptoms. I can help you understand what might be happening and suggest next steps.

🔍 **What I can help with:**
• Symptom analysis
• Possible causes
• Self-care recommendations
• When to seek medical help

💡 **Next steps:**
• Describe your symptoms in detail
• Mention any triggers or patterns
• Share how long you've had symptoms
• Note any other health changes

Remember, I'm here to provide information and guidance, but always consult healthcare professionals for proper diagnosis and treatment.`;
  };

  const generateGeneralHealthResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      return `Fever is your body's natural response to infection. Here's what you should know:

🌡️ **Fever Guidelines:**
• Normal: 97°F - 99°F (36.1°C - 37.2°C)
• Low-grade: 99°F - 100.4°F (37.2°C - 38°C)
• Moderate: 100.4°F - 102.2°F (38°C - 39°C)
• High: Above 102.2°F (39°C)

💡 **Self-care:**
• Rest and stay hydrated
• Take acetaminophen or ibuprofen if needed
• Monitor for other symptoms
• Keep track of temperature

⚠️ **Seek medical attention for:**
• Fever above 103°F (39.4°C)
• Fever lasting more than 3 days
• Fever with severe symptoms
• Fever in infants under 3 months

How high is your temperature and how long have you had it?`;
    }

    if (lowerMessage.includes('fatigue') || lowerMessage.includes('tired')) {
      return `Fatigue can have many causes. Let me help you understand:

😴 **Common Causes:**
• Lack of sleep
• Stress or anxiety
• Poor nutrition
• Dehydration
• Physical or mental exertion
• Medical conditions

💡 **Self-care strategies:**
• Prioritize 7-9 hours of sleep
• Stay hydrated throughout the day
• Eat balanced meals
• Practice stress management
• Gentle exercise or stretching

⚠️ **When to see a doctor:**
• Fatigue lasting more than 2 weeks
• Fatigue with other symptoms
• Fatigue affecting daily activities
• Sudden onset of severe fatigue

How long have you been feeling fatigued and what's your typical sleep pattern?`;
    }

    if (lowerMessage.includes('cough') || lowerMessage.includes('cold')) {
      return `Respiratory symptoms are common. Here's what you should know:

🤧 **Common Causes:**
• Viral infections (common cold, flu)
• Allergies
• Post-nasal drip
• Irritants (smoke, dust)
• Acid reflux

💡 **Self-care:**
• Stay hydrated
• Rest and get adequate sleep
• Use honey for cough relief
• Humidify your environment
• Avoid irritants

⚠️ **Seek medical attention for:**
• Cough lasting more than 3 weeks
• Cough with blood or colored mucus
• Cough with chest pain or shortness of breath
• Cough with fever over 101°F

Are you experiencing any other symptoms along with the cough?`;
    }

    // Default response
    return `Thank you for sharing your health concern. I'm here to help you understand your symptoms and provide guidance.

🔍 **How I can help:**
• Analyze your symptoms
• Explain possible causes
• Suggest self-care measures
• Guide you on when to seek medical help

💡 **To help you better, please:**
• Describe your symptoms in detail
• Mention how long you've had them
• Note any triggers or patterns
• Share any other health changes

Remember, while I can provide information and guidance, I cannot diagnose medical conditions. Always consult healthcare professionals for proper medical advice.`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      bodyPart: initialBodyPart,
      symptoms: initialSymptoms
    };

    setMessages(prev => [...prev, userMessage]);
    setChatHistory(prev => [...prev, userMessage]);
    setInputMessage('');

    // Generate AI response
    await simulateAIResponse(inputMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            SehatBeat AI Assistant
            {initialBodyPart && (
              <Badge variant="secondary" className="ml-2">
                <Stethoscope className="h-3 w-3 mr-1" />
                {initialBodyPart}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col">
          {/* Messages Area with Custom Scrollbar */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 relative"
            style={{ maxHeight: 'calc(100vh - 300px)' }}
          >
            {/* Container to ensure messages stay within bounds */}
            <div className="relative w-full h-full">
            {/* Scroll Buttons */}
            <div className="absolute right-4 top-2 flex flex-col gap-1 z-10">
              <button
                onClick={scrollToTop}
                className="p-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                title="Scroll to top"
              >
                <ChevronUp className="h-3 w-3 text-gray-600" />
              </button>
              <button
                onClick={scrollUp}
                className="p-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                title="Scroll up"
              >
                <ChevronUp className="h-3 w-3 text-gray-600" />
              </button>
              <button
                onClick={scrollDown}
                className="p-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                title="Scroll down"
              >
                <ChevronDown className="h-3 w-3 text-gray-600" />
              </button>
              <button
                onClick={scrollToBottom}
                className="p-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                title="Scroll to bottom"
              >
                <ChevronDown className="h-3 w-3 text-gray-600" />
              </button>
            </div>

            {/* Custom Scrollbar */}
            <div className="absolute right-2 top-0 bottom-0 w-2 bg-gray-200 rounded-full">
              <div 
                className="w-2 bg-blue-400 rounded-full transition-all duration-200 hover:bg-blue-500 cursor-pointer"
                style={{
                  height: `${Math.min(100, Math.max(10, (messages.length * 60) / 400))}%`,
                  top: `${Math.max(0, Math.min(90, (scrollTop / (scrollHeight - clientHeight)) * 90))}%`
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const handleMouseMove = (e: MouseEvent) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const scrollPercent = (e.clientY - rect.top) / rect.height;
                    const scrollContainer = e.currentTarget.parentElement?.parentElement;
                    if (scrollContainer) {
                      const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
                      scrollContainer.scrollTop = scrollPercent * maxScroll;
                    }
                  };
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            </div>
            
            {/* Messages Container - Ensure all messages are inside */}
            <div className="w-full space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'bot' && (
                        <Bot className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      )}
                      {message.type === 'user' && (
                        <User className="h-4 w-4 mt-0.5 text-white flex-shrink-0" />
                      )}
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                    </div>
                    <div className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start w-full">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <div className="flex space-x-1">
                        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-600">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
              💡 Tip: Be specific about your symptoms for better assistance
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChatbot;
