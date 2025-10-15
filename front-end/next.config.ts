import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["cdn.chotot.com", "api.vietqr.io", "vietqr.net"], // Allow images from cdn.chotot.com
  },
};

export default nextConfig;
