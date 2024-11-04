import { cn } from "@/lib/utils";
import { Link, Unlink } from "lucide-react";
import ActionButton from "../action-button/action-button";

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
