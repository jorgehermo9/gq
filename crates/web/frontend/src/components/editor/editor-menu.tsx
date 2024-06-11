"use client";

import ActionButton from "@/components/action-button/action-button";
import ExportButton from "@/components/export-button/export-button";
import type { Data } from "@/model/data";
import type FileType from "@/model/file-type";
import type { LoadingState } from "@/model/loading-state";
import { Clipboard, Sparkles } from "lucide-react";
import ImportButton from "../import-button/import-button";

interface Props {
	fileType: FileType;
	defaultFilename: string;
	editable: boolean;
	onCopyToClipboard: () => void;
	onFormatCode: () => void;
	onImportFile: (data: Data) => void;
	onExportFile: (filename: string) => void;
	onChangeLoading: (loading: LoadingState) => void;
	onError: (error: Error) => void;
}

const EditorMenu = ({
	fileType,
	defaultFilename,
	editable,
	onCopyToClipboard,
	onFormatCode,
	onImportFile,
	onExportFile,
	onChangeLoading,
	onError,
}: Props) => {
	return (
		<>
			<div className="hidden sm:flex pr-2 ml-auto items-center gap-4">
				<ActionButton
					className="px-4 py-2"
					description="Copy to clipboard"
					onClick={onCopyToClipboard}
				>
					<Clipboard className="w-3.5 h-3.5" />
				</ActionButton>
				<ActionButton
					className="px-4 py-2"
					description="Format code"
					onClick={onFormatCode}
					hidden={!editable}
				>
					<Sparkles className="w-3.5 h-3.5" />
				</ActionButton>
				<ImportButton
					importableType={fileType}
					onChangeLoading={onChangeLoading}
					onImportFile={onImportFile}
					hidden={!editable}
					onError={onError}
				/>
				<ExportButton
					defaultFilename={defaultFilename}
					fileType={fileType}
					onExportFile={onExportFile}
				/>
			</div>

			{/* <DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button className="w-6 h-6 sm:hidden" variant="outline" size="icon">
						<EllipsisVertical className="w-3 h-3" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" side="right" sideOffset={8}>
					<DropdownMenuItem onClick={onCopyToClipboard}>
						<div className="flex items-center gap-2">
							<Clipboard className="w-4 h-4" />
							<span>Copy</span>
						</div>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onFormatCode} disabled={!editable}>
						<div className="flex items-center gap-2">
							<Sparkles className="w-4 h-4" />
							<span>Format</span>
						</div>
						<DropdownMenuShortcut>Ctrl + S</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="p-0"
						disabled={!editable}
						onSelect={(e) => e.preventDefault()}
					>
						<input
							id="file-import"
							hidden
							type="file"
							accept=".json,.gq"
							onChange={handleImportFile}
						/>
						<Label
							htmlFor="file-import"
							className="flex items-center gap-2 px-2 py-1.5 w-full h-full cursor-pointer text-sm font-normal"
						>
							<FileUp className="w-4 h-4" />
							<span>Import file</span>
						</Label>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => onExportFile(defaultFileName)}>
						<div className="flex items-center gap-2">
							<DownloadCloud className="w-4 h-4" />
							<span>Export file</span>
						</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu> */}
		</>
	);
};

export default EditorMenu;
