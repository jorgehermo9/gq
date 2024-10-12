const host = process.env.API_HOST || "localhost";
const port = process.env.API_PORT || 3001;

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://${host}:${port}/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
      syncWebAssembly: true,
    };
    return config;
  },
};
export default nextConfig;
