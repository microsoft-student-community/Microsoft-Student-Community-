/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'node:url';

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  // Prevent server-side bundling of browser-only / edge-incompatible packages
  serverExternalPackages: ['html5-qrcode'],
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  images: {
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
    optimizePackageImports: ['lucide-react', 'html-to-image'],
  },
};

export default nextConfig;
