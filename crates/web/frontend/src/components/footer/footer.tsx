import { cn } from "@/lib/utils";
import ShortcutPopup from "../shortcut-popup/shortcut-popup";
import StarCount from "../star-count/star-count";
import ActionButton from "../action-button/action-button";
import { Link, Link2, Link2Off, Unlink } from "lucide-react";
import { WebAssemblyBadge } from "../web-assembly-badge/web-assembly-badge";
import { LinkEditor } from "../link-editor/link-editor";

interface FooterProps {
	linkEditors: boolean;
	handleToggleLinked: () => void;
	className?: string;
}

const Footer = ({ linkEditors, handleToggleLinked, className }: FooterProps) => {
	return (
		<footer className={cn("w-full flex justify-between border-t bg-background", className)}>
			<div className="flex">
				<ShortcutPopup className="h-full px-4" />
				<LinkEditor
					linkEditors={linkEditors}
					handleToggleLinked={handleToggleLinked}
					className="h-full px-4"
				/>
			</div>
			<div className="flex">
				<StarCount className="h-full px-4" />
				<WebAssemblyBadge className="h-full px-4" />
			</div>
		</footer>
	);
};

export default Footer;
