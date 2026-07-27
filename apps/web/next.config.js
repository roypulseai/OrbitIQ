/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@orbitiq/design-system", "@orbitiq/shared"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{ kebabCase member }}",
    },
  },
  poweredByHeader: false,
};

module.exports = nextConfig;
