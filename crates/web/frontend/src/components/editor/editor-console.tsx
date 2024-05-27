import { Dot } from "lucide-react";
import styles from "./editor.module.css";

interface Props {
	lines: string[];
	onClose: () => void;
}

export const EditorConsole = ({ lines, onClose }: Props) => {
	return (
		<div className={styles.editorConsole}>
			{lines.map((line, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<div key={index} className="flex items-center gap-2 py-2 px-1 border-b border-muted-transparent">
					< Dot className="w-8 h-8 text-warning" />
					<span className="text-sm">{line}</span>
				</div >
			))}
		</div >
	);
}
