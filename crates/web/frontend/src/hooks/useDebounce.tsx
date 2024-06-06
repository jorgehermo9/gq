import { useEffect, useRef } from "react";

const useDebounce = (
	callback: () => void,
	delay: number,
	dependencies: unknown[],
) => {
	const timer = useRef<NodeJS.Timeout>();

	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to avoid triggering the callback when the delay time changes
	useEffect(() => {
		timer.current && clearTimeout(timer.current);
		timer.current = setTimeout(() => callback(), delay);
	}, [...dependencies]);
};

export default useDebounce;
