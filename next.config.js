/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'pbs.twimg.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding", "crypto", "stream", "http", "https", "zlib", "url", "querystring");
    return config;
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development'
  },
}

module.exports = nextConfig
