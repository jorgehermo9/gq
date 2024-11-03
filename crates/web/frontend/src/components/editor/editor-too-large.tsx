import { Eraser } from "lucide-react";
import ActionButton from "../action-button/action-button";

interface Props {
	editable: boolean;
	onClearContent: () => void;
}

export const EditorTooLarge = ({ editable, onClearContent }: Props) => {
	return (
		<div className="h-full flex flex-col gap-8 items-center justify-center bg-background">
			<h3>The input is too large to be displayed here!</h3>
			<p className="-mt-4">
				You can still use the playground exporting the results or copying the output to your
				clipboard
			</p>
			{editable && (
				<ActionButton
					className="py-2 px-4"
					onClick={onClearContent}
					description="Clear the input by deleting all the content"
				>
					<div className="flex items-center gap-2">
						<Eraser className="w-3.5 h-3.5" />
						<span>Clear input</span>
					</div>
				</ActionButton>
			)}
		</div>
	);
};
