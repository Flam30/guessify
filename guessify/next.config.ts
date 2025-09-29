import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,
  },
};

export default nextConfig;
