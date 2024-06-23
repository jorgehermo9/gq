import type { Config } from "tailwindcss";

const config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				accent: {
					DEFAULT: "var(--accent)",
					background: "var(--accent-background)",
				},
				muted: {
					DEFAULT: "var(--muted)",
					transparent: "var(--muted-transparent)",
				},
				shadow: "var(--shadow)",
				error: "var(--error)",
				warning: "var(--warning)",
				success: "var(--success)",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),
		({ addVariant }: { addVariant: (name: string, variant: string) => void }) => {
			addVariant('aria-selected', '&[aria-selected="true"]');
		}
	],
	variants: {
		extend: {
			backgroundColor: ['aria-selected']
		}
	},
} satisfies Config;

export default config;
