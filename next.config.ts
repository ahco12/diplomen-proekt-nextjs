import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['assets-eu-01.kc-usercontent.com'], // Add your domain here
  },
};

export default nextConfig;
