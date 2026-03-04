import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nrs.harvard.edu",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
