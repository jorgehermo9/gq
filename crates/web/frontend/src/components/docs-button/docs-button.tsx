import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { type MouseEvent, useCallback } from "react";
import ActionButton from "../action-button/action-button";

interface Props {
	className?: string;
}

export const DocsButton = ({ className }: Props) => {
	const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		window.open("/docs", "_blank");
		e.preventDefault();
	}, []);

	return (
		<ActionButton
			description="Check the GQ documentation"
			className="h-full"
			variant="subtle"
			onClick={handleClick}
		>
			<a
				href="/docs"
				rel="noreferrer"
				target="_blank"
				className={cn("flex items-center select-none", className)}
			>
				<BookOpen className="w-3.5 h-3.5 mr-2" />
				<span className="text-xxs font-normal mt-[1px]">Docs</span>
			</a>
		</ActionButton>
	);
};
