import { cn } from "@/lib/utils";
import Image from "next/image";
import ShortcutPopup from "../shortcut-popup/shortcut-popup";
import StarCount from "../star-count/star-count";

interface FooterProps {
	className?: string;
}

const Footer = ({ className }: FooterProps) => {
	return (
		<footer className={cn("w-full flex justify-between border-t bg-background", className)}>
			<div className="flex">
				<ShortcutPopup />
			</div>
			<div className="flex">
				<StarCount />
				<div className="flex items-center px-4">
					<span className="text-xxs font-mono font-normal">Powered by</span>
					<Image
						className="ml-2 inline mb-[2px]"
						src="/web-assembly-icon.svg"
						alt="GQ Logo"
						width={12}
						height={12}
					/>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
