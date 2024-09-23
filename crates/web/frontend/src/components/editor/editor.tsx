import useLazyState from "@/hooks/useLazyState";
import { gqTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Data } from "@/model/data";
import FileType from "@/model/file-type";
import { type LoadingState, loading, notLoading } from "@/model/loading-state";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import type { CompletionSource } from "@codemirror/autocomplete";
import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { TriangleAlert } from "lucide-react";
import { type MutableRefObject, useCallback, useEffect, useMemo, useState } from "react";
import ActionButton from "../action-button/action-button";
import EditorErrorOverlay from "../editor-overlay/editor-error-overlay";
import EditorLoadingOverlay from "../editor-overlay/editor-loading-overlay";
import EditorConsole from "./editor-console";
import EditorMenu from "./editor-menu";
import EditorTitle from "./editor-title";
import { EditorTooLarge } from "./editor-too-large";
import {
	convertCode,
	copyToClipboard,
	exportFile,
	formatCode,
	getCodemirrorExtensionsByFileType,
} from "./editor-utils";
import styles from "./editor.module.css";
import { cubicBezier, motion } from "framer-motion";

interface Props {
	title: string;
	defaultFileName: string;
	fileTypes: FileType[];
	onChangeFileType?: (fileType: FileType) => void;
	onChangeContent?: (content: string) => void;
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
}

const Editor = ({
	title,
	defaultFileName,
	fileTypes,
	onChangeFileType,
	onChangeContent,
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
	editable = true,
}: Props) => {
	const [editorErrorMessage, setEditorErrorMessage] = useState<string>();
	const [content, setContent, instantContent] = useLazyState("" as string, 50, onChangeContent);
	const [type, setType] = useState<FileType>(fileTypes[0]);
	const [showConsole, setShowConsole] = useState(false);
	const [loadingState, setLoadingState] = useState<LoadingState>(notLoading());
	const [focused, onChangeFocused] = useState(false);
	const {
		settings: {
			formattingSettings: { formatOnImport, dataTabSize, queryTabSize },
		},
	} = useSettings();
	const { formatWorker, convertWorker } = useWorker();
	const indentSize = type === FileType.GQ ? queryTabSize : dataTabSize;
	const available = content.length < 100000000;
	// const borderRepeatDelay = Math.random() * 5 + 15;

	const handleFormatCode = useCallback(
		async (cont: string) => {
			if (!formatWorker || loadingState.isLoading || cont === "") return;
			setLoadingState(loading("Formatting code..."));
			try {
				const data = new Data(cont, type);
				const result = await formatCode(data, indentSize, formatWorker);
				setEditorErrorMessage(undefined);
				setContent(result.content);
			} catch (err) {
				setEditorErrorMessage(err.message);
			} finally {
				setLoadingState(notLoading);
			}
		},
		[indentSize, formatWorker, loadingState, type, setContent],
	);

	const handleImportFile = useCallback(
		async (data: Data) => {
			setContent(data.content);
			setType(data.type);
			formatOnImport && (await handleFormatCode(data.content));
		},
		[formatOnImport, handleFormatCode, setContent],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!focused) return;
			if (event.ctrlKey && (event.key === "s" || event.key === "S")) {
				event.preventDefault();
				handleFormatCode(content);
			}
		},
		[focused, handleFormatCode, content],
	);

	const handleChangeFileType = useCallback(
		async (newFileType: FileType) => {
			if (!convertWorker || newFileType === type || loadingState.isLoading) return;
			setLoadingState(loading(`Converting code to ${newFileType.toUpperCase()}...`));
			const data = new Data(content, type);
			try {
				const convertedData = await convertCode(data, newFileType, dataTabSize, convertWorker);
				setContent(convertedData.content);
				setType(convertedData.type);
				setEditorErrorMessage(undefined);
				onChangeFileType?.(convertedData.type);
			} catch (e) {
				setEditorErrorMessage(e.message);
			} finally {
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

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<div className="flex gap-4 items-center pr-2">
				<EditorTitle
					title={title}
					fileTypes={fileTypes}
					currentFileType={type}
					onChangeFileType={handleChangeFileType}
				/>
				<EditorMenu
					fileType={type}
					defaultFilename={defaultFileName}
					editable={editable}
					onCopyToClipboard={() => copyToClipboard(content)}
					onFormatCode={() => handleFormatCode(content)}
					onImportFile={handleImportFile}
					onExportFile={(filename) => exportFile(new Data(content, type), filename)}
					onChangeLoading={setLoadingState}
					onError={(err) => setEditorErrorMessage(err.message)}
				/>
			</div>

			<div
				data-focused={focused}
				data-title={defaultFileName}
				className={`${styles.editor} relative h-full rounded-lg p-[1px] overflow-hidden`}
			>
				<motion.div
					className={styles.editorBorderTop}
					animate={{ opacity: [0, 0.4, 0.4, 0, 0], rotate: [0, 10, 180, 190, 360] }}
					transition={{
						duration: 4,
						delay: 0,
						ease: cubicBezier(0.66, 0.17, 0.43, 0.91),
						// repeat: Number.POSITIVE_INFINITY,
						// repeatType: "loop",
						// repeatDelay: borderRepeatDelay,
						times: [0, 0.1, 0.5, 0.6, 1],
					}}
				/>
				<motion.div
					className={styles.editorBorderBottom}
					animate={{ opacity: [0, 0.4, 0.4, 0, 0], rotate: [0, -10, -180, -190, -360] }}
					transition={{
						duration: 4,
						delay: 0,
						ease: cubicBezier(0.66, 0.17, 0.43, 0.91),
						// repeat: Number.POSITIVE_INFINITY,
						// repeatType: "loop",
						// repeatDelay: borderRepeatDelay,
						times: [0, 0.1, 0.5, 0.6, 1],
					}}
				/>
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
				<div className="bg-background w-full h-full rounded-lg">
					{available ? (
						<CodeMirror
							onFocus={() => onChangeFocused(true)}
							onBlur={() => onChangeFocused(false)}
							className="w-full h-full rounded-lg text-xs overflow-hidden"
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
