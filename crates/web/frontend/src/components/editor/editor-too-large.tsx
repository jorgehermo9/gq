import { empty } from "@/model/data";
import ActionButton from "../action-button/action-button";
import type FileType from "@/model/file-type";
import { Eraser } from "lucide-react";

interface Props {
	editable: boolean;
	type: FileType;
	onClearContent: (content: string) => void;
}

export const EditorTooLarge = ({ editable, type, onClearContent }: Props) => {
	return <div className="h-full rounded-lg flex flex-col gap-8 items-center justify-center bg-background border border-accent-background">
		<h3 className="text-md font-bold">
			The input is too large to be displayed here!
		</h3>
		<p className="text-sm -mt-4">
			You can still use the playground exporting the results or copying
			the output to your clipboard.
		</p>
		{editable && (
			<ActionButton
				className="py-2 px-4"
				onClick={() => onClearContent(empty(type).content)}
				description="Clear the input by deleting all the content"
			>
				<div className="flex gap-2">
					<Eraser className="w-4 h-4" />
					<span>Clear input</span>
				</div>
			</ActionButton>
		)}
	</div>
}
