import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // This tells Next.js to build static files
  images: {
    unoptimized: true, // Electron cannot use Next.js server-side image optimization
  }
};

export default nextConfig;