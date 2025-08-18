import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  ShoppingCart, 
  Bell, 
  TestTube, 
  Activity,
  FileText
} from "lucide-react";

const bottomNavItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Medicine", path: "/medicine", icon: ShoppingCart },
  { name: "Reminders", path: "/reminders", icon: Bell },
  { name: "SehatBeat AI", path: "/sehatbeat-ai", icon: Activity },
  { name: "Clinical", path: "/clinical-docs", icon: FileText, highlighted: true },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-strong">
      <div className="flex items-center justify-around px-2 py-2">
        {bottomNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`
              flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-0 flex-1
              ${isActive(item.path) 
                ? item.highlighted 
                  ? "bg-gradient-accent text-accent-foreground shadow-medium" 
                  : "bg-primary-soft text-primary"
                : item.highlighted
                  ? "text-accent hover:bg-accent-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }
              ${item.highlighted ? "ring-1 ring-accent/30" : ""}
            `}
          >
            <item.icon className={`w-5 h-5 mb-1 ${item.highlighted && isActive(item.path) ? "animate-pulse-soft" : ""}`} />
            <span className="truncate">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};