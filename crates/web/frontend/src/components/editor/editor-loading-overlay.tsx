import { useEffect, useState } from "react";
import { Loader } from "../ui/sonner";
import styles from "./editor.module.css";

interface Props {
	loading: boolean;
	loadingMessage: string;
}

export const EditorLoadingOverlay = ({ loading, loadingMessage }: Props) => {
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (loading) {
			const timeout = setTimeout(() => setShow(true), 200);
			return () => clearTimeout(timeout);
		}
		setShow(false);
	}, [loading]);

	return (
		<div className={styles.loadingOverlay} data-visible={show && loading}>
			<span>{loadingMessage}</span>
			<Loader visible />
		</div>
	);
};
