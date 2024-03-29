import CopyPlugin from "copy-webpack-plugin";

const nextConfig = {
    webpack: (config) => {
        config.experiments = {
            layers: true,
            asyncWebAssembly: true
        };
        return config;
    }
};
export default nextConfig;