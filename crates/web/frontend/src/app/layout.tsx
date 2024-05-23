import { cn } from "@/lib/utils";
import { SettingsProvider } from "@/providers/settings-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { WorkerProvider } from "@/providers/worker-provider";
import type { Metadata } from "next";
import { Fira_Mono, Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });
const firaCode = Fira_Mono({
	weight: ["400", "500"],
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={cn(
					"min-h-screen antialiased",
					montserrat.variable,
					firaCode.variable,
				)}
			>
				<Toaster
					offset="32px"
					duration={2000}
					visibleToasts={4}
					expand={true}
					toastOptions={{
						closeButton: false,
						unstyled: true,
						classNames: {
							toast:
								"w-full flex gap-4 bg-background items-center border border-accent-background p-4 rounded-md shadow-md",
							title: "text-foreground text-sm",
							actionButton:
								"min-w-max bg-foreground text-background text-xs px-2 py-1 rounded-md justify-self-end",
							closeButton:
								"text-foreground hover:text-accent bg-background transition-colors h-4 w-4",
							icon: "",
						},
					}}
				/>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					themes={["light", "dark"]}
					enableSystem
					disableTransitionOnChange
				>
					<SettingsProvider>
						<WorkerProvider>{children}</WorkerProvider>
					</SettingsProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
