import ActionButton from "@/components/action-button/action-button";
import type FileType from "@/model/file-type";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { DownloadCloud } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getFileExtensions } from "@/model/file-type";

interface Props {
	defaultFileName: string;
	fileType: FileType;
	onExportFile: (fileName: string) => void;
}

const ExportButton = ({ defaultFileName, fileType, onExportFile }: Props) => {
	const [fileName, setFileName] = useState(defaultFileName);
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<ActionButton description="Export file" className="px-4 py-2">
					<DownloadCloud className="w-3.5 h-3.5" />
				</ActionButton>
			</DialogTrigger>
			<DialogContent className="w-[16vw] min-w-96 max-w-sccreen">
				<DialogHeader>
					<DialogTitle>Export to file</DialogTitle>
					<DialogDescription>
						Export the content of the editor to a file with a custom name
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onExportFile(fileName);
						setOpen(false);
					}}
					autoComplete="off"
				>
					<Label htmlFor="filename">File Name</Label>
					<div className="flex items-center relative">
						<Input
							id="filename"
							type="text"
							required
							minLength={1}
							maxLength={255}
							placeholder="Enter file name"
							className="w-full mt-2"
							value={fileName}
							onChange={(e) => setFileName(e.target.value)}
						/>
						<span className="absolute right-[1px] border border-accent-background py-2 px-4 h-9.5 rounded-r-md text-sm bg-accent-background">
							.{getFileExtensions(fileType)[0]}
						</span>
					</div>

					<div className="flex justify-between mt-12">
						<Button
							className="py-1 px-8"
							variant="outline"
							onClick={() => setOpen(false)}
							type="button"
						>
							Cancel
						</Button>
						<Button className="py-1 px-8" variant="success" type="submit">
							Export
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ExportButton;
