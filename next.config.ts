import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Improve webpack configuration for better chunk handling
  webpack: (config, { dev, isServer }) => {
    // Fix for chunk loading issues
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };
    }
    return config;
  },
  // Experimental features for better stability
  experimental: {
    optimizeCss: false,
  },
  // Disable ESLint during builds for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Handle transpilation properly
  transpilePackages: ['lucide-react'],
  // Skip static generation for problematic pages
  output: 'standalone',
  // Allow preview domain for development
  allowedDevOrigins: ['preview-chat-da334efe-a6fe-4965-b94f-cc09b8c39d12.space.z.ai'],
  // Handle CORS headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
};

export default nextConfig;
