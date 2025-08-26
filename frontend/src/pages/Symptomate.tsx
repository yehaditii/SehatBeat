import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { 
  Activity, 
  Search, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Stethoscope,
  MessageCircle
} from "lucide-react";
import InteractiveBodyMap3D from "@/components/InteractiveBodyMap3D";
import AIChatbot from "@/components/AIChatbot";

const commonSymptoms = [
  "Headache", "Fever", "Cough", "Sore throat", "Fatigue", 
  "Nausea", "Dizziness", "Chest pain", "Back pain", "Joint pain"
];

const recentChecks = [
  {
    symptoms: ["Headache", "Dizziness"],
    result: "Tension headache",
    severity: "Low",
    date: "2024-01-15"
  },
  {
    symptoms: ["Cough", "Fever"],
    result: "Upper respiratory infection",
    severity: "Medium",
    date: "2024-01-10"
  }
];

const Symptomate = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const filteredSymptoms = commonSymptoms.filter(symptom =>
    symptom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const analyzeSymptoms = () => {
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      // Here you would typically navigate to results or show results
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-medium">
              <Activity className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">SehatBeat AI</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered symptom checker with interactive 3D body mapping for accurate health assessments
          </p>
          <Badge className="mt-4 bg-secondary text-secondary-foreground">
            95% Accuracy Rate
          </Badge>
          
          <Button
            onClick={() => setIsAIChatOpen(true)}
            className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-medium"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat with AI Health Assistant
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Symptom Selection */}
          <div className="space-y-6">
            {/* Selected Symptoms */}
            {selectedSymptoms.length > 0 && (
              <Card className="border-primary/20 bg-primary-soft/50">
                <CardHeader>
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Selected Symptoms ({selectedSymptoms.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedSymptoms.map((symptom, index) => (
                      <Badge
                        key={index}
                        className="bg-primary text-primary-foreground cursor-pointer hover:bg-primary/80"
                        onClick={() => toggleSymptom(symptom)}
                      >
                        {symptom} ×
                      </Badge>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong"
                    onClick={analyzeSymptoms}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing Symptoms...
                      </>
                    ) : (
                      <>
                        Analyze Symptoms
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Search Symptoms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Search Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search for symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {filteredSymptoms.map((symptom, index) => (
                    <Button
                      key={index}
                      variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                      size="sm"
                      className={`justify-start ${selectedSymptoms.includes(symptom) ? "bg-primary text-primary-foreground" : ""}`}
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>

                <Textarea
                  placeholder="Describe additional symptoms or details..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="mt-4"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Recent Checks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  Recent Symptom Checks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentChecks.map((check, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {check.symptoms.map((symptom, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm font-medium text-foreground">{check.result}</p>
                      <p className="text-xs text-muted-foreground">{check.date}</p>
                    </div>
                    <Badge
                      variant={check.severity === "Low" ? "secondary" : 
                               check.severity === "Medium" ? "default" : "destructive"}
                      className="ml-2"
                    >
                      {check.severity}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Health Information */}
          <div className="space-y-6">
            
            {/* 3D Interactive Body Map */}
            <InteractiveBodyMap3D />

            {/* Health Tips */}
            <Card className="border-secondary/20 bg-secondary-soft/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <TrendingUp className="w-5 h-5" />
                  Health Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Symptom Tracking</p>
                    <p className="text-xs text-muted-foreground">Keep a daily log of symptoms for better insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Stethoscope className="w-5 h-5 text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Professional Consultation</p>
                    <p className="text-xs text-muted-foreground">Always consult healthcare professionals for serious concerns</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Notice */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Emergency Notice</p>
                    <p className="text-xs text-muted-foreground">
                      If you're experiencing severe symptoms, call emergency services immediately. 
                      This tool is for informational purposes only.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
                 </div>
       </div>

       {/* AI Chatbot */}
       <AIChatbot
         isOpen={isAIChatOpen}
         onClose={() => setIsAIChatOpen(false)}
       />
     </div>
   );
 };

export default Symptomate;