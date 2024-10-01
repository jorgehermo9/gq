import { gqTheme } from "@/lib/theme";
import { Data } from "@/model/data";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatCode, getCodemirrorExtensionsByFileType } from "../editor/editor-utils";

interface BodyTabProps {
	body: string;
	setBody: (body: string) => void;
}

const BodyTab = ({ body, setBody }: BodyTabProps) => {
	const [focused, setFocused] = useState(false);
	const {
		settings: {
			formattingSettings: { dataTabSize },
		},
	} = useSettings();
	const { formatWorker } = useWorker();

	const extensions: Extension[] = useMemo(
		() => getCodemirrorExtensionsByFileType(FileType.JSON),
		[],
	);

	const handleKeyDown = useCallback(
		async (event: KeyboardEvent) => {
			if (!focused || !formatWorker) return;
			if (event.ctrlKey && (event.key === "s" || event.key === "S")) {
				event.preventDefault();
				const formattedCode = await formatCode(
					new Data(body, FileType.JSON),
					dataTabSize,
					formatWorker,
					false,
				);
				setBody(formattedCode.content);
			}
		},
		[focused, body, dataTabSize, formatWorker, setBody],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<CodeMirror
			onFocus={() => setFocused(true)}
			onBlur={() => setFocused(false)}
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
