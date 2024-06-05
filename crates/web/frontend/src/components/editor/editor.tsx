import { gqTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { type Data } from "@/model/data";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import CodeMirror from "@uiw/react-codemirror";
import { TriangleAlert } from "lucide-react";
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
import { EditorTooLarge } from "./editor-too-large";
import { EditorConsole } from "./editor-console";
import { EditorErrorOverlay } from "./editor-error-overlay";
import { EditorLoadingOverlay } from "./editor-loading-overlay";

interface Props {
	data: Data;
	title: string;
	defaultFileName: string;
	fileTypes: FileType[];
	onChangeContent: (content: string) => void;
	focused: boolean;
	onChangeFocused: (focused: boolean) => void;
	onChangeFileType?: (fileType: FileType) => void;
	className?: string;
	errorMessage?: string;
	onDismissError?: () => void;
	warningMessages?: string[];
	loading: boolean;
	loadingMessage: string;
	editable?: boolean;
}

const Editor = ({
	data,
	title,
	defaultFileName,
	fileTypes,
	onChangeContent,
	focused,
	onChangeFocused,
	onChangeFileType,
	className,
	errorMessage,
	onDismissError,
	warningMessages,
	loading,
	loadingMessage,
	editable = true,
}: Props) => {
	const [editorErrorMessage, setEditorErrorMessage] = useState<
		string | undefined
	>();
	const {
		settings: {
			formattingSettings: { formatOnImport, dataTabSize, queryTabSize },
		},
	} = useSettings();
	const [showWarnings, setShowWarnings] = useState(false);
	const { formatWorker, lspWorker } = useWorker();
	const indentSize = data.type === FileType.GQ ? queryTabSize : dataTabSize;
	const available = data.content.length < 100000000;

	const handleFormatCode = useCallback(
		async (data: Data) => {
			if (!formatWorker) return;
			try {
				const result = await formatCode(data, indentSize, formatWorker);
				setEditorErrorMessage(undefined);
				onChangeContent(result.content);
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
			if (!focused) return;
			if (event.ctrlKey && event.key === "s") {
				event.preventDefault();
				handleFormatCode(data);
			}
		},
		[focused, handleFormatCode, data],
	);

	const handleDismissError = useCallback(() => {
		setEditorErrorMessage(undefined);
		onDismissError?.();
	}, [onDismissError]);

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
				data-focus={focused}
				onFocus={() => onChangeFocused(true)}
				onBlur={() => onChangeFocused(false)}
				className={`${styles.editor} relative block h-full rounded-lg overflow-hidden`}
			>
				<EditorLoadingOverlay
					loading={loading}
					loadingMessage={loadingMessage}
				/>
				<EditorErrorOverlay
					visibleBackdrop={
						!editable && (!!errorMessage || !!editorErrorMessage)
					}
					visibleMessage={!!errorMessage || !!editorErrorMessage}
					errorMessage={errorMessage || editorErrorMessage}
					onClose={handleDismissError}
				/>
				<ActionButton
					description="Show warnings"
					variant="ghost"
					onClick={() => setShowWarnings(true)}
					data-visible={
						!!warningMessages && warningMessages.length > 0 && !showWarnings
					}
					className={styles.warningIcon}
				>
					<TriangleAlert className="w-5 h-5 text-warning" />
				</ActionButton>
				<EditorConsole
					lines={warningMessages || []}
					visible={showWarnings}
					onClose={() => setShowWarnings(false)}
				/>
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
					<EditorTooLarge
						editable={editable}
						type={data.type}
						onClearContent={(content) => onChangeContent(content)}
					/>
				)}
			</div>
		</div>
	);
};

export default Editor;
