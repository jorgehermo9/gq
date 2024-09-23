"use client";

import { Button } from "@/components/ui/button";

const NotFound = () => {
	return (
		<div className="flex flex-col items-center justify-center h-screen">
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
	);
};

export default NotFound;
