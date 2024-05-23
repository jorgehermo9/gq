import { gqTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import CodeMirror from "@uiw/react-codemirror";
import { Eraser } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ActionButton from "../action-button/action-button";
import EditorMenu from "./editor-menu";
import {
	convertCode,
	copyToClipboard,
	exportFile,
	formatCode,
	getExtensionsByFileType,
} from "./editor-utils";
import styles from "./editor.module.css";
import EditorTitle from "./editor-title";

interface Props {
	value: string;
	title: string;
	defaultFileName: string;
	fileTypes: FileType[];
	onChange: (value: string) => void;
	className?: string;
	errorMessage?: string;
	editable?: boolean;
}

const Editor = ({
	value,
	title,
	defaultFileName,
	fileTypes,
	onChange,
	className,
	errorMessage,
	editable = true,
}: Props) => {
	const [isFocused, setIsFocused] = useState(false);
	const [currentFileType, setCurrentFileType] = useState<FileType>(fileTypes[0]);
	const [editorErrorMessage, setEditorErrorMessage] = useState<
		string | undefined
	>();
	const {
		settings: {
			formattingSettings: { formatOnImport, jsonTabSize, queryTabSize },
		},
	} = useSettings();
	const { formatWorker, lspWorker, converterWorker } = useWorker();
	const indentSize = currentFileType === FileType.JSON ? jsonTabSize : queryTabSize;
	const available = value.length < 100000000;

	const handleFormatCode = useCallback(
		async (value: string) => {
			if (!formatWorker) return;
			try {
				const result = await formatCode(
					value,
					currentFileType,
					indentSize,
					formatWorker,
				);
				setEditorErrorMessage(undefined);
				onChange(result);
			} catch (e) {
				setEditorErrorMessage(e.message);
			}
		},
		[currentFileType, indentSize, onChange, formatWorker],
	);

	const handleImportFile = useCallback(
		async (content: string) => {
			onChange(content);
			formatOnImport && handleFormatCode(content);
		},
		[formatOnImport, handleFormatCode, onChange],
	);

	const handleChangeFileType = useCallback(async (fileType: FileType) => {
		if (!converterWorker) return;
		setCurrentFileType(fileType);
		const convertedValue = await convertCode(value, currentFileType, fileType, converterWorker);
		onChange(convertedValue);
	}, [onChange, converterWorker, value, currentFileType]);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!isFocused) return;
			if (event.ctrlKey && event.key === "s") {
				event.preventDefault();
				handleFormatCode(value);
			}
		},
		[isFocused, handleFormatCode, value],
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<div className="flex gap-4 items-center">
				<EditorTitle title={title} fileTypes={fileTypes} currentFileType={currentFileType} setFileType={handleChangeFileType} />
				<EditorMenu
					fileType={currentFileType}
					defaultFileName={defaultFileName}
					editable={editable}
					onCopyToClipboard={() => copyToClipboard(value)}
					onFormatCode={() => handleFormatCode(value)}
					onImportFile={(content) => handleImportFile(content)}
					onExportFile={(fileName) => exportFile(value, fileName, currentFileType)}
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
						value={value}
						onChange={onChange}
						height="100%"
						theme={gqTheme}
						extensions={getExtensionsByFileType(currentFileType, lspWorker)}
						editable={editable}
						basicSetup={{
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
								onClick={() => onChange("{}")}
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
