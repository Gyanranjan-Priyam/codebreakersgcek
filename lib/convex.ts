// lib/convex.ts
import { ConvexReactClient } from "convex/react";

const globalForConvex = global as unknown as { 
  convex: ConvexReactClient | undefined;
};

function getConvexUrl(): string {
  // Check multiple sources for the URL
  const url = 
    process.env.NEXT_PUBLIC_CONVEX_URL || 
    process.env.CONVEX_URL ||
    "https://academic-fly-239.convex.cloud"; // Fallback for build time

  return url;
}

export const convexClient = 
  globalForConvex.convex || new ConvexReactClient(getConvexUrl());

if (process.env.NODE_ENV !== "production") {
  globalForConvex.convex = convexClient;
}
