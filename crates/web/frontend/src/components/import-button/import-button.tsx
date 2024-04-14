import ActionButton from "@/components/action-button/action-button";
import type FileType from "@/model/file-type";
import { File, FileUp, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { formatBytes } from "@/lib/utils";

interface Props {
	fileType: FileType;
	onImportFile: (fileName: string) => void;
	hidden?: boolean;
}

const ImportButton = ({ fileType, onImportFile, hidden = false }: Props) => {
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");
	const [file, setFile] = useState<File>();

	const handleImportFile = async () => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const content = reader.result as string;
			onImportFile(content);
			toast.success("File imported successfully!");
			setOpen(false);
			setFile(undefined);
		};
		reader.readAsText(file);
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

	const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file) {
			setFile(file);
		}
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (file) {
			handleImportFile();
		} else if (url) {
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
			<DialogContent className="w-[28vw] min-w-96 max-w-sccreen">
				<DialogHeader>
					<DialogTitle>Import file</DialogTitle>
					<DialogDescription>
						Import a valid file to the editor either from a URL or a local file.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} autoComplete="off">
					<div>
						<div>
							<Label
								htmlFor="url-import"
								variant={file !== undefined ? "disabled" : "default"}
							>
								From URL
							</Label>
							<Input
								disabled={file !== undefined}
								id="url-import"
								type="url"
								placeholder="Enter URL"
								className="w-full mt-2"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
							/>
						</div>

						<Separator />

						<div className="w-full">
							<span className="text-sm">From local file</span>
							<div className="w-full h-full relative group">
								<Label
									htmlFor="file-import"
									className="flex items-center rounded-md justify-center border-2 border-muted border-dashed w-full h-40 cursor-pointer mt-2"
									onDrop={handleDrop}
									onDragOver={(e) => e.preventDefault()}
								>
									<input
										disabled={url.length > 0}
										id="file-import"
										hidden
										type="file"
										accept={`.${fileType}`}
										onChange={(e) => {
											setFile(e.target.files?.[0]);
											e.target.value = "";
										}}
									/>
									{file ? (
										<div className="flex flex-col items-center justify-center gap-2 w-full h-full relative">
											<File className="w-6 h-6" />
											<span className="text-center leading-5 font-semibold">
												{file.name}
											</span>
											<span className="text-xs">{formatBytes(file.size)}</span>
										</div>
									) : (
										<span className="w-1/2 text-center leading-5">
											Drag and drop a file here or click to select a file
										</span>
									)}
								</Label>
								{file && (
									<div
										className="absolute inset-0 z-20 rounded-md w-full h-full flex items-center justify-center 
									bg-black bg-opacity-70 opacity-0 invisible group-hover:opacity-100 
									group-hover:visible transition-all duration-200 delay-200"
									>
										<ActionButton
											className="p-2"
											onClick={(e) => {
												setFile(undefined);
												e.stopPropagation();
											}}
											description="Remove file"
										>
											<Trash className="w-5 h-5" />
										</ActionButton>
									</div>
								)}
							</div>
						</div>
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
