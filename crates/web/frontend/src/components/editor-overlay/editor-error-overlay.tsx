import { X } from "lucide-react";
import { memo } from "react";
import { Button } from "../ui/button";
import styles from "./editor-overlay.module.css";

interface Props {
	visibleBackdrop: boolean;
	visibleMessage: boolean;
	errorMessage: string | undefined;
	onClose: () => void;
}

const EditorErrorOverlay = ({
	visibleBackdrop,
	visibleMessage,
	errorMessage,
	onClose,
}: Props) => {
	return (
		<>
			<div data-visible={visibleBackdrop} className={styles.errorOverlay} />
			<div data-visible={visibleMessage} className={styles.errorContent}>
				<span>{errorMessage}</span>
				<Button onClick={onClose} variant="ghost">
					<X className="w-4 h-4" />
				</Button>
			</div>
		</>
	);
};

export default memo(EditorErrorOverlay);
