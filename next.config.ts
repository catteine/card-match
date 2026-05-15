import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/card-match",
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: "/card-match",
  },
};

export default nextConfig;
