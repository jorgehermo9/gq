import { gqTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { type Data, empty } from "@/model/data";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import CodeMirror from "@uiw/react-codemirror";
import { Eraser } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ActionButton from "../action-button/action-button";
import EditorMenu from "./editor-menu";
import EditorTitle from "./editor-title";
import {
	copyToClipboard,
	exportFile,
	formatCode,
	getCodemirrorExtensionsByFileType,
} from "./editor-utils";
import styles from "./editor.module.css";

interface Props {
	data: Data;
	title: string;
	defaultFileName: string;
	fileTypes: FileType[];
	onChangeContent: (content: string) => void;
	onChangeFileType?: (fileType: FileType) => void;
	className?: string;
	errorMessage?: string;
	editable?: boolean;
}

const Editor = ({
	data,
	title,
	defaultFileName,
	fileTypes,
	onChangeContent,
	onChangeFileType,
	className,
	errorMessage,
	editable = true,
}: Props) => {
	const [isFocused, setIsFocused] = useState(false);
	const [editorErrorMessage, setEditorErrorMessage] = useState<
		string | undefined
	>();
	const {
		settings: {
			formattingSettings: { formatOnImport, dataTabSize, queryTabSize },
		},
	} = useSettings();
	const { formatWorker, lspWorker } = useWorker();
	const indentSize = data.type === FileType.GQ ? queryTabSize : dataTabSize;
	const available = data.content.length < 100000000;

	const handleFormatCode = useCallback(
		async (data: Data) => {
			if (!formatWorker) return;
			try {
				const result = await formatCode(data, indentSize, formatWorker);
				setEditorErrorMessage(undefined);
				onChangeContent(result);
			} catch (e) {
				setEditorErrorMessage(e.message);
			}
		},
		[indentSize, onChangeContent, formatWorker],
	);

	const handleImportFile = useCallback(
		async (data: Data) => {
			onChangeContent(data.content);
			formatOnImport && handleFormatCode(data);
		},
		[formatOnImport, handleFormatCode, onChangeContent],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!isFocused) return;
			if (event.ctrlKey && event.key === "s") {
				event.preventDefault();
				handleFormatCode(data);
			}
		},
		[isFocused, handleFormatCode, data],
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<div className="flex gap-4 items-center">
				<EditorTitle
					title={title}
					fileTypes={fileTypes}
					currentFileType={data.type}
					setFileType={onChangeFileType}
				/>
				<EditorMenu
					fileType={data.type}
					defaultFilename={defaultFileName}
					editable={editable}
					onCopyToClipboard={() => copyToClipboard(data)}
					onFormatCode={() => handleFormatCode(data)}
					onImportFile={(data) => handleImportFile(data)}
					onExportFile={(filename) => exportFile(data, filename)}
				/>
			</div>

			<div
				data-focus={isFocused}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				className={`${styles.editor} relative h-full rounded-lg overflow-hidden`}
			>
				<div
					data-visible={!editable && (!!errorMessage || !!editorErrorMessage)}
					className={styles["error-overlay"]}
				/>
				<span
					data-visible={!!errorMessage || !!editorErrorMessage}
					className={styles["error-content"]}
				>
					{errorMessage || editorErrorMessage}
				</span>
				{available ? (
					<CodeMirror
						className="w-full h-full rounded-lg text-[0.8rem]"
						value={data.content}
						onChange={onChangeContent}
						height="100%"
						theme={gqTheme}
						extensions={getCodemirrorExtensionsByFileType(data.type, lspWorker)}
						editable={editable}
						basicSetup={{
							autocompletion: true,
							lineNumbers: true,
							lintKeymap: true,
						}}
					/>
				) : (
					<div className="h-full rounded-lg flex flex-col gap-8 items-center justify-center bg-background border border-accent-background">
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
								onClick={() => onChangeContent(empty(data.type).content)}
								description="Clear the input by deleting all the content"
							>
								<div className="flex gap-2">
									<Eraser className="w-4 h-4" />
									<span>Clear input</span>
								</div>
							</ActionButton>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Editor;
