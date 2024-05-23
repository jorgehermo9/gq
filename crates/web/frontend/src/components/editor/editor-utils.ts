import FileType from "@/model/file-type";
import { autocompletion } from "@codemirror/autocomplete";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import type { LanguageSupport } from "@codemirror/language";
import type { Extension } from "@uiw/react-codemirror";
import { toast } from "sonner";
import type PromiseWorker from "webworker-promise";
import urlPlugin from "./url-plugin";
import { getAutocompleteGqFn } from "./editor-completions";

export const exportFile = (
	value: string,
	fileName: string,
	fileType: FileType,
) => {
	const blob = new Blob([value], { type: `application/${fileType}` });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${fileName}.${fileType}`;
	a.click();
	URL.revokeObjectURL(url);
	toast.success("File exported succesfully!");
};

export const copyToClipboard = (value: string) => {
	navigator.clipboard.writeText(value);
	toast.success("Copied to your clipboard!");
};

export const formatCode = async (
	value: string,
	fileType: FileType,
	indentSize: number,
	formatWorker: PromiseWorker,
): Promise<string> => {
	const toastId = toast.loading("Formatting code...");
	try {
		const response = await formatWorker.postMessage({
			data: value,
			indent: indentSize,
			type: fileType,
		});
		toast.success("Code formatted!", { id: toastId });
		return response;
	} catch (err) {
		toast.error(err.message, { id: toastId, duration: 5000 });
		throw err;
	}
};
export const convertCode = async (
	value: string,
	from: FileType,
	to: FileType,
	converterWorker: PromiseWorker,
): Promise<string> => {
	const toastId = toast.loading("Converting code...");
	try {
		const response = await converterWorker.postMessage({
			data: value,
			from,
			to,
		});
		toast.success("Code converted!", { id: toastId });
		return response;
	} catch (err) {
		toast.error(err.message, { id: toastId, duration: 5000 });
		throw err;
	}
}


const jsonLanguage = json();
const gqLanguage = json();
const yamlLanguage = yaml();

const getLanguageByFileType = (fileType: FileType): LanguageSupport => {
	switch (fileType) {
		case FileType.JSON:
			return jsonLanguage;
		case FileType.GQ:
			return gqLanguage;
		case FileType.YAML:
			return yamlLanguage;
		default:
			throw new Error("Invalid file type");
	}
};

export const getExtensionsByFileType = (
	fileType: FileType,
	lspWorker: PromiseWorker | undefined,
): Extension[] => {
	const language = getLanguageByFileType(fileType);
	switch (fileType) {
		case FileType.JSON:
			return [language, urlPlugin];
		case FileType.GQ:
			return [language, autocompletion({ override: [getAutocompleteGqFn(lspWorker)] })];
		case FileType.YAML:
			return [language, urlPlugin];
		default:
			throw new Error("Invalid file type");
	}
};
