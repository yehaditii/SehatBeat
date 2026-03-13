import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  X, Send, Bot, User, Minimize2, Maximize2,
  AlertTriangle, CheckCircle, AlertCircle, AlertOctagon,
  Info, Stethoscope, Pill, Activity, Phone, Clock,
  MessageCircle, Sparkles,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface StructuredResponse {
  problem: string;
  severity: string;
  severityLevel: "emergency" | "high" | "moderate" | "mild" | "info";
  possibleCauses: string[];
  immediateSteps: string[];
  whenToSeekHelp: string[];
  specialist: string;
  disclaimer: string;
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  structuredData?: StructuredResponse;
}

// ─── Perplexity API call ────────────────────────────────────────────────────────

const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY as string | undefined;

const SYSTEM_PROMPT = `You are SehatBeat AI, a compassionate medical assistant for Indian users. Respond like a friendly experienced doctor.

CRITICAL RULES:
1. Only answer health, symptoms, medicines, or wellness questions.
2. For unrelated questions return the "not health related" JSON.
3. Always recommend consulting a real doctor for serious conditions.
4. Mention Indian hospitals (AIIMS, Apollo, Fortis, govt hospitals) when relevant.

ALWAYS respond with ONLY valid JSON — no text outside the JSON object:

For health questions use:
{
  "problem": "Name of health concern",
  "severity": "One sentence describing severity",
  "severityLevel": "emergency|high|moderate|mild|info",
  "possibleCauses": ["cause 1", "cause 2", "cause 3"],
  "immediateSteps": ["step 1", "step 2", "step 3"],
  "whenToSeekHelp": ["warning sign 1", "warning sign 2"],
  "specialist": "Doctor type to consult",
  "disclaimer": "Brief reminder to consult a professional"
}

For non-health questions use:
{
  "problem": "Outside My Expertise",
  "severity": "Not applicable",
  "severityLevel": "info",
  "possibleCauses": [],
  "immediateSteps": ["I specialise in health topics only. Please describe your symptoms or a health concern and I will help you."],
  "whenToSeekHelp": [],
  "specialist": "N/A",
  "disclaimer": "SehatBeat AI handles health-related queries only."
}`;

async function callPerplexity(
  userMessage: string,
  onDone: (parsed: StructuredResponse | null, raw: string) => void,
  onError: (msg: string) => void
) {
  if (!PERPLEXITY_API_KEY) {
    onError("VITE_PERPLEXITY_API_KEY is missing in your .env file. Add it and restart the dev server.");
    return;
  }
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: 900,
        temperature: 0.2,
        stream: false,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API ${res.status}: ${txt.slice(0, 200)}`);
    }
    const json = await res.json();
    const raw: string = json.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) { onDone(null, raw); return; }
    const parsed = JSON.parse(match[0]) as StructuredResponse;
    onDone(parsed, raw);
  } catch (err) {
    onError(err instanceof Error ? err.message : String(err));
  }
}

// ─── Severity styles ────────────────────────────────────────────────────────────

const SEV_CONFIG = {
  emergency: { border: "border-red-500",    bg: "bg-red-50 dark:bg-red-950/30",     badge: "bg-red-100 text-red-800",      icon: AlertOctagon,  label: "🚨 EMERGENCY", color: "text-red-600"    },
  high:      { border: "border-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", badge: "bg-orange-100 text-orange-800", icon: AlertCircle,   label: "⚠️ URGENT",    color: "text-orange-600" },
  moderate:  { border: "border-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", badge: "bg-yellow-100 text-yellow-800", icon: AlertTriangle, label: "⚠️ MODERATE",  color: "text-yellow-600" },
  mild:      { border: "border-green-500",  bg: "bg-green-50 dark:bg-green-950/30",  badge: "bg-green-100 text-green-800",  icon: CheckCircle,   label: "✅ MILD",       color: "text-green-600"  },
  info:      { border: "border-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/30",    badge: "bg-blue-100 text-blue-800",    icon: Info,          label: "ℹ️ INFO",       color: "text-blue-600"   },
} as const;

// ─── Structured card ────────────────────────────────────────────────────────────

function StructuredCard({ data }: { data: StructuredResponse }) {
  const cfg = SEV_CONFIG[data.severityLevel] ?? SEV_CONFIG.info;
  const SevIcon = cfg.icon;
  return (
    <div className="space-y-2.5 text-sm w-full">
      {/* Header */}
      <div className={`rounded-lg p-3 border ${cfg.bg} ${cfg.border}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
            <span className="font-bold text-foreground">{data.problem}</span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <SevIcon className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.color}`} />
          <span className="text-xs text-muted-foreground">{data.severity}</span>
        </div>
      </div>

      {/* Emergency CTA */}
      {data.severityLevel === "emergency" && (
        <div className="bg-red-500 text-white rounded-lg p-3 flex items-center gap-3">
          <Phone className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <div>
            <p className="font-bold text-sm">Call Emergency Services Now</p>
            <p className="text-xs opacity-90">Dial 112 or go to nearest hospital immediately</p>
          </div>
        </div>
      )}

      {/* Possible causes */}
      {data.possibleCauses.length > 0 && (
        <div className="bg-muted/60 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Possible Causes</p>
          {data.possibleCauses.map((c, i) => (
            <div key={i} className="flex items-start gap-2 mt-1">
              <span className="text-primary font-bold flex-shrink-0 mt-0.5">•</span>
              <span className="text-xs text-foreground">{c}</span>
            </div>
          ))}
        </div>
      )}

      {/* Immediate steps */}
      {data.immediateSteps.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Pill className="w-3 h-3" /> Immediate Steps
          </p>
          {data.immediateSteps.map((s, i) => (
            <div key={i} className="flex items-start gap-2 mt-1">
              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-foreground">{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* When to seek help */}
      {data.whenToSeekHelp.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> See a Doctor If...
          </p>
          {data.whenToSeekHelp.map((w, i) => (
            <div key={i} className="flex items-start gap-2 mt-1">
              <span className="text-orange-500 font-bold flex-shrink-0">!</span>
              <span className="text-xs text-foreground">{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Specialist */}
      {data.specialist && data.specialist !== "N/A" && (
        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
          <Stethoscope className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">Recommended Specialist</p>
            <p className="text-xs text-foreground">{data.specialist}</p>
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground italic border-t pt-2">⚕️ {data.disclaimer}</p>
    </div>
  );
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "I have a headache and fever",
  "My chest feels tight",
  "Stomach pain since morning",
  "Feeling very tired lately",
  "Sore throat and cough",
];

const WELCOME_DATA: StructuredResponse = {
  problem: "Welcome to SehatBeat AI",
  severity: "Your personal AI health companion — powered by Perplexity AI",
  severityLevel: "info",
  possibleCauses: [],
  immediateSteps: [
    "Describe your symptoms in detail for accurate analysis",
    "Ask about any medicine, condition, or health concern",
    "Get instant triage and specialist recommendations",
  ],
  whenToSeekHelp: [],
  specialist: "N/A",
  disclaimer: "I provide informational guidance only. Always consult a licensed doctor for diagnosis and treatment.",
};

// ─── Main component ─────────────────────────────────────────────────────────────

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", type: "bot", content: "", timestamp: new Date(), structuredData: WELCOME_DATA },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen, isMinimized]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;

    const uid = Date.now().toString();
    const tid = (Date.now() + 1).toString();

    setMessages(prev => [
      ...prev,
      { id: uid, type: "user", content: msg, timestamp: new Date() },
      { id: tid, type: "bot",  content: "",  timestamp: new Date(), isThinking: true },
    ]);
    setInput("");
    setIsLoading(true);

    await callPerplexity(
      msg,
      (parsed, raw) => {
        setMessages(prev => prev.map(m =>
          m.id === tid ? { ...m, isThinking: false, content: raw, structuredData: parsed ?? undefined } : m
        ));
        setIsLoading(false);
        if (parsed?.severityLevel === "emergency") {
          toast({ title: "🚨 Emergency Detected", description: "Call 112 or go to nearest hospital immediately.", variant: "destructive" });
        }
      },
      (errMsg) => {
        setMessages(prev => prev.map(m =>
          m.id === tid ? { ...m, isThinking: false, content: `Unable to connect to AI.\n\n${errMsg}` } : m
        ));
        setIsLoading(false);
        toast({ title: "Connection Error", description: "Check your VITE_PERPLEXITY_API_KEY in .env", variant: "destructive" });
      }
    );
  }, [input, isLoading, toast]);

  // Listen for events dispatched by SehatBeatAI page (Analyze button)
  useEffect(() => {
    const handler = (e: Event) => {
      const { message } = (e as CustomEvent<{ message: string }>).detail;
      setIsOpen(true);
      setIsMinimized(false);
      if (message) setTimeout(() => sendMessage(message), 350);
    };
    window.addEventListener("sehatbeat-open-ai", handler);
    return () => window.removeEventListener("sehatbeat-open-ai", handler);
  }, [sendMessage]);

  // ── Floating button ──────────────────────────────────────────────────────────

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open SehatBeat AI"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 lg:bottom-8 lg:right-8 flex items-center justify-center"
      >
        <div className="relative">
          <Bot className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </div>
      </button>
    );
  }

  // ── Chat panel ───────────────────────────────────────────────────────────────

  return (
    <Card className={`fixed z-50 bg-background border shadow-2xl transition-all duration-300 flex flex-col overflow-hidden
      ${isMinimized
        ? "bottom-6 right-6 w-72 h-14 lg:bottom-8 lg:right-8"
        : "bottom-6 right-6 w-[370px] h-[590px] lg:bottom-8 lg:right-8 lg:w-[400px] lg:h-[640px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-500 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-teal-500" />
          </div>
          {!isMinimized && (
            <div>
              <p className="font-bold text-white text-sm leading-tight">SehatBeat AI</p>
              <p className="text-white/70 text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {isLoading ? "Analyzing..." : "Powered by Perplexity AI"}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setIsMinimized(v => !v)} className="text-white hover:bg-white/20 w-8 h-8 p-0">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 w-8 h-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-start gap-2.5 ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === "bot" ? "bg-gradient-to-br from-blue-500 to-teal-500" : "bg-secondary"}`}>
                  {msg.type === "bot" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-secondary-foreground" />}
                </div>
                {/* Bubble */}
                <div className={`max-w-[84%] rounded-2xl px-3 py-2.5 ${msg.type === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}>
                  {msg.isThinking ? (
                    <div className="flex items-center gap-2 py-1">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => (
                          <span key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">Analyzing with AI...</span>
                    </div>
                  ) : msg.structuredData ? (
                    <StructuredCard data={msg.structuredData} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                  )}
                  {!msg.isThinking && (
                    <span className="text-[11px] opacity-50 mt-1.5 block">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips */}
          {messages.filter(m => m.type === "user").length === 0 && (
            <div className="px-3 pb-2 flex gap-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs whitespace-nowrap bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full px-3 py-1.5 transition-colors flex-shrink-0">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t flex-shrink-0">
            <div className="flex gap-2 items-center">
              <Input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Describe your symptoms..."
                disabled={isLoading}
                className="flex-1 text-sm rounded-full h-9 px-4"
              />
              <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()} size="sm"
                className="w-9 h-9 rounded-full p-0 bg-gradient-to-br from-blue-500 to-teal-500 hover:opacity-90 flex-shrink-0">
                {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-center text-[11px] text-muted-foreground mt-2 flex items-center justify-center gap-1">
              <MessageCircle className="w-3 h-3" /> Not a substitute for professional medical advice
            </p>
          </div>
        </>
      )}
    </Card>
  );
};