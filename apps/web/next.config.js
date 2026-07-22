/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@orbitiq/design-system", "@orbitiq/shared"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

module.exports = nextConfig;
