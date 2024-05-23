import FileType from "@/model/file-type";
import {
	CompletionContext,
	CompletionResult,
	type CompletionSource,
	autocompletion,
} from "@codemirror/autocomplete";
import { json } from "@codemirror/lang-json";
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

const jsonLanguage = json();
const gqLanguage = json();

const getLanguageByFileType = (fileType: FileType): LanguageSupport => {
	if (fileType === FileType.JSON) {
		return jsonLanguage;
	}
	if (fileType === FileType.GQ) {
		return gqLanguage;
	}
	throw new Error("Invalid file type");
};

export const getExtensionsByFileType = (
	fileType: FileType,
	lspWorker: PromiseWorker | undefined,
): Extension[] => {
	const language = getLanguageByFileType(fileType);
	if (fileType === FileType.JSON) {
		return [language, urlPlugin];
	}
	if (fileType === FileType.GQ) {
		return [language, autocompletion({ override: [getAutocompleteGqFn(lspWorker)] })];
	}
	throw new Error("Invalid file type");
};
