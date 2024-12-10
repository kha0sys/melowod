/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, 'undici'];
    return config;
  },
};

module.exports = nextConfig;
