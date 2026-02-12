import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  images: {
    domains: [
      'localhost',
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
