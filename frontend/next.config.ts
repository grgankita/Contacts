import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "http://localhost:4000/contact-management-11499/us-central1/api/:contacts",
      },
    ];
  },
};

export default nextConfig;
