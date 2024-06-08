import type { LoadingState } from "@/app/page-utils";
import { gqTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Data } from "@/model/data";
import FileType from "@/model/file-type";
import { initLoadingState } from "@/model/loading-state";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import type { CompletionSource } from "@codemirror/autocomplete";
import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { TriangleAlert } from "lucide-react";
import {
	type MutableRefObject,
	Ref,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import ActionButton from "../action-button/action-button";
import { EditorErrorOverlay } from "../editor-overlay/editor-error-overlay";
import { EditorLoadingOverlay } from "../editor-overlay/editor-loading-overlay";
import { EditorConsole } from "./editor-console";
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

interface Props {
	data: Data;
	title: string;
	defaultFileName: string;
	fileTypes: FileType[];
	onChangeData: (data: Data) => void;
	focused: boolean;
	onChangeFocused: (focused: boolean) => void;
	onChangeFileType?: (fileType: FileType) => void;
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
	completionSource?: CompletionSource;
}

const Editor = ({
	data,
	title,
	defaultFileName,
	fileTypes,
	onChangeData,
	focused,
	onChangeFocused,
	onChangeFileType,
	className,
	errorMessage,
	onDismissError,
	warningMessages,
	convertCodeCallback,
	loadingCallback,
	completionSource,
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
	const [loading, setLoading] = useState<LoadingState>(initLoadingState);
	const { formatWorker, lspWorker, convertWorker } = useWorker();
	const indentSize = data.type === FileType.GQ ? queryTabSize : dataTabSize;
	const available = data.content.length < 100000000;

	const handleFormatCode = useCallback(
		async (data: Data) => {
			if (!formatWorker || loading.isLoading) return;
			setLoading({ isLoading: true, message: "Formatting code..." });
			try {
				const result = await formatCode(data, indentSize, formatWorker);
				setEditorErrorMessage(undefined);
				onChangeData(result);
			} catch (err) {
				setEditorErrorMessage(err.message);
			} finally {
				setLoading(initLoadingState);
			}
		},
		[indentSize, onChangeData, formatWorker, loading],
	);

	const handleImportFile = useCallback(
		async (data: Data) => {
			onChangeData(data);
			formatOnImport && (await handleFormatCode(data));
		},
		[formatOnImport, handleFormatCode, onChangeData],
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

	const handleChangeFileType = useCallback(
		(fileType: FileType) => {
			if (!convertWorker || fileType === data.type || loading.isLoading) return;
			setLoading({
				isLoading: true,
				message: `Converting code to ${fileType.toUpperCase()}...`,
			});
			convertCode(data, fileType, dataTabSize, convertWorker)
				.then((data) => {
					onChangeData(data);
					setEditorErrorMessage(undefined);
					onChangeFileType?.(fileType);
				})
				.catch((e) => setEditorErrorMessage(e.message))
				.finally(() => setLoading({ isLoading: false, message: "" }));
		},
		[data, dataTabSize, convertWorker, onChangeData, onChangeFileType, loading],
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
	}, [handleChangeFileType, convertCodeCallback, loadingCallback]);

	const extensions: Extension[] = useMemo(
		() => getCodemirrorExtensionsByFileType(data.type, completionSource),
		[data.type, completionSource],
	);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<div className="flex gap-4 items-center">
				<EditorTitle
					title={title}
					fileTypes={fileTypes}
					currentFileType={data.type}
					onChangeFileType={handleChangeFileType}
				/>
				<EditorMenu
					fileType={data.type}
					defaultFilename={defaultFileName}
					editable={editable}
					onCopyToClipboard={() => copyToClipboard(data)}
					onFormatCode={() => handleFormatCode(data)}
					onImportFile={(data) => handleImportFile(data)}
					onExportFile={(filename) => exportFile(data, filename)}
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
						value={data.content}
						onChange={(content) => onChangeData({ ...data, content })}
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
						type={data.type}
						onClearData={onChangeData}
					/>
				)}
			</div>
		</div>
	);
};

export default Editor;
