import type { LoadingState } from "@/app/page-utils";
import useDebounce from "@/hooks/useDebounce";
import { gqTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { type Data, emptyContent } from "@/model/data";
import FileType from "@/model/file-type";
import { initLoadingState } from "@/model/loading-state";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import type { CompletionSource } from "@codemirror/autocomplete";
import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { TriangleAlert } from "lucide-react";
import {
	type MutableRefObject,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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
import useLazyState from "@/hooks/useLazyState";

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
	convertCodeCallback?: MutableRefObject<
		((fileType: FileType) => void) | undefined
	>;
	loadingCallback?: MutableRefObject<
		((loading: LoadingState) => void) | undefined
	>;
	updateCallback?: MutableRefObject<((data: Data) => void) | undefined>;
	completionSource?: CompletionSource;
	contentRef?: MutableRefObject<string | undefined>;
	typeRef?: MutableRefObject<FileType | undefined>;
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
	const [editorErrorMessage, setEditorErrorMessage] = useState<
		string | undefined
	>();
	const [currentContent, setCurrentContent, instantContent] = useLazyState(emptyContent(fileTypes[0]), 50, onChangeContent);
	const [currentType, setType] = useState<FileType>(fileTypes[0]);
	const {
		settings: {
			formattingSettings: { formatOnImport, dataTabSize, queryTabSize },
		},
	} = useSettings();
	const [showWarnings, setShowWarnings] = useState(false);
	const [loading, setLoading] = useState<LoadingState>(initLoadingState);
	const [focused, onChangeFocused] = useState(false);
	const { formatWorker, convertWorker } = useWorker();
	const indentSize = currentType === FileType.GQ ? queryTabSize : dataTabSize;
	const available = currentContent.length < 100000000;

	const handleFormatCode = useCallback(
		async (content: string) => {
			if (!formatWorker || loading.isLoading) return;
			setLoading({ isLoading: true, message: "Formatting code..." });
			try {
				const data = { content, type: currentType };
				const result = await formatCode(data, indentSize, formatWorker);
				setEditorErrorMessage(undefined);
				setCurrentContent(result);
			} catch (err) {
				setEditorErrorMessage(err.message);
			} finally {
				setLoading(initLoadingState);
			}
		},
		[indentSize, formatWorker, loading, currentType],
	);

	const handleImportFile = useCallback(
		async (data: Data) => {
			setCurrentContent(data.content);
			setType(data.type);
			formatOnImport && (await handleFormatCode(data.content));
		},
		[formatOnImport, handleFormatCode],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!focused) return;
			if (event.ctrlKey && event.key === "s") {
				event.preventDefault();
				handleFormatCode(currentContent);
			}
		},
		[focused, handleFormatCode, currentContent],
	);

	const handleChangeFileType = useCallback(
		(newFileType: FileType) => {
			if (!convertWorker || newFileType === currentType || loading.isLoading)
				return;
			setLoading({
				isLoading: true,
				message: `Converting code to ${currentType.toUpperCase()}...`,
			});
			const data = { content: currentContent, type: currentType };
			convertCode(data, newFileType, dataTabSize, convertWorker)
				.then((data) => {
					setCurrentContent(data.content);
					setType(data.type);
					setEditorErrorMessage(undefined);
					onChangeFileType?.(data.type);
				})
				.catch((e) => setEditorErrorMessage(e.message))
				.finally(() => setLoading({ isLoading: false, message: "" }));
		},
		[
			currentContent,
			currentType,
			dataTabSize,
			convertWorker,
			onChangeFileType,
			loading,
		],
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
			loadingCallback.current = setLoading;
		}
		if (updateCallback) {
			updateCallback.current = (data: Data) => {
				setCurrentContent(data.content);
				setType(data.type);
			};
		}
	}, [
		handleChangeFileType,
		convertCodeCallback,
		loadingCallback,
		updateCallback,
	]);

	useEffect(() => {
		if (contentRef) {
			contentRef.current = currentContent;
		}
		if (typeRef) {
			typeRef.current = currentType;
		}
	}, [currentContent, currentType, contentRef, typeRef]);

	const extensions: Extension[] = useMemo(
		() => getCodemirrorExtensionsByFileType(currentType, completionSource),
		[currentType, completionSource],
	);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<div className="flex gap-4 items-center">
				<EditorTitle
					title={title}
					fileTypes={fileTypes}
					currentFileType={currentType}
					onChangeFileType={handleChangeFileType}
				/>
				<EditorMenu
					fileType={currentType}
					defaultFilename={defaultFileName}
					editable={editable}
					onCopyToClipboard={() => copyToClipboard(currentContent)}
					onFormatCode={() => handleFormatCode(currentContent)}
					onImportFile={(data) => handleImportFile(data)}
					onExportFile={(filename) =>
						exportFile({ content: currentContent, type: currentType }, filename)
					}
					onChangeLoading={setLoading}
					onError={(err) => setEditorErrorMessage(err.message)}
				/>
			</div>

			<div
				data-focus={focused}
				onFocus={() => onChangeFocused(true)}
				onBlur={() => onChangeFocused(false)}
				className={`${styles.editor} relative block h-full rounded-lg overflow-hidden`}
			>
				<EditorLoadingOverlay
					loading={loading.isLoading}
					loadingMessage={loading.message}
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
						value={instantContent}
						onChange={setCurrentContent}
						height="100%"
						theme={gqTheme}
						extensions={extensions}
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
						type={currentType}
						onClearContent={setCurrentContent}
					/>
				)}
			</div>
		</div>
	);
};

export default Editor;
