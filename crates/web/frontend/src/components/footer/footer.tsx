import { cn } from "@/lib/utils";
import { DocsButton } from "../docs-button/docs-button";
import { LinkEditor } from "../link-editor/link-editor";
import ShortcutPopup from "../shortcut-popup/shortcut-popup";
import StarCount from "../star-count/star-count";
import { WebAssemblyBadge } from "../web-assembly-badge/web-assembly-badge";

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
				<DocsButton className="h-full px-4" />
				<StarCount className="h-full px-4" />
				<WebAssemblyBadge className="h-full px-4" />
			</div>
		</footer>
	);
};

export default Footer;
