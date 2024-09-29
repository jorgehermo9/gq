import { gqTheme } from "@/lib/theme";
import FileType from "@/model/file-type";
import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { getCodemirrorExtensionsByFileType } from "../editor/editor-utils";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

interface BodyTabProps {
	body: string | null;
	setBody: (body: string | null) => void;
}

const BodyTab = ({ body, setBody }: BodyTabProps) => {
	const extensions: Extension[] = useMemo(
		() => getCodemirrorExtensionsByFileType(FileType.JSON),
		[],
	);

	return (
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
	);
};

export default BodyTab;
