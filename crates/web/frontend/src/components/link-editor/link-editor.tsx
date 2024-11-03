import { cn } from "@/lib/utils";
import ActionButton from "../action-button/action-button";
import { Link, Unlink } from "lucide-react";

interface Props {
	linkEditors: boolean;
	handleToggleLinked: () => void;
	className?: string;
}

export const LinkEditor = ({ linkEditors, handleToggleLinked, className }: Props) => {
	return (
		<ActionButton
			variant="subtle"
			side="top"
			className={cn("h-full px-4", className)}
			description={`${linkEditors ? "Unlik" : "Link"} input and output editor file types`}
			onClick={handleToggleLinked}
		>
			{linkEditors ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
		</ActionButton>
	);
};
