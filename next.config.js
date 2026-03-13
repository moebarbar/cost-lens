// next.config.js
// CostLens AI — Next.js Configuration

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Allow external image domains if needed
  images: {
    domains: [],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: "CostLens AI",
    NEXT_PUBLIC_APP_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  },

  // Optimize for Vercel deployment
  output: "standalone",

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
