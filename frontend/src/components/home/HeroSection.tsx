import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowRight, Shield, Users, Zap } from "lucide-react";
import heroImage from "@/assets/medical.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Medical professionals in a modern healthcare facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge className="bg-gradient-accent text-accent-foreground px-4 py-2 text-sm animate-float" variant="secondary">
            <Activity className="w-4 h-4 mr-2" />
            Smart Medical Platform
          </Badge>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Your Health,
              <span className="block text-transparent bg-clip-text bg-gradient-hero">
                Simplified
              </span>
            </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            SehatBeat - Comprehensive healthcare management with smart reminders, symptom checking, 
            medicine ordering, and clinical documentation in one secure platform.
          </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary text-primary-foreground shadow-strong hover:shadow-medium transition-all duration-300 hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 hover:bg-muted/50 transition-all duration-300"
            >
              Watch Demo
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-6 justify-center items-center pt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-secondary" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-secondary" />
              <span>10,000+ Patients</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-secondary" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-primary rounded-full opacity-20 animate-float" />
      <div className="absolute bottom-1/3 right-10 w-16 h-16 bg-gradient-secondary rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-accent rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }} />
    </section>
  );
};