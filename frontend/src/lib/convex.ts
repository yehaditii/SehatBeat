import { ConvexReactClient } from "convex/react";

// Create a Convex client
export const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL || "http://localhost:8000"
);
