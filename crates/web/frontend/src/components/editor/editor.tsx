import { gqTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";
import { useWorker } from "@/providers/worker-provider";
import { json } from "@codemirror/lang-json";
import CodeMirror from "@uiw/react-codemirror";
import { Eraser } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ActionButton from "../action-button/action-button";
import EditorMenu from "./editor-menu";
import { copyToClipboard, exportFile, formatCode } from "./editor-utils";
import styles from "./editor.module.css";
import urlPlugin from "./url-plugin";

interface Props {
	value: string;
	title: string;
	defaultFileName: string;
	fileType: FileType;
	onChange: (value: string) => void;
	className?: string;
	errorMessage?: string;
	editable?: boolean;
}

const Editor = ({
	value,
	title,
	defaultFileName,
	fileType,
	onChange,
	className,
	errorMessage,
	editable = true,
}: Props) => {
	const [isFocused, setIsFocused] = useState(false);
	const [formatErrorMessage, setFormatErrorMessage] = useState<
		string | undefined
	>();
	const {
		settings: {
			formattingSettings: { jsonTabSize, queryTabSize },
		},
	} = useSettings();
	const { formatWorker } = useWorker();
	const indentSize = fileType === FileType.JSON ? jsonTabSize : queryTabSize;
	const available = value.length < 100000000;

	const handleFormatCode = useCallback(async () => {
		if (!formatWorker) return;
		try {
			const result = await formatCode(
				value,
				fileType,
				indentSize,
				formatWorker,
			);
			setFormatErrorMessage(undefined);
			onChange(result);
		} catch (e) {
			setFormatErrorMessage(e.message);
		}
	}, [fileType, indentSize, onChange, value, formatWorker]);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!isFocused) return;
			if (event.ctrlKey && event.key === "s") {
				event.preventDefault();
				handleFormatCode();
			}
		},
		[isFocused, handleFormatCode],
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<div className="flex gap-4 items-center">
				<h2 className="text-lg">
					<span className="font-smibold">{title.split(" ")[0]}</span>
					<span className="font-bold"> {title.split(" ")[1]}</span>
				</h2>
				<EditorMenu
					fileType={fileType}
					defaultFileName={defaultFileName}
					editable={editable}
					onCopyToClipboard={() => copyToClipboard(value)}
					onFormatCode={handleFormatCode}
					onImportFile={onChange}
					onExportFile={(fileName) => exportFile(value, fileName, fileType)}
				/>
			</div>

			<div
				data-focus={isFocused}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				className={`${styles.editor} relative h-full rounded-lg overflow-hidden`}
			>
				<div
					data-visible={!editable && (!!errorMessage || !!formatErrorMessage)}
					className={styles["error-overlay"]}
				/>
				<span
					data-visible={!!errorMessage || !!formatErrorMessage}
					className={styles["error-content"]}
				>
					{errorMessage || formatErrorMessage}
				</span>
				{available ? (
					<CodeMirror
						className="w-full h-full rounded-lg text-[0.8rem]"
						value={value}
						onChange={onChange}
						height="100%"
						theme={gqTheme}
						extensions={[json(), urlPlugin]}
						editable={editable}
						basicSetup={{
							lineNumbers: true,
							lintKeymap: true,
							highlightActiveLineGutter: editable,
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
