import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isHighlighted?: boolean;
  comingSoon?: boolean;
  href?: string;
  stats?: string;
}

export const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  isHighlighted = false, 
  comingSoon = false,
  href,
  stats
}: FeatureCardProps) => {
  const navigate = useNavigate();
  
  const cardClass = isHighlighted
    ? "border-accent bg-gradient-to-br from-accent-soft to-background shadow-strong hover:shadow-accent/20 ring-2 ring-accent/20"
    : "hover:shadow-medium transition-all duration-300 hover:-translate-y-1";

  // Check if this is Lab Tests or Doctor Directory to show Coming Soon
  const isComingSoon = comingSoon || title === "Lab Tests" || title === "Doctor Directory";

  // Handle navigation based on feature type
  const handleNavigation = () => {
    if (isComingSoon) return;
    
    switch (title) {
      case "Medicine Ordering":
        navigate("/medicine");
        break;
      case "Smart Reminders":
        navigate("/reminders");
        break;
      case "SehatBeat AI Checker":
        navigate("/sehatbeat-ai");
        break;
      case "Clinical Documentation":
        navigate("/clinical-docs");
        break;
      default:
        if (href) {
          window.location.href = href;
        }
    }
  };

  return (
    <Card className={`relative overflow-hidden ${cardClass}`}>
      {isHighlighted && (
        <div className="absolute top-0 right-0">
          <Badge className="bg-gradient-accent text-accent-foreground rounded-l-none rounded-br-none animate-pulse-soft">
            New
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg ${isHighlighted ? "bg-gradient-accent" : "bg-gradient-primary"}`}>
            <Icon className={`w-6 h-6 ${isHighlighted ? "text-accent-foreground" : "text-primary-foreground"}`} />
          </div>
          {stats && (
            <Badge variant="secondary" className="text-xs">
              {stats}
            </Badge>
          )}
        </div>
        <CardTitle className={`text-lg ${isHighlighted ? "text-accent" : "text-foreground"}`}>
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        
        {isComingSoon ? (
          <Button 
            variant="outline" 
            className="w-full border-2 border-muted-foreground text-muted-foreground hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-300"
          >
            Coming Soon
          </Button>
        ) : (
          <Button 
            className={`w-full ${
              isHighlighted 
                ? "bg-gradient-accent text-accent-foreground hover:shadow-medium" 
                : "bg-gradient-primary text-primary-foreground hover:shadow-medium"
            }`}
            onClick={handleNavigation}
          >
            {isHighlighted ? "Explore Clinical Docs" : "Get Started"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};