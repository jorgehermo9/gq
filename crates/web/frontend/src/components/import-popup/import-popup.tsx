import ActionButton from "@/components/action-button/action-button";
import useLazyState from "@/hooks/useLazyState";
import { STATE_DEBOUNCE_TIME } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import { Data } from "@/model/data";
import type FileType from "@/model/file-type";
import { getFileExtensions } from "@/model/file-type";
import { fromString } from "@/model/http-method";
import { type LoadingState, notLoading } from "@/model/loading-state";
import { File, FileUp, Trash } from "lucide-react";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import RequestBodyTab from "../request-body-tab/request-body-tab";
import RequestHeadersTab from "../request-headers-tab/request-headers-tab";
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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
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
	if (hidden) return null;

	const [open, setOpen] = useState(false);
	const [httpMethod, setHttpMethod] = useState<"GET" | "POST">("GET");
	const [headers, setHeaders] = useState<[string, string, boolean][]>([["", "", true]]);
	const [body, setBody, instantBody] = useLazyState<string>("", STATE_DEBOUNCE_TIME);
	const [selectedUrlTab, setSelectedUrlTab] = useState<"headers" | "body">("headers");
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

	const handleImportFile = useCallback(async () => {
		if (!file) return;
		onChangeLoading({
			isLoading: true,
			message: `Importing ${file.f.name}...`,
		});
		setOpen(false);
		setFile(undefined);
		try {
			const fileContent = await getFileContent(file.f);
			onImportFile(new Data(fileContent, file.type));
		} catch (err) {
			onError(err);
		} finally {
			onChangeLoading(notLoading());
		}
	}, [file, onChangeLoading, onImportFile, onError]);

	const handleImportUrl = useCallback(async () => {
		if (!url) return;
		onChangeLoading({
			isLoading: true,
			message: "Importing file from url...",
		});
		setOpen(false);
		try {
			const enabledHeaders: [string, string][] = headers
				.filter(([, , enabled]) => enabled)
				.map(([key, value]) => [key, value]);
			const data = await importUrl(currentType, url, httpMethod, enabledHeaders, body);
			onImportFile(data);
		} catch (err) {
			onError(err);
		} finally {
			onChangeLoading(notLoading());
		}
	}, [currentType, url, httpMethod, headers, body, onChangeLoading, onImportFile, onError]);

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

	const handleChangeHttpMethod = (value: string) => {
		const method = fromString(value);
		setHttpMethod(method);
		if (method === "GET") {
			setSelectedUrlTab("headers");
		}
	};

	const headersCount = headers.reduce((acc, [key, value]) => (key || value ? acc + 1 : acc), 0);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<ActionButton description="Import file" className="px-4 h-full border-0 border-l">
					<FileUp className="w-3.5 h-3.5" />
				</ActionButton>
			</DialogTrigger>
			<DialogContent className="w-[42rem] max-w-[80vw]">
				<DialogHeader>
					<DialogTitle>Import file</DialogTitle>
					<DialogDescription>
						Import a valid file to the editor either from a URL or a local file.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} autoComplete="off" className="overflow-x-auto">
					<Tabs defaultValue="url" className="pb-8">
						<TabsList className="flex mb-8 border-y">
							<TabsTrigger value="url" className="w-1/2">
								From URL
							</TabsTrigger>
							<TabsTrigger value="file" className="w-1/2">
								From local file
							</TabsTrigger>
						</TabsList>
						<TabsContent value="url" className="h-[32vh] px-6">
							<div className="flex items-center">
								<Select value={httpMethod} onValueChange={handleChangeHttpMethod}>
									<SelectTrigger className="w-min bg-accent-background font-semibold">
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
									className="w-full m-0 rounded-l-none"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
								/>
							</div>
							<Tabs
								value={selectedUrlTab}
								onValueChange={(e) => (e === "body" || e === "headers") && setSelectedUrlTab(e)}
								className="flex flex-col h-full pb-2"
							>
								<TabsList className="flex justify-start my-4">
									<TabsTrigger value="headers" className="w-32" variant="outline">
										<span className="relative">
											Headers
											<span
												data-show={headersCount > 0}
												className="absolute -right-[14px] -top-[3px] text-lg text-success opacity-0 data-[show=true]:opacity-100 transition-opacity"
											>
												•
											</span>
										</span>
									</TabsTrigger>
									{httpMethod === "POST" && (
										<TabsTrigger value="body" className="w-32" variant="outline">
											<span className="relative">
												Body
												<span
													data-show={body !== ""}
													className="absolute -right-[14px] -top-[3px] text-lg text-success opacity-0 data-[show=true]:opacity-100 transition-opacity"
												>
													•
												</span>
											</span>
										</TabsTrigger>
									)}
								</TabsList>
								<TabsContent value="headers" className="overflow-y-auto">
									<RequestHeadersTab headers={headers} setHeaders={setHeaders} />
								</TabsContent>
								{httpMethod === "POST" && (
									<TabsContent value="body" className="pb-16 overflow-y-auto min-h-full">
										<RequestBodyTab body={instantBody} setBody={setBody} />
									</TabsContent>
								)}
							</Tabs>
						</TabsContent>
						<TabsContent value="file" className="h-[32vh] mt-8 px-8">
							<div className="flex items-center w-full h-full">
								<div className={styles.importFileContainer}>
									<Label
										htmlFor="file-import"
										className="flex items-center justify-center border-2 border-muted border-dashed w-full h-full cursor-pointer"
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
												<span className="text-center font-semibold">{file.f.name}</span>
												<span className="text-xs">{formatBytes(file.f.size)}</span>
											</div>
										) : (
											<span className="w-2/5 text-center leading-5">
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
						</TabsContent>
					</Tabs>
					<div className="flex justify-between mt-12">
						<Button
							containerClassName="w-1/2"
							className="w-full py-1 px-8 border-0 border-t"
							variant="outline"
							onClick={() => setOpen(false)}
							type="button"
						>
							Cancel
						</Button>
						<Button
							containerClassName="w-1/2"
							className="w-full py-1 px-8"
							variant="success"
							type="submit"
							disabled={!(file || url)}
						>
							Import
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ImportPopup;
