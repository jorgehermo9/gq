import { Badge } from "../ui/badge";
import Image from "next/image";

const Footer = () => {
	return (
		<footer className="w-full flex justify-center">
			<Badge variant="outline" className="py-2 px-4">
				<span className="text-xs font-mono font-normal mt-[3px]">Powered by</span>
				<Image
					className="ml-2 inline "
					src="/web-assembly-icon.svg"
					alt="GQ Logo"
					width={14}
					height={14}
				/>
			</Badge>
		</footer>
	);
};

export default Footer;
