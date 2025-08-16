import { HeroSection } from "@/components/home/HeroSection";
import { FeatureCard } from "@/components/home/FeatureCard";
import { AnatomicalModel } from "@/components/3d/AnatomicalModel";
import { 
  ShoppingCart, 
  Bell, 
  TestTube, 
  Stethoscope, 
  Activity,
  FileText,
  Shield,
  Clock,
  Users
} from "lucide-react";

const features = [
  {
    title: "Medicine Ordering",
    description: "Browse, search, and order medicines with prescription management and delivery tracking.",
    icon: ShoppingCart,
    stats: "5000+ medicines"
  },
  {
    title: "Smart Reminders",
    description: "Never miss medications, lab tests, or appointments with intelligent notifications.",
    icon: Bell,
    stats: "99% accuracy"
  },
  {
    title: "Lab Tests",
    description: "Schedule tests, upload reports, and track results with seamless lab integration.",
    icon: TestTube,
    stats: "200+ labs"
  },
  {
    title: "Doctor Directory",
    description: "Find qualified doctors near you, view profiles, and book appointments instantly.",
    icon: Stethoscope,
    stats: "1000+ doctors"
  },
  {
    title: "SehatBeat AI Checker",
    description: "AI-powered symptom analysis with interactive 3D body mapping for accurate assessments.",
    icon: Activity,
    stats: "95% accuracy"
  },
  {
    title: "Clinical Documentation",
    description: "Comprehensive clinical notes management with structured templates and secure sharing.",
    icon: FileText,
    isHighlighted: true,
    stats: "New!"
  }
];

const trustFeatures = [
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Bank-level security for your medical data"
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock medical assistance"
  },
  {
    icon: Users,
    title: "10,000+ Users",
    description: "Trusted by patients nationwide"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Complete Healthcare Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your health in one comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={feature.title} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* 3D SehatBeat AI Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Interactive AI Symptom Checker
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Click on body parts to explore symptoms and get AI-powered health insights with SehatBeat AI
              </p>
            </div>

          <div className="max-w-4xl mx-auto">
            <AnatomicalModel />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Trusted Healthcare Platform
            </h2>
            <p className="text-lg text-muted-foreground">
              Built with security, reliability, and your privacy in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {trustFeatures.map((feature, index) => (
              <div key={feature.title} className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
