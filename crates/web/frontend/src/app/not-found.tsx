"use client";

import { Button } from "@/components/ui/button";

const NotFound = () => {
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<div
				style={{ boxShadow: "0 60px 60px -90px var(--shadow-accent)" }}
				className="flex flex-col items-center px-48 py-24 border border-accent-background rounded-lg bg-background"
			>
				<h2 className="text-4xl font-bold">Not Found</h2>
				<p className="text-sm font-light mt-4">The page you are looking for does not exist</p>
				<Button
					className="mt-8"
					variant="outline"
					type="button"
					onClick={() => {
						window.location.href = "/";
					}}
				>
					Go back to home
				</Button>
			</div>
		</div>
	);
};

export default NotFound;
