import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'localhost',
      'api.placeholder',
      // Add your Supabase storage domain here
      // e.g., 'your-project.supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/tech', destination: '/technologien', permanent: true },
      { source: '/tech/', destination: '/technologien', permanent: true },
      { source: '/about', destination: '/ueber-uns', permanent: true },
      { source: '/about/', destination: '/ueber-uns', permanent: true },
      { source: '/contact', destination: '/kontakt', permanent: true },
      { source: '/contact/', destination: '/kontakt', permanent: true },
      { source: '/projects', destination: '/projekte', permanent: true },
      { source: '/projects/', destination: '/projekte', permanent: true },
      { source: '/referenzen', destination: '/projekte', permanent: true },
      { source: '/referenzen/', destination: '/projekte', permanent: true },
    ];
  },
};

export default nextConfig;
