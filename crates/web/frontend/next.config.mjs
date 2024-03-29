const nextConfig = {
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
