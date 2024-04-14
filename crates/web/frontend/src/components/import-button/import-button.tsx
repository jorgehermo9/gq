import ActionButton from "@/components/action-button/action-button";
import type FileType from "@/model/file-type";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { FileUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

interface Props {
	fileType: FileType;
	onImportFile: (fileName: string) => void;
	hidden?: boolean;
}

const ImportButton = ({ fileType, onImportFile, hidden = false }: Props) => {
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");

	const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const content = reader.result as string;
			onImportFile(content);
			toast.success("File imported successfully!");
		};
		reader.readAsText(file);
		e.target.value = "";
	};

	const handleImportUrl = () => {
		const toastId = toast.loading("Importing file...");
		fetch(url)
			.then((res) => {
				if (res.status !== 200) {
					throw new Error(`Received ${res.status}`);
				}
				return res.text();
			})
			.then((content) => {
				onImportFile(content);
				toast.success("File imported successfully!", { id: toastId });
				setOpen(false);
				setUrl("");
			})
			.catch((error) => {
				toast.error(`Failed to import file: ${error.message}`, {
					id: toastId,
					duration: 5000,
				});
			});
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (url) {
			handleImportUrl();
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<ActionButton
					description="Import file"
					className="px-4 py-2"
					hidden={hidden}
				>
					<FileUp className="w-3.5 h-3.5" />
				</ActionButton>
			</DialogTrigger>
			<DialogContent className="w-[16vw] min-w-96 max-w-sccreen">
				<DialogHeader>
					<DialogTitle>Import file</DialogTitle>
					<DialogDescription>
						Import a valid file to the editor via URL or local file upload
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} autoComplete="off">
					<div className="flex flex-col gap-4">
						<div>
							<Label htmlFor="url-import">From URL</Label>
							<Input
								id="url-import"
								type="url"
								placeholder="Enter URL"
								className="w-full mt-2"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
							/>
						</div>

						<Label
							htmlFor="file-import"
							className="bg-muted rounded-md border border-foreground border-dashed w-full h-40 cursor-pointer"
						>
							<input
								id="file-import"
								hidden
								type="file"
								accept=".json,.gq"
								onChange={handleImportFile}
							/>
						</Label>
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
							Import
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ImportButton;
