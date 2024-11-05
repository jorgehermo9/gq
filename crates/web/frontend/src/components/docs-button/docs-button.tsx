import { Book, BookOpen } from "lucide-react";
import ActionButton from "../action-button/action-button";
import { type MouseEvent, useCallback } from "react";

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
			className={className}
			variant="subtle"
			onClick={handleClick}
		>
			<a href="/docs" rel="noreferrer" target="_blank" className="flex items-center select-none">
				<BookOpen className="w-3.5 h-3.5 mr-2" />
				<span className="text-xxs font-normal mt-[2px]">Docs</span>
			</a>
		</ActionButton>
	);
};
