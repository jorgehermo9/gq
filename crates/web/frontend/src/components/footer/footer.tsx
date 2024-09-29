import { cn } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "../ui/badge";

interface FooterProps {
	className?: string;
}

const Footer = ({ className }: FooterProps) => {
	return (
		<footer className={cn("w-full flex justify-center", className)}>
			<Badge variant="outline" className="py-1 px-3">
				<span className="text-xxs font-mono font-normal mt-[3px]">Powered by</span>
				<Image
					className="ml-2 inline "
					src="/web-assembly-icon.svg"
					alt="GQ Logo"
					width={12}
					height={12}
				/>
			</Badge>
		</footer>
	);
};

export default Footer;
