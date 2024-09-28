import { statusTextMap } from "@/lib/utils";
import { Data } from "@/model/data";
import type FileType from "@/model/file-type";
import { fromMimeType } from "@/model/file-type";
import { toast } from "sonner";

export type ImportedFile = {
	f: File;
	type: FileType;
};

export const validateFile = (
	file: File | undefined,
	importableTypes: FileType[],
	callback: (importedFile: ImportedFile) => void,
) => {
	if (!file) {
		toast.warning("No file was imported!");
		return;
	}
	try {
		const importedFileType = fromMimeType(file.type);
		if (!importableTypes.includes(importedFileType)) {
			toast.error(`Files of type ${importedFileType} cannot be imported into this editor`);
		}
		callback({ f: file, type: importedFileType });
	} catch {
		toast.error(`Unable to import files of type ${file.type}`);
	}
};

export const getFileContent = (importedFile: ImportedFile): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const content = reader.result as string;
			resolve(content);
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsText(importedFile.f);
	});
};

export const importUrl = async (
	currentType: FileType,
	url: string,
	httpMethod: string,
	headers: [string, string][],
	body: string | null = null,
): Promise<Data> => {
	const response = await fetch(url, {
		method: httpMethod,
		headers: headers.filter(([k, v]) => k && v),
		body: body,
	});
	if (!response.ok) {
		throw new Error(`Received ${response.status} (${statusTextMap.get(response.status)})`);
	}
	const content = await response.text();
	const contentType = response.headers.get("Content-Type") || "";
	const fileType = contentType.startsWith("text/plain") ? currentType : fromMimeType(contentType);
	return new Data(content, fileType);
};
