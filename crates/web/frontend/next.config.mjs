const production = process.env.NODE_ENV === "production";

const nextConfig = {
	async rewrites() {
		return production
			? []
			: [
					{
						source: "/api/:path*",
						destination: "http://localhost:3001/:path*",
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
