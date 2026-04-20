/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ck-loan/shared'],
  reactStrictMode: true,
  output: 'standalone',
};

export default nextConfig;
