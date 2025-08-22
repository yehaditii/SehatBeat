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
  Clock
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../lib/convex";
import { useCurrentUser } from "../../hooks/useConvex";

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
    }
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
  
  // Get user's conversation history
  const conversation = useQuery("getConversation", 
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history when available
  useEffect(() => {
    if (conversation && conversation.messages.length > 0) {
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

      // Call Perplexity AI to analyze symptoms
      try {
        const response = await fetch('http://localhost:3000/api/analyze-symptoms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symptoms: inputMessage,
            userId: currentUser?._id || "anonymous",
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('API Response:', result);
        
        // Remove the temporary analysis message
        setMessages(prev => prev.filter(msg => msg.id !== analysisMessage.id));
        
        // Add the AI response
        const aiResponse: Message = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          content: `🤖 **AI Analysis Complete!**

${result.analysis || "I've analyzed your symptoms and provided recommendations below."}

**Severity Level:** ${result.severity || "Moderate"}
**Recommendations:**
${(result.recommendations || ["Consult a healthcare professional"]).map(rec => `• ${rec}`).join('\n')}

*This analysis was provided by Perplexity AI. Always consult healthcare professionals for medical decisions.*`,
          timestamp: new Date(),
          metadata: {
            symptoms: [inputMessage],
            severity: result.severity || "Moderate",
            recommendations: result.recommendations || ["Consult a healthcare professional"]
          }
        };
        setMessages(prev => [...prev, aiResponse]);
        
        setIsTyping(false);
      } catch (fetchError) {
        console.error('Fetch Error:', fetchError);
        
        // Check if it's a network error (backend not running)
        if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
          const networkErrorResponse: Message = {
            id: (Date.now() + 2).toString(),
            type: 'bot',
            content: `🔌 **Connection Error**

I'm unable to connect to the AI service right now. This usually means:
• The backend server is not running
• There's a network connectivity issue
• The API service is temporarily unavailable

**To fix this:**
1. Make sure the backend server is running (\`npm run dev\` in backend folder)
2. Check if you have a Perplexity AI API key in your \`.env.local\` file
3. Try again in a few moments

**Fallback Advice for "${inputMessage}":**
• Rest and stay hydrated
• Monitor your symptoms closely
• Consider over-the-counter relief if appropriate
• Consult a healthcare professional if symptoms persist

This is general advice only. Please consult a healthcare professional for proper diagnosis.`,
            timestamp: new Date()
          };
          
          setMessages(prev => prev.filter(msg => msg.id !== analysisMessage.id));
          setMessages(prev => [...prev, networkErrorResponse]);
        } else {
          // Other API errors
          const errorResponse: Message = {
            id: (Date.now() + 2).toString(),
            type: 'bot',
            content: `⚠️ **API Error**

I encountered an error while analyzing your symptoms: ${fetchError.message}

**Fallback Advice for "${inputMessage}":**
• Rest and stay hydrated
• Monitor your symptoms closely
• Consider over-the-counter relief if appropriate
• Consult a healthcare professional if symptoms persist

This is general advice only. Please consult a healthcare professional for proper diagnosis.`,
            timestamp: new Date()
          };
          
          setMessages(prev => prev.filter(msg => msg.id !== analysisMessage.id));
          setMessages(prev => [...prev, errorResponse]);
        }
        
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      
      // Remove the temporary analysis message
      setMessages(prev => prev.filter(msg => msg.id !== analysisMessage.id));
      
      let errorContent = "I'm sorry, I encountered an error while analyzing your symptoms. Please try again or contact support if the problem persists.";
      
      if (error.message === 'Request timeout') {
        errorContent = "⚠️ The analysis is taking longer than expected. This might be because the AI service is temporarily unavailable. Please try again in a few moments.";
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorContent = "🔌 I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        type: 'bot',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  // Function to render message content with markdown-like formatting
  const renderMessageContent = (content: string, metadata?: Message['metadata']) => {
    if (metadata && metadata.symptoms && metadata.severity && metadata.recommendations) {
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
          
          <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
            <h4 className="font-semibold text-green-800 mb-2 text-sm">Severity Level</h4>
            <p className="text-xs text-green-700 break-words">{metadata.severity}</p>
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