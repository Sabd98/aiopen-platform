import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep configuration minimal. Add a rewrite so that requests to /api
  // are forwarded to the backend service by hostname when running inside Docker.
  async rewrites() {
    const publicApi = process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'undefined'
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$|\/$/, '')
      : undefined;

    return [
      {
        source: '/api/:path*',
        destination: publicApi ? `${publicApi}/:path*` : 'http://backend:3001/:path*',
      },
    ];
  },
};

export default nextConfig;
