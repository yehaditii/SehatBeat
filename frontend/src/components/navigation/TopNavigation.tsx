import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  ShoppingCart, 
  Bell, 
  Activity,
  FileText,
  Menu,
  X
} from "lucide-react";
import { useCart } from "@/hooks/useConvex";
import { useAuth } from "@clerk/clerk-react";

// Import Clerk components
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/clerk-react";

// Check if Clerk is available
const isClerkAvailable = () => {
  try {
    return !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  } catch {
    return false;
  }
};

// Fallback components when Clerk is not available
const FallbackSignInButton = ({ children }: { children: React.ReactNode }) => (
  <Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong">
    {children}
  </Button>
);

const navigationItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Medicine", path: "/medicine", icon: ShoppingCart },
  { name: "Reminders", path: "/reminders", icon: Bell },
  { name: "SehatBeat AI", path: "/sehatbeat-ai", icon: Activity },
  { name: "Clinical Docs", path: "/clinical-docs", icon: FileText, highlighted: true },
];

export const TopNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isSignedIn } = useAuth();
  const { cartItems } = useCart();

  const isActive = (path: string) => location.pathname === path;
  
  const getCartItemCount = () => {
    return cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SehatBeat</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(item.path) 
                    ? item.highlighted 
                      ? "bg-gradient-accent text-accent-foreground shadow-medium" 
                      : "bg-primary-soft text-primary"
                    : item.highlighted
                      ? "hover:bg-accent-soft text-accent"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }
                  ${item.highlighted ? "ring-2 ring-accent/20" : ""}
                `}
              >
                <item.icon className="w-4 h-4 inline mr-2" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Cart Icon */}
            {isSignedIn && (
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {getCartItemCount() > 99 ? '99+' : getCartItemCount()}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            
            {isClerkAvailable() ? (
              <>
                <SignedIn>
                  <UserButton
                    appearance={{ variables: { colorPrimary: "#7c3aed" } }}
                    afterSignOutUrl="/"
                  />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button 
                      size="sm" 
                      className="bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                </SignedOut>
              </>
            ) : (
              <FallbackSignInButton>
                Sign In
              </FallbackSignInButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 animate-slide-up">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(item.path) 
                    ? item.highlighted 
                      ? "bg-gradient-accent text-accent-foreground" 
                      : "bg-primary-soft text-primary"
                    : item.highlighted
                      ? "hover:bg-accent-soft text-accent"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }
                  ${item.highlighted ? "ring-2 ring-accent/20" : ""}
                `}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
            {/* Mobile Cart Link */}
            {isSignedIn && (
              <Link
                to="/cart"
                className="flex items-center px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Cart ({getCartItemCount()})
              </Link>
            )}
            
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {isClerkAvailable() ? (
                <>
                  <SignedIn>
                    <UserButton
                      appearance={{ variables: { colorPrimary: "#7c3aed" } }}
                      afterSignOutUrl="/"
                    />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button size="sm" className="bg-gradient-primary text-primary-foreground">
                        Sign In
                      </Button>
                    </SignInButton>
                  </SignedOut>
                </>
              ) : (
                <FallbackSignInButton>
                  Sign In
                </FallbackSignInButton>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
