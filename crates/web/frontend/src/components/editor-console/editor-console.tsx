import { ChevronDown } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "../ui/button";
import styles from "./editor-console.module.css";

interface Props {
	lines: string[];
	visible: boolean;
	onClose: () => void;
}

const EditorConsole = ({ lines, visible, onClose }: Props) => {
	return (
		visible && (
			<PanelGroup className={styles.consoleOverlay} data-visible={visible} direction="vertical">
				<Panel className="bg-[#00000021]" minSize={4} order={0} onClick={onClose} />
				<PanelResizeHandle className="!h-[1px] bg-accent-background relative">
					<Button
						variant="ghost"
						onClick={onClose}
						className="absolute px-1 py-1 z-30 h-min right-1/2 -top-7 transform translate-x-1/2"
					>
						<ChevronDown className="w-4 h-4" />
					</Button>
				</PanelResizeHandle>
				<Panel className="bg-background !overflow-y-auto" minSize={25} order={1}>
					{lines.map((line, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: This is a controlled list
							key={index}
							className="flex items-center gap-4 py-2.5 px-4 border-b border-muted-transparent text-xs font-mono"
						>
							<span className="text-warning font-semibold">WARN</span>
							<span className="">{line}</span>
						</div>
					))}
				</Panel>
			</PanelGroup>
		)
	);
};

export default EditorConsole;
