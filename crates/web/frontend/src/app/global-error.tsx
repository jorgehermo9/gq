"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Fira_Mono, Montserrat } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });
const firaCode = Fira_Mono({
	weight: ["400", "500"],
	subsets: ["latin"],
	variable: "--font-mono",
});

export default function GlobalError({
	error,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => console.error(error), [error]);

	return (
		<html lang="en" className="dark">
			<body
				className={cn(
					"flex flex-col items-center justify-center",
					montserrat.variable,
					firaCode.variable,
				)}
			>
				<div
					style={{ boxShadow: "0 60px 60px -90px var(--shadow-accent)" }}
					className="flex flex-col items-center px-48 py-24 border rounded-lg bg-background"
				>
					<h2 className="text-4xl font-bold">Something went wrong!</h2>
					<p className="text-sm font-light mt-4">
						Click the button below to refresh the playground state
					</p>
					<Button
						className="mt-8"
						variant="outline"
						type="button"
						onClick={() => {
							localStorage.clear();
							window.location.reload();
						}}
					>
						Try again
					</Button>
				</div>
			</body>
		</html>
	);
}
