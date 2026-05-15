import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/card-match",
  images: { unoptimized: true },
};

export default nextConfig;
