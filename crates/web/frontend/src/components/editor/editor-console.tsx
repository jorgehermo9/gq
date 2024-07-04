import { ChevronsDown } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "../ui/button";
import styles from "./editor.module.css";

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
				<PanelResizeHandle className="h-0.5 bg-accent-background relative">
					<Button
						variant="ghost"
						onClick={onClose}
						className="absolute px-0 py-0 z-30 h-min right-1/2 -top-6 transform -translate-y-1/2 translate-x-1/2 cursor-pointer text-[#404040]"
					>
						<ChevronsDown className="w-7 h-7" />
					</Button>
				</PanelResizeHandle>
				<Panel className="bg-background !overflow-y-auto" minSize={25} order={1}>
					<div className="py-">
						{lines.map((line, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								key={index}
								className="flex items-center gap-4 py-2.5 px-4 border-b border-muted-transparent text-xs font-mono"
							>
								<span className="text-warning font-semibold">WARN</span>
								<span className="">{line}</span>
							</div>
						))}
					</div>
				</Panel>
			</PanelGroup>
		)
	);
};

export default EditorConsole;
