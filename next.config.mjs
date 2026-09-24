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
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
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
  async redirects() {
    return [
      { source: '/events/zero-jam-umrz', destination: '/events/zero-jam', permanent: true },
      { source: '/events/msc-tech-fest-9e30', destination: '/events/msc-tech-fest', permanent: true },
      {
        source: '/events/quantum-computing-workshop-2e7t',
        destination: '/events/quantum-computing-workshop',
        permanent: true,
      },
      { source: '/events/hack-x-msc-7a5v', destination: '/events/hack-x-msc', permanent: true },
      { source: '/events/msc-tech-hunt-qbyo', destination: '/events/msc-tech-hunt', permanent: true },
      { source: '/events/hack-2-0-msc-rd0h', destination: '/events/hack-2-0-msc', permanent: true },
    ];
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
