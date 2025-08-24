import React from "react";
import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";

// Create a Convex client
const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL || "http://127.0.0.1:8000"
);

interface ConvexProviderProps {
  children: React.ReactNode;
}

export const ConvexProviderWrapper: React.FC<ConvexProviderProps> = ({ children }) => {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
};
