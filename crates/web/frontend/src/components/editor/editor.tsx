import useLazyState from "@/hooks/use-lazy-state";
import { MAX_RENDER_SIZE, STATE_DEBOUNCE_TIME } from "@/lib/constants";
import { gqTheme } from "@/lib/theme";
import { cn, copyToClipboard, isMac } from "@/lib/utils";
import { Data } from "@/model/data";
import FileType from "@/model/file-type";
import { type LoadingState, loading, notLoading } from "@/model/loading-state";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import type { CompletionSource } from "@codemirror/autocomplete";
import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { TriangleAlert } from "lucide-react";
import { type MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ActionButton from "../action-button/action-button";
import EditorConsole from "../editor-console/editor-console";
import EditorErrorOverlay from "../editor-overlay/editor-error-overlay";
import EditorLoadingOverlay from "../editor-overlay/editor-loading-overlay";
import EditorMenu from "./editor-menu";
import EditorTitle from "./editor-title";
import { EditorTooLarge } from "./editor-too-large";
import {
	convertCode,
	exportFile,
	formatCode,
	getCodemirrorExtensionsByFileType,
} from "./editor-utils";
import styles from "./editor.module.css";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	title: string;
	defaultFileName: string;
	fileTypes: FileType[];
	onChangeFileType?: (fileType: FileType) => void;
	onChangeContent?: (content: string) => void;
	onApply?: () => void;
	className?: string;
	errorMessage?: string;
	onDismissError?: () => void;
	warningMessages?: string[];
	editable?: boolean;
	convertCodeCallback?: MutableRefObject<(fileType: FileType) => void>;
	loadingCallback?: MutableRefObject<(loading: LoadingState) => void>;
	updateCallback?: MutableRefObject<(data: Data) => void>;
	completionSource?: CompletionSource;
	contentRef?: MutableRefObject<string>;
	typeRef?: MutableRefObject<FileType>;
	width: string;
	height: string;
}

const Editor = ({
	title,
	defaultFileName,
	fileTypes,
	onChangeFileType,
	onChangeContent,
	onApply,
	className,
	errorMessage,
	onDismissError,
	warningMessages,
	convertCodeCallback,
	loadingCallback,
	updateCallback,
	completionSource,
	contentRef,
	typeRef,
	width,
	height,
	editable = true,
	...props
}: Props) => {
	const [editorErrorMessage, setEditorErrorMessage] = useState<string>();
	const [content, setContent, instantContent] = useLazyState(
		"" as string,
		STATE_DEBOUNCE_TIME,
		onChangeContent,
	);
	const [type, setType] = useState<FileType>(fileTypes[0]);
	const [showConsole, setShowConsole] = useState(false);
	const [loadingState, setLoadingState] = useState<LoadingState>(notLoading());
	const focused = useRef(false); // Ref to avoid rerendering
	const {
		settings: {
			formattingSettings: { formatOnImport, dataTabSize, queryTabSize },
		},
	} = useSettings();
	const { formatWorker, convertWorker } = useWorker();
	const indentSize = type === FileType.GQ ? queryTabSize : dataTabSize;
	const available = content.length < MAX_RENDER_SIZE;

	const handleFormatCode = useCallback(
		async (content: string, type: FileType) => {
			if (!formatWorker || !editable || loadingState.isLoading || content === "") return;
			setLoadingState(loading("Formatting code..."));
			try {
				const data = new Data(content, type);
				const result = await formatCode(data, indentSize, formatWorker);
				setEditorErrorMessage(undefined);
				setContent(result.content);
			} catch (err) {
				setEditorErrorMessage(err.message);
			} finally {
				setLoadingState(notLoading);
			}
		},
		[indentSize, formatWorker, loadingState, setContent, editable],
	);

	const handleImportFile = useCallback(
		async (data: Data) => {
			setContent(data.content);
			setType(data.type);
			onChangeFileType?.(data.type);
			formatOnImport && (await handleFormatCode(data.content, data.type));
		},
		[formatOnImport, handleFormatCode, setContent, onChangeFileType],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!focused.current) return;
			if ((isMac ? event.metaKey : event.ctrlKey) && (event.key === "s" || event.key === "S")) {
				event.preventDefault();
				handleFormatCode(content, type);
			}
		},
		[handleFormatCode, content, type],
	);

	const handleChangeFileType = useCallback(
		async (newFileType: FileType) => {
			if (!convertWorker || newFileType === type || loadingState.isLoading) return;
			setLoadingState(loading(`Converting code to ${newFileType.toUpperCase()}...`));
			const data = new Data(content, type);
			try {
				const convertedData = await convertCode(data, newFileType, dataTabSize, convertWorker);
				setContent(convertedData.content);
			} finally {
				setType(newFileType);
				onChangeFileType?.(newFileType);
				setEditorErrorMessage(undefined);
				setLoadingState(notLoading);
			}
		},
		[content, type, dataTabSize, convertWorker, onChangeFileType, loadingState, setContent],
	);

	const handleDismissError = useCallback(() => {
		setEditorErrorMessage(undefined);
		onDismissError?.();
	}, [onDismissError]);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	useEffect(() => {
		if (convertCodeCallback) {
			convertCodeCallback.current = handleChangeFileType;
		}
		if (loadingCallback) {
			loadingCallback.current = setLoadingState;
		}
		if (updateCallback) {
			updateCallback.current = (data: Data) => {
				setContent(data.content);
				setType(data.type);
			};
		}
	}, [handleChangeFileType, convertCodeCallback, loadingCallback, updateCallback, setContent]);

	useEffect(() => {
		if (contentRef) {
			contentRef.current = instantContent;
		}
		if (typeRef) {
			typeRef.current = type;
		}
	}, [instantContent, type, contentRef, typeRef]);

	const extensions: Extension[] = useMemo(
		() => getCodemirrorExtensionsByFileType(type, completionSource),
		[type, completionSource],
	);

	const handleChangeFocused = useCallback((value: boolean) => {
		focused.current = value;
	}, []);

	return (
		<div
			className={cn("flex flex-col gap-2 border-accent-background bg-background", className)}
			style={{ height, width }}
			{...props}
		>
			<div className="flex min-h-12 max-h-12 justify-between gap-4 border-b">
				<EditorTitle
					title={title}
					fileTypes={fileTypes}
					currentFileType={type}
					onChangeFileType={handleChangeFileType}
				/>
				<EditorMenu
					currentType={type}
					fileTypes={fileTypes}
					defaultFilename={defaultFileName}
					editable={editable}
					onCopyToClipboard={() => copyToClipboard(content)}
					onFormatCode={() => handleFormatCode(content, type)}
					onImportFile={handleImportFile}
					onExportFile={(filename) => exportFile(new Data(content, type), filename)}
					onChangeLoading={setLoadingState}
					onError={(err) => setEditorErrorMessage(err.message)}
					onApply={onApply}
				/>
			</div>

			<div data-title={defaultFileName} className="relative h-full">
				<EditorLoadingOverlay loadingState={loadingState} />
				<EditorErrorOverlay
					visibleBackdrop={!editable && (!!errorMessage || !!editorErrorMessage)}
					visibleMessage={!!errorMessage || !!editorErrorMessage}
					errorMessage={errorMessage || editorErrorMessage}
					onClose={handleDismissError}
				/>
				<ActionButton
					description="Show warnings"
					variant="ghost"
					onClick={() => setShowConsole(true)}
					data-visible={!!warningMessages && warningMessages.length > 0 && !showConsole}
					className={styles.warningIcon}
				>
					<TriangleAlert className="w-5 h-5 text-warning" />
				</ActionButton>
				<EditorConsole
					lines={warningMessages || []}
					visible={showConsole}
					onClose={() => setShowConsole(false)}
				/>
				<div
					className="bg-background w-full"
					style={{
						height: `calc(${height} - 60px)`,
					}}
				>
					{available ? (
						<CodeMirror
							onFocus={() => handleChangeFocused(true)}
							onBlur={() => handleChangeFocused(false)}
							className="w-full h-full text-xs overflow-hidden"
							value={instantContent}
							onChange={setContent}
							height="100%"
							theme={gqTheme}
							extensions={extensions}
							readOnly={!editable}
							basicSetup={{
								autocompletion: true,
								lineNumbers: true,
								lintKeymap: true,
							}}
						/>
					) : (
						<EditorTooLarge editable={editable} onClearContent={() => setContent("")} />
					)}
				</div>
			</div>
		</div>
	);
};

export default Editor;
