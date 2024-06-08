import type { Data } from "@/model/data";
import FileType from "@/model/file-type";
import {
	CompletionSection,
	type CompletionSource,
	acceptCompletion,
	autocompletion,
	closeCompletion,
	completionKeymap,
	startCompletion,
} from "@codemirror/autocomplete";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import type { LanguageSupport } from "@codemirror/language";
import { type Extension, Prec, keymap } from "@uiw/react-codemirror";
import { toast } from "sonner";
import type PromiseWorker from "webworker-promise";
import { getAutocompleteGqFn } from "./editor-completions";
import urlPlugin from "./url-plugin";

export const exportFile = (data: Data, fileName: string) => {
	const blob = new Blob([data.content], { type: `application/${data.type}` });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${fileName}.${data.type}`;
	a.click();
	URL.revokeObjectURL(url);
	toast.success("File exported succesfully!");
};

export const copyToClipboard = (data: Data) => {
	navigator.clipboard.writeText(data.content);
	toast.success("Copied to your clipboard!");
};

export const formatCode = async (
	data: Data,
	indent: number,
	formatWorker: PromiseWorker,
	silent = true,
): Promise<Data> => {
	const toastId = silent ? undefined : toast.loading("Formatting code...");
	try {
		const response = await formatWorker.postMessage({
			data: data,
			indent: indent,
		});
		!silent && toast.success("Code formatted!", { id: toastId });
		return response;
	} catch (err) {
		!silent && toast.error(err.message, { id: toastId, duration: 5000 });
		throw err;
	}
};

export const convertCode = async (
	data: Data,
	outputType: FileType,
	indent: number,
	convertWorker: PromiseWorker,
	silent = true,
): Promise<Data> => {
	const toastId = silent ? undefined : toast.loading("Converting code...");
	try {
		const result: Data = await convertWorker.postMessage({
			data: data,
			outputType: outputType,
			indent: indent,
		});
		!silent && toast.success("Code converted!", { id: toastId });
		return result;
	} catch (err) {
		!silent && toast.error(err.message, { id: toastId, duration: 5000 });
		throw err;
	}
};

const jsonLanguage = json();
const gqLanguage = json();
const yamlLanguage = yaml();

const getCodemirrorLanguageByFileType = (
	fileType: FileType,
): LanguageSupport => {
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

export const getCodemirrorExtensionsByFileType = (
	fileType: FileType,
	completionSource?: CompletionSource,
): Extension[] => {
	console.log("Calling");
	const language = getCodemirrorLanguageByFileType(fileType);
	switch (fileType) {
		case FileType.JSON:
			return [language, urlPlugin];
		case FileType.GQ:
			return [
				language,
				autocompletion({
					override: completionSource && [completionSource],
					tooltipClass: () =>
						"rounded-sm overflow-hidden !bg-muted-transparent !text-foreground",
					// TODO: Fix this
					optionClass: () => "!aria[selected=true]:bg-accent",
					closeOnBlur: true,
					defaultKeymap: true,
				}),
				Prec.highest(keymap.of([{ key: "Tab", run: acceptCompletion }])),
			];
		case FileType.YAML:
			return [language, urlPlugin];
		default:
			throw new Error("Invalid file type");
	}
};
