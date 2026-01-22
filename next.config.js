/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'pbs.twimg.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  webpack: (config) => {
    config.externals.push({
      "pino-pretty": "commonjs pino-pretty",
      "lokijs": "commonjs lokijs",
      "encoding": "commonjs encoding",
      "crypto": "commonjs crypto",
      "stream": "commonjs stream",
      "http": "commonjs http",
      "https": "commonjs https",
      "zlib": "commonjs zlib",
      "url": "commonjs url",
      "querystring": "commonjs querystring"
    });
    return config;
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development'
  },
}

module.exports = nextConfig
