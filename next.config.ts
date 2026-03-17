import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Increase body size limit for Excel uploads (up to 50MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

export default nextConfig
