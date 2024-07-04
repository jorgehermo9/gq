import ActionButton from "@/components/action-button/action-button";
import { CirclePlay, Play } from "lucide-react";
import { useCallback, useEffect } from "react";

interface Props {
	autoApply: boolean;
	onClick: () => void;
}

const ApplyButton = ({ autoApply, onClick }: Props) => {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.altKey && e.key === "Enter") {
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
			className="rounded-full p-4"
			description="Auto applying the query to the provided JSON. You can disable this feature in the settings."
		>
			<CirclePlay className="w-6 h-6" />
		</ActionButton>
	) : (
		<ActionButton
			className="rounded-full p-4"
			onClick={onClick}
			description="Apply the query to the provided JSON"
		>
			<Play className="w-6 h-6" />
		</ActionButton>
	);
};
export default ApplyButton;
