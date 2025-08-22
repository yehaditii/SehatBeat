"use client";

import { ReactNode, useEffect, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

// Get the Convex URL from environment variables
const getConvexUrl = () => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    console.error("NEXT_PUBLIC_CONVEX_URL is not set. Please check your environment variables.");
    // Fallback to localhost for development
    return "http://localhost:8000";
  }
  return url;
};

const convex = new ConvexReactClient(getConvexUrl());

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state while client is initializing
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Initializing SehatBeat...</p>
        </div>
      </div>
    );
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
