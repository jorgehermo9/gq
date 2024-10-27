import { notify } from "@/lib/notify";
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
	onSuccess?: (importedFile: ImportedFile) => void,
	onError?: (error: Error) => void,
) => {
	if (!file) {
		toast.warning("No file was imported!");
		return;
	}
	try {
		const importedFileType = fromMimeType(file.type);
		if (!importableTypes.includes(importedFileType)) {
			const error = new Error(
				`Files of type ${importedFileType} cannot be imported into this editor`,
			);
			notify.error(error.message);
			onError?.(error);
			return;
		}
		onSuccess?.({ f: file, type: importedFileType });
	} catch {
		const error = new Error(`Unable to import files of type ${file.type}`);
		notify.error(error.message);
		onError?.(error);
	}
};

export const getFileContent = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const content = reader.result as string;
			resolve(content);
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsText(file);
	});
};

export const importUrl = async (
	currentType: FileType,
	url: string,
	httpMethod: string,
	headers: [string, string][],
	body: string,
): Promise<Data> => {
	const response = await fetch(url, {
		method: httpMethod,
		headers: headers.filter(([k, v]) => k && v),
		body: httpMethod === "POST" ? body || null : null,
	});
	if (!response.ok) {
		throw new Error(`Received ${response.status} (${statusTextMap.get(response.status)})`);
	}
	const content = await response.text();
	const contentType = response.headers.get("Content-Type") || "";
	const fileType = contentType.startsWith("text/plain") ? currentType : fromMimeType(contentType);
	return new Data(content, fileType);
};
