/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'pbs.twimg.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  webpack: (config, { webpack }) => {
    // Use aliases for polyfills instead of externals
    config.resolve.alias = {
      ...config.resolve.alias,
      crypto: require.resolve('crypto-browserify'),
      'node:crypto': require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      'node:stream': require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      'node:http': require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      'node:https': require.resolve('https-browserify'),
      zlib: require.resolve('browserify-zlib'),
      'node:zlib': require.resolve('browserify-zlib'),
      url: require.resolve('url'),
      'node:url': require.resolve('url'),
      querystring: require.resolve('querystring-es3'),
      'node:querystring': require.resolve('querystring-es3'),
      vm: require.resolve('vm-browserify'),
      'node:vm': require.resolve('vm-browserify'),
    };

    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    );

    // pino-pretty etc might still need to be external if they are server-only tools.
    config.externals.push("pino-pretty", "lokijs", "encoding");

    return config;
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development'
  },
}

module.exports = nextConfig
