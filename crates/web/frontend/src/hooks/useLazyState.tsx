import { useCallback, useRef, useState } from "react";
import useDebounce from "./useDebounce";

function useLazyState<S>(
	initialState: S,
	delay: number,
	onChangeCallback?: (state: S) => void,
): [S, (newState: S) => void, S] {
	const [state, setState] = useState<S>(initialState);
	const stateRef = useRef<S>(initialState);
	const debounce = useDebounce();

	const setLazyState = useCallback(
		(newState: S) => {
			stateRef.current = newState;
			debounce(delay, () => {
				setState(newState);
				onChangeCallback?.(newState);
			});
		},
		[delay, debounce, onChangeCallback],
	);

	return [state, setLazyState, stateRef.current];
}

export default useLazyState;
