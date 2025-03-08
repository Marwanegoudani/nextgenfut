import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // We'll handle linting separately
  },
};

export default nextConfig;
