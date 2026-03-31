/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@farcaster/mini-app-solana': false,
    }
    return config
  },
};

export default nextConfig;
