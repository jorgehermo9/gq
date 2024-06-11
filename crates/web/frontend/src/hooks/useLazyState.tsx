import { useCallback, useRef, useState } from "react";
import useDebounce from "./useDebounce";

function useLazyState<S>(
	initialState: S,
	delay: number,
	onChangeCallback?: (state: S) => void,
): [S, (newState: S) => void, S] {
	const [state, setState] = useState<S>(initialState);
	const stateRef = useRef<S>(initialState);
	const debounce = useDebounce(delay);

	const setLazyState = useCallback(
		(newState: S) => {
			stateRef.current = newState;
			debounce(() => {
				setState(newState);
				onChangeCallback?.(newState);
			});
		},
		[debounce, onChangeCallback],
	);

	return [state, setLazyState, stateRef.current];
}

export default useLazyState;
