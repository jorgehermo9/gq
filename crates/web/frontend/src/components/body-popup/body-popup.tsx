import { X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { gqTheme } from "@/lib/theme";
import { useMemo, useState } from "react";
import { getCodemirrorExtensionsByFileType } from "../editor/editor-utils";
import FileType from "@/model/file-type";
import { DropdownMenuItem } from "../ui/dropdown-menu";

interface BodyPopupProps {
	body: string | null;
	setBody: (body: string | null) => void;
}

const BodyPopup = ({ body, setBody }: BodyPopupProps) => {
	const [open, setOpen] = useState(false);

	const extensions: Extension[] = useMemo(
		() => getCodemirrorExtensionsByFileType(FileType.JSON),
		[],
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<span className="text-sm cursor-pointer">Add body</span>
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="block w-[34rem] max-w-[80vw] h-[40vh] overflow-y-auto gap-0">
				<X
					className="absolute top-4 right-4 h-4 w-4 cursor-pointer"
					onClick={() => setOpen(false)}
				/>
				<DialogHeader className="h-min mb-8">
					<DialogTitle>Request Body</DialogTitle>
					<DialogDescription>Customize the body for the import request</DialogDescription>
				</DialogHeader>
				<CodeMirror
					className="w-full h-full text-xs overflow-hidden"
					value={body || ""}
					onChange={setBody}
					height="100%"
					theme={gqTheme}
					extensions={extensions}
					basicSetup={{
						autocompletion: true,
						lineNumbers: true,
						lintKeymap: true,
					}}
				/>
			</DialogContent>
		</Dialog>
	);
};

export default BodyPopup;
