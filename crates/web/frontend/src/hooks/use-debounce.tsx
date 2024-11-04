import { useCallback, useRef } from "react";

const useDebounce = () => {
	const timer = useRef<NodeJS.Timeout>();

	const debounce = useCallback((delay: number, callback: () => void) => {
		timer.current && clearTimeout(timer.current);
		timer.current = setTimeout(() => callback(), delay);
	}, []);

	return debounce;
};

export default useDebounce;
