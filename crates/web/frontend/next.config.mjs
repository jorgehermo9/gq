const apiEndpoint = process.env.API_ENDOINT || "http://localhost:3001";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiEndpoint}/:path*`,
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
