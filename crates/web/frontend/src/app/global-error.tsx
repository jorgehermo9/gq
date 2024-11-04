"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Fira_Mono, Montserrat } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";
import { deleteDatabase } from "@/services/queries/query-service";

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

	const handleTryAgain = async () => {
		localStorage.clear();
		await deleteDatabase();
		window.location.reload();
	};

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
					className="w-[50rem] flex flex-col items-center px-12 py-12 border bg-background"
				>
					<h2 className="text-4xl font-bold">Something went wrong!</h2>
					<p className="text-sm font-light mt-4 text-center">
						Click the button below to refresh the playground state. This will delete all your saved
						queries and your settings aiming to solve the issue.
					</p>
					<Button className="mt-8" variant="outline" type="button" onClick={handleTryAgain}>
						Try again
					</Button>
				</div>
			</body>
		</html>
	);
}
