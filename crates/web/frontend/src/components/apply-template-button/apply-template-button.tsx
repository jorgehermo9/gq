import ActionButton from "@/components/action-button/action-button";
import { cn, isMac } from "@/lib/utils";
import { useSettings } from "@/providers/settings-provider";
import { CirclePlay, Play } from "lucide-react";
import { useCallback, useEffect } from "react";

interface Props {
	onClick?: () => void;
	className?: string;
}

const ApplyTemplateButton = ({ className, onClick }: Props) => {
	if (!onClick) return null;

	const {
		settings: {
			autoApplySettings: { autoApply },
		},
	} = useSettings();

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if ((isMac ? e.metaKey : e.ctrlKey) && e.altKey && e.key === "Enter") {
				e.preventDefault();
				onClick();
			}
		},
		[onClick],
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return autoApply ? (
		<ActionButton
			disabled
			className={cn("h-full px-4 border-0", className)}
			description="Auto applying the template. You can disable this feature in the settings."
		>
			<CirclePlay className="w-4 h-4" />
		</ActionButton>
	) : (
		<ActionButton
			className={cn("h-full px-4 border-0", className)}
			onClick={onClick}
			description="Apply template"
		>
			<Play className="w-4 h-4 text-accent" />
		</ActionButton>
	);
};
export default ApplyTemplateButton;
