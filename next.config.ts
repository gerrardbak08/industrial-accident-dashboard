import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Increase body size limit for Excel uploads (up to 50MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Next.js 16 uses Turbopack by default. node:sqlite is a Node.js built-in
  // (v22.5+) and is auto-externalized by Turbopack — no extra config needed.
  turbopack: {},
}

export default nextConfig
