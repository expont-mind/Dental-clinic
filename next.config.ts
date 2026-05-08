import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents enables Next.js 16 Partial Prerendering, which requires
  // every dynamic data fetch to live inside a <Suspense> boundary. Worth
  // enabling later for performance; off for MVP velocity.
  cacheComponents: false,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;
