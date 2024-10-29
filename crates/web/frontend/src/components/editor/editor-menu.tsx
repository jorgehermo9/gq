import ActionButton from "@/components/action-button/action-button";
import ExportPopover from "@/components/export-popover/export-popover";
import ImportPopup from "@/components/import-popup/import-popup";
import { cn } from "@/lib/utils";
import type { Data } from "@/model/data";
import type FileType from "@/model/file-type";
import type { LoadingState } from "@/model/loading-state";
import { Braces, Clipboard } from "lucide-react";
import ApplyButton from "../apply-button/apply-button";

interface Props {
	currentType: FileType;
	fileTypes: FileType[];
	defaultFilename: string;
	editable: boolean;
	onCopyToClipboard: () => void;
	onFormatCode: () => void;
	onImportFile: (data: Data) => void;
	onExportFile: (filename: string) => void;
	onChangeLoading: (loading: LoadingState) => void;
	onError: (error: Error) => void;
	onApply?: () => void;
}

const EditorMenu = ({
	currentType,
	fileTypes,
	defaultFilename,
	editable,
	onCopyToClipboard,
	onFormatCode,
	onImportFile,
	onExportFile,
	onChangeLoading,
	onError,
	onApply,
}: Props) => {
	return (
		<div className="hidden sm:flex h-full">
			<ActionButton
				className="px-4 h-full border-0 border-l"
				description="Copy to clipboard"
				onClick={onCopyToClipboard}
			>
				<Clipboard className="w-3.5 h-3.5" />
			</ActionButton>
			<ActionButton
				className="px-4 h-full border-0 border-l"
				description="Format code"
				onClick={onFormatCode}
				hidden={!editable}
			>
				<Braces className="w-3.5 h-3.5" />
			</ActionButton>
			<ImportPopup
				currentType={currentType}
				importableTypes={fileTypes}
				onChangeLoading={onChangeLoading}
				onImportFile={onImportFile}
				hidden={!editable}
				onError={onError}
			/>
			<ExportPopover
				defaultFilename={defaultFilename}
				fileType={currentType}
				onExportFile={onExportFile}
				className={cn(onApply && "border-r")}
			/>
			<ApplyButton onClick={onApply} />
		</div>
	);
};

export default EditorMenu;
