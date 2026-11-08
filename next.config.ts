import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Images are compressed client-side before upload, but this is a safety
      // net for any file that slips through (e.g. unsupported formats) so it
      // fails with a clear "too large" error instead of a generic 413.
      bodySizeLimit: '8mb',
    },
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
};

export default nextConfig;
