/** @type {import('tailwindcss').Config} */
import starlightPlugin from '@astrojs/starlight-tailwind';

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	plugins: [starlightPlugin()],
	theme: {
		extend: {
			colors: {
				accent: "var(--sl-color-accent)",
				muted: "var(--sl-color-accent-low)"
			},
		},
	},
}
