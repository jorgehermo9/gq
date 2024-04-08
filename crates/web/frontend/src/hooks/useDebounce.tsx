import { useEffect, useRef } from "react";

const useDebounce = (
	callback: () => void,
	delay: number,
	dependencies: any[],
) => {
	const timer = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		timer.current && clearTimeout(timer.current);
		timer.current = setTimeout(() => callback(), delay);
	}, [callback, ...dependencies]);
};

export default useDebounce;
