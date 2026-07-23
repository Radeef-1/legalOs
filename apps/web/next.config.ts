import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  poweredByHeader: false, // Security: remove X-Powered-By header
};

export default nextConfig;
