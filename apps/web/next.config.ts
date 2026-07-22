import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
