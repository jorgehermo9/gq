import ActionButton from "@/components/action-button/action-button";
import useLazyState from "@/hooks/useLazyState";
import { formatBytes } from "@/lib/utils";
import { Data } from "@/model/data";
import type FileType from "@/model/file-type";
import { getFileExtensions } from "@/model/file-type";
import { fromString } from "@/model/http-method";
import { type LoadingState, notLoading } from "@/model/loading-state";
import { EllipsisVertical, File, FileUp, Trash } from "lucide-react";
import { type ChangeEvent, useMemo, useState } from "react";
import BodyPopup from "../body-popup/body-popup";
import HeadersPopup from "../headers-popup/headers-popup";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import styles from "./import-popup.module.css";
import { type ImportedFile, getFileContent, importUrl, validateFile } from "./import-utils";

interface Props {
	currentType: FileType;
	importableTypes: FileType[];
	onImportFile: (data: Data) => void;
	onChangeLoading: (loading: LoadingState) => void;
	onError: (error: Error) => void;
	hidden?: boolean;
}

const ImportPopup = ({
	currentType,
	importableTypes,
	onImportFile,
	onChangeLoading,
	onError,
	hidden = false,
}: Props) => {
	const [open, setOpen] = useState(false);
	const [httpMethod, setHttpMethod] = useState<"GET" | "POST">("GET");
	const [headers, setHeaders] = useState<[string, string][]>([["", ""]]);
	const [body, setBody, instantBody] = useLazyState<string | null>(null, 50);
	const [url, setUrl] = useState("");
	const [file, setFile] = useState<ImportedFile>();

	const importableExtensions = useMemo(
		() =>
			importableTypes
				.flatMap(getFileExtensions)
				.map((ex) => `.${ex}`)
				.join(","),
		[importableTypes],
	);

	const handleImportFile = async () => {
		if (!file) return;
		onChangeLoading({
			isLoading: true,
			message: `Importing ${file.f.name}...`,
		});
		setOpen(false);
		setFile(undefined);
		try {
			const fileContent = await getFileContent(file);
			onImportFile(new Data(fileContent, file.type));
		} catch (err) {
			onError(err);
		} finally {
			onChangeLoading(notLoading());
		}
	};

	const handleImportUrl = async () => {
		if (!url) return;
		onChangeLoading({
			isLoading: true,
			message: "Importing file from url...",
		});
		setOpen(false);
		try {
			const data = await importUrl(currentType, url, httpMethod, headers, body);
			onImportFile(data);
		} catch (err) {
			onError(err);
		} finally {
			onChangeLoading(notLoading());
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		validateFile(file, importableTypes, setFile);
	};

	const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		validateFile(file, importableTypes, setFile);
		e.target.value = "";
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		file ? handleImportFile() : url && handleImportUrl();
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<ActionButton description="Import file" className="px-4 py-2" hidden={hidden}>
					<FileUp className="w-3.5 h-3.5" />
				</ActionButton>
			</DialogTrigger>
			<DialogContent className="w-[36rem] max-w-[80vw]">
				<DialogHeader>
					<DialogTitle>Import file</DialogTitle>
					<DialogDescription>
						Import a valid file to the editor either from a URL or a local file.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} autoComplete="off">
					<div>
						<Label htmlFor="url-import" variant={file !== undefined ? "disabled" : "default"}>
							<span>From URL</span>
						</Label>
						<div className="flex items-center">
							<Select
								value={httpMethod}
								onValueChange={(value) => setHttpMethod(fromString(value))}
							>
								<SelectTrigger className="w-min rounded-r-none bg-accent-background font-semibold">
									<SelectValue id="http-method" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value="GET">GET</SelectItem>
										<SelectItem value="POST">POST</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
							<Input
								id="url-import"
								disabled={file !== undefined}
								type="url"
								placeholder="Enter URL"
								className="w-full mt-2 rounded-l-none"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
							/>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button className="w-8 h-10 ml-4" variant="outline" size="icon">
										<EllipsisVertical className="w-4 h-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent side="bottom" sideOffset={8}>
									<HeadersPopup headers={headers} setHeaders={setHeaders} />
									{httpMethod === "POST" && <BodyPopup body={instantBody} setBody={setBody} />}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<Separator />

						<div className="w-full">
							<span className="text-sm">From local file</span>
							<div className={styles.importFileContainer}>
								<Label
									htmlFor="file-import"
									className="flex items-center rounded-md justify-center border-2 border-muted border-dashed w-full h-40 cursor-pointer mt-2"
									onDrop={handleDrop}
									onDragOver={(e) => e.preventDefault()}
								>
									<input
										id="file-import"
										hidden
										type="file"
										accept={importableExtensions}
										onChange={handleSelectFile}
									/>
									{file ? (
										<div className="flex flex-col items-center justify-center gap-2 w-full h-full relative">
											<File className="w-6 h-6" />
											<span className="text-center leading-5 font-semibold">{file.f.name}</span>
											<span className="text-xs">{formatBytes(file.f.size)}</span>
										</div>
									) : (
										<span className="w-1/2 text-center leading-5">
											Drag and drop a file here or click to select one
										</span>
									)}
								</Label>
								{file && (
									<div className={styles.deleteFileOverlay}>
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

export default ImportPopup;
