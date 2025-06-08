/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["recharts", "react-resize-detector"],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  future: { webpack5: true },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts"],
      ".mjs": [".mjs", ".mts"],
    };
    return config;
  },
};

export default nextConfig;
