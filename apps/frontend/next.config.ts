import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ck-loan/shared'],
  reactStrictMode: true,
};

export default nextConfig;
