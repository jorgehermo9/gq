import ActionButton from "@/components/action-button/action-button";
import type FileType from "@/model/file-type";
import { getFileExtensions } from "@/model/file-type";
import { DownloadCloud } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "../ui/popover";

interface Props {
	defaultFilename: string;
	fileType: FileType;
	onExportFile: (fileName: string) => void;
}

const ExportPopover = ({ defaultFilename, fileType, onExportFile }: Props) => {
	const [fileName, setFileName] = useState(defaultFilename);
	const [open, setOpen] = useState(false);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onExportFile(fileName);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<ActionButton description="Export file" className="px-4 py-2">
					<DownloadCloud className="w-3.5 h-3.5" />
				</ActionButton>
			</PopoverTrigger>
			<PopoverContent className="w-[22rem] max-w-[80vw]">
				<PopoverHeader>
					<PopoverTitle>Export to file</PopoverTitle>
					<PopoverDescription>
						Export the content of the editor to a file with a custom name
					</PopoverDescription>
				</PopoverHeader>
				<form onSubmit={handleSubmit} autoComplete="off" className="mt-4">
					<Label htmlFor="filename">File Name</Label>
					<div className="flex items-center">
						<Input
							id="filename"
							type="text"
							required
							minLength={1}
							maxLength={255}
							placeholder="Enter file name"
							className="w-full mt-2 rounded-r-none"
							value={fileName}
							onChange={(e) => setFileName(e.target.value)}
						/>
						<span className="py-2 px-4 h-10 rounded-r-md text-sm bg-accent-background">
							.{getFileExtensions(fileType)[0]}
						</span>
					</div>

					<Button className="px-6 w-full mt-4" variant="outline" type="submit">
						Export
					</Button>
				</form>
			</PopoverContent>
		</Popover>
	);
};

export default ExportPopover;