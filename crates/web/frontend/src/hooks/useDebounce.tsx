import { useEffect, useRef } from "react";

const useDebounce = (callback: () => void, delay: number, dependencies: []) => {
	const timer = useRef<NodeJS.Timeout | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to avoid that the callback is called when the delay time changes
	useEffect(() => {
		timer.current && clearTimeout(timer.current);
		timer.current = setTimeout(() => callback(), delay);
	}, [...dependencies]);
};

export default useDebounce;
