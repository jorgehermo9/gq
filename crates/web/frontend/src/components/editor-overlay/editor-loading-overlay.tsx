import type { LoadingState } from "@/model/loading-state";
import { useEffect, useState } from "react";
import { Loader } from "../ui/sonner";
import styles from "./editor-overlay.module.css";

interface Props {
	loadingState: LoadingState;
}

const EditorLoadingOverlay = ({ loadingState }: Props) => {
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (loadingState.isLoading) {
			const timeout = setTimeout(() => setShow(true), 10);
			return () => clearTimeout(timeout);
		}
		setShow(false);
	}, [loadingState]);

	return (
		<div className={styles.loadingOverlay} data-visible={show && loadingState.isLoading}>
			<span>{loadingState.message}</span>
			<Loader />
		</div>
	);
};

export default EditorLoadingOverlay;
