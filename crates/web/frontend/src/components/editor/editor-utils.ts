import FileType from "@/model/file-type";
import { toast } from "sonner";
import type PromiseWorker from "webworker-promise";
import { json } from "@codemirror/lang-json";
import { LanguageSupport } from "@codemirror/language";
import {
	CompletionContext,
	CompletionResult,
	CompletionSource,
	autocompletion,
} from "@codemirror/autocomplete";
import urlPlugin from "./url-plugin";
import { Extension } from "@uiw/react-codemirror";

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
	} else if (fileType === FileType.GQ) {
		return gqLanguage;
	}
	throw new Error("Invalid file type");
};

export const getExtensionsByFileType = (
	fileType: FileType,
	autocompleteFn: CompletionSource,
): Extension[] => {
	const language = getLanguageByFileType(fileType);
	if (fileType === FileType.JSON) {
		return [language, urlPlugin];
	} else if (fileType === FileType.GQ) {
		return [language, autocompletion({ override: [autocompleteFn] })];
	}
	throw new Error("Invalid file type");
};
