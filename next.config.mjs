/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'node:url';

const nextConfig = {
  cleanDistDir: true,
  poweredByHeader: false,
  compress: true,
  // Prevent server-side bundling of browser-only / edge-incompatible packages
  serverExternalPackages: ['html5-qrcode'],
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lkbwunzswqbnoygxtilm.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'html-to-image',
      'framer-motion',
      'papaparse',
      '@supabase/supabase-js',
      'qrcode.react',
    ],
  },
  webpack: (config) => {
    config.infrastructureLogging = {
      ...config.infrastructureLogging,
      level: 'error',
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
