import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity, Search, AlertCircle, Clock, TrendingUp,
  CheckCircle, ArrowRight, Stethoscope, MessageCircle,
  Sparkles, Brain, Shield, Zap,
} from "lucide-react";
import InteractiveBodyMap3D from "@/components/InteractiveBodyMap3D";

// ─── Data ────────────────────────────────────────────────────────────────────

const commonSymptoms = [
  "Headache", "Fever", "Cough", "Sore throat", "Fatigue",
  "Nausea", "Dizziness", "Chest pain", "Back pain", "Joint pain",
  "Shortness of breath", "Stomach ache", "Rash", "Vomiting", "Weakness",
];

const recentChecks = [
  { symptoms: ["Headache", "Dizziness"], result: "Tension headache",           severity: "Low",    date: "2024-01-15" },
  { symptoms: ["Cough", "Fever"],        result: "Upper respiratory infection", severity: "Medium", date: "2024-01-10" },
];

const aiFeatures = [
  { icon: Brain,  title: "Real AI Triage",    desc: "Powered by Perplexity AI for accurate analysis",    color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/30"   },
  { icon: Zap,    title: "Instant Results",   desc: "Severity assessment and action plan in seconds",    color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  { icon: Shield, title: "Safe & Private",    desc: "Your health data is never stored or shared",        color: "text-green-500",  bg: "bg-green-50 dark:bg-green-950/30"  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SehatBeatAI = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm]             = useState("");
  const [additionalInfo, setAdditionalInfo]     = useState("");

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const filteredSymptoms = commonSymptoms.filter(s =>
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Opens the floating AIAssistant and auto-sends the selected symptoms
  const openAIWithSymptoms = (customText?: string) => {
    const text = customText ?? [
      ...selectedSymptoms,
      ...(additionalInfo.trim() ? [additionalInfo.trim()] : []),
    ].join(", ");

    if (!text) return;

    window.dispatchEvent(
      new CustomEvent("sehatbeat-open-ai", { detail: { message: text } })
    );
  };

  const openAIEmpty = () => {
    window.dispatchEvent(
      new CustomEvent("sehatbeat-open-ai", { detail: { message: "" } })
    );
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              SehatBeat{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">
                AI
              </span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            AI-powered symptom checker with interactive 3D body mapping for accurate health assessments
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300">
              <Sparkles className="w-3 h-3 mr-1" /> Powered by Perplexity AI
            </Badge>
            <Badge variant="outline">95% Accuracy Rate</Badge>
            <Badge variant="outline">Real-time Analysis</Badge>
          </div>
          <Button
            onClick={openAIEmpty}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:opacity-90 text-white shadow-lg px-6 py-5 text-base rounded-xl"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat with SehatBeat AI
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* ── Feature pills ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {aiFeatures.map(feat => (
            <div key={feat.title} className={`rounded-xl p-4 border flex items-start gap-3 ${feat.bg}`}>
              <feat.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${feat.color}`} />
              <div>
                <p className="font-semibold text-foreground text-sm">{feat.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Left: Symptom selection ── */}
          <div className="space-y-6">

            {/* Selected symptoms */}
            {selectedSymptoms.length > 0 && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-primary flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Selected Symptoms ({selectedSymptoms.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedSymptoms.map(symptom => (
                      <Badge
                        key={symptom}
                        className="bg-primary text-primary-foreground cursor-pointer hover:bg-primary/80 select-none"
                        onClick={() => toggleSymptom(symptom)}
                      >
                        {symptom} ×
                      </Badge>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:opacity-90 text-white"
                    onClick={() => openAIWithSymptoms()}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze with SehatBeat AI
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Search symptoms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Search className="w-4 h-4 text-primary" /> Search Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search for symptoms..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {filteredSymptoms.map(symptom => (
                    <Button
                      key={symptom}
                      variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                      size="sm"
                      className={`justify-start text-xs h-8 ${selectedSymptoms.includes(symptom) ? "bg-primary text-primary-foreground" : ""}`}
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {selectedSymptoms.includes(symptom) && <CheckCircle className="w-3 h-3 mr-1.5 flex-shrink-0" />}
                      {symptom}
                    </Button>
                  ))}
                </div>
                <Textarea
                  placeholder="Describe additional symptoms or context (e.g. duration, severity, what makes it worse)..."
                  value={additionalInfo}
                  onChange={e => setAdditionalInfo(e.target.value)}
                  rows={3}
                />
                {(selectedSymptoms.length > 0 || additionalInfo.trim()) && (
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:opacity-90 text-white"
                    onClick={() => openAIWithSymptoms()}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze with SehatBeat AI
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Recent checks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4 text-secondary" /> Recent Symptom Checks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentChecks.map((check, i) => (
                  <div key={i} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {check.symptoms.map(s => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                      <p className="text-sm font-medium text-foreground">{check.result}</p>
                      <p className="text-xs text-muted-foreground">{check.date}</p>
                    </div>
                    <Badge
                      variant={check.severity === "Low" ? "secondary" : check.severity === "Medium" ? "default" : "destructive"}
                      className="ml-2 flex-shrink-0"
                    >
                      {check.severity}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Body map + tips ── */}
          <div className="space-y-6">
            <InteractiveBodyMap3D />

            <Card className="border-secondary/20 bg-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-secondary">
                  <TrendingUp className="w-4 h-4" /> Health Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Symptom Tracking</p>
                    <p className="text-xs text-muted-foreground">Keep a daily log for better AI insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Stethoscope className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Professional Consultation</p>
                    <p className="text-xs text-muted-foreground">Always consult healthcare professionals for serious concerns</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Emergency Notice</p>
                    <p className="text-xs text-muted-foreground">
                      For severe symptoms — call <strong>112</strong> immediately.
                      SehatBeat AI is for informational purposes only.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SehatBeatAI;