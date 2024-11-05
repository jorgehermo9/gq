import { cn } from "@/lib/utils";
import Image from "next/image";

export const WebAssemblyBadge = ({ className }: React.HTMLProps<HTMLDivElement>) => {
	return (
		<div className={cn("flex items-center", className)}>
			<span className="text-xxs font-normal">Powered by</span>
			<Image
				className="ml-2 inline"
				src="/web-assembly-icon.svg"
				alt="Web Assemboy logo"
				width={12}
				height={12}
			/>
		</div>
	);
};
