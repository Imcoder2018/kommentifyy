/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async headers() {
    // Parse allowed origins from env variable into an array for proper CORS handling
    const allowedOriginsList = (process.env.ALLOWED_CORS_ORIGINS || 'https://kommentify.com,chrome-extension://*')
      .split(',')
      .map(o => o.trim());

    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          // Return first matching origin or fallback to the first configured origin
          // Note: Next.js static headers cannot dynamically match per-request origin.
          // For proper multi-origin CORS, use middleware.ts instead.
          // Here we set a permissive wildcard for extension compatibility.
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ]
      }
    ]
  }
}

module.exports = nextConfig
