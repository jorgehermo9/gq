import { Eraser } from "lucide-react";
import ActionButton from "../action-button/action-button";

interface Props {
	editable: boolean;
	onClearContent: () => void;
}

export const EditorTooLarge = ({ editable, onClearContent }: Props) => {
	return (
		<div className="h-full rounded-lg flex flex-col gap-8 items-center justify-center bg-background border border-accent-background">
			<h3 className="text-md font-bold">The input is too large to be displayed here!</h3>
			<p className="text-sm -mt-4">
				You can still use the playground exporting the results or copying the output to your
				clipboard.
			</p>
			{editable && (
				<ActionButton
					className="py-2 px-4"
					onClick={onClearContent}
					description="Clear the input by deleting all the content"
				>
					<div className="flex gap-2">
						<Eraser className="w-4 h-4" />
						<span>Clear input</span>
					</div>
				</ActionButton>
			)}
		</div>
	);
};
