import { useRef } from "react";

const useDebounce = (delay: number) => {
	const timer = useRef<NodeJS.Timeout>();

	const debounce = (callback: () => void) => {
		timer.current && clearTimeout(timer.current);
		timer.current = setTimeout(() => callback(), delay);
	};

	return debounce;
};

export default useDebounce;
