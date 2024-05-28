"use client";

import { useEffect } from "react";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="en">
			<body>
				{/* TODO: Improve this error page */}
				<h2>Something went wrong!</h2>
				<button
					type="button"
					onClick={() => {
						localStorage.clear();
						window.location.reload();
					}}
				>
					Try again
				</button>
			</body>
		</html>
	);
}
