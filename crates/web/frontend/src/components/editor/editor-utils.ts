import { notify } from "@/lib/notify";
import { isMac } from "@/lib/utils";
import type { Data } from "@/model/data";
import FileType from "@/model/file-type";
import {
	type CompletionSource,
	acceptCompletion,
	autocompletion,
	startCompletion,
} from "@codemirror/autocomplete";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import {
	LRLanguage,
	LanguageSupport,
	StreamLanguage,
	continuedIndent,
	foldInside,
	foldNodeProp,
	indentNodeProp,
} from "@codemirror/language";
import { jinja2 } from "@codemirror/legacy-modes/mode/jinja2";
import { parser } from "@lezer/json";
import { EditorView, type Extension, Prec, keymap } from "@uiw/react-codemirror";
import type PromiseWorker from "webworker-promise";
import { validateFile } from "../import-popup/import-utils";
import urlPlugin from "./url-plugin";

export const exportFile = (data: Data, filename: string) => {
	const blob = new Blob([data.content], { type: `application/${data.type}` });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${filename}${data.type === FileType.UNKNOWN ? "" : data.type}`;
	a.click();
	URL.revokeObjectURL(url);
	notify.success("File exported successfully!");
};

export const formatCode = async (
	data: Data,
	indent: number,
	formatWorker: PromiseWorker,
	silent = true,
): Promise<Data> => {
	const toastId = silent ? undefined : notify.loading("Formatting code...");
	try {
		const response: Data = await formatWorker.postMessage({ data, indent });
		!silent && notify.success("Code formatted!", { id: toastId });
		return response;
	} catch (err) {
		!silent && notify.error(err.message, { id: toastId });
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
	const toastId = silent ? undefined : notify.loading("Converting code...");
	try {
		const result: Data = await convertWorker.postMessage({ data, outputType, indent });
		!silent && notify.success("Code converted!", { id: toastId });
		return result;
	} catch (err) {
		!silent && notify.error(err.message, { id: toastId });
		throw err;
	}
};

const gqLanguageParser = LRLanguage.define({
	name: "gq",
	parser: parser.configure({
		props: [
			indentNodeProp.add({
				Object: continuedIndent({ except: /^\s*\}/ }),
				Array: continuedIndent({ except: /^\s*\]/ }),
			}),
			foldNodeProp.add({
				"Object Array": foldInside,
			}),
		],
	}),
	languageData: {
		closeBrackets: { brackets: ["[", "{", '"', "("] },
		indentOnInput: /^\s*[\}\]]$/,
	},
});

const jsonLanguage = json();
const gqLanguage = new LanguageSupport(gqLanguageParser);
const yamlLanguage = yaml();
const jinjaLanguage = StreamLanguage.define(jinja2);
const modKey = isMac ? "Cmd" : "Ctrl";

const getCodemirrorLanguageByFileType = (
	fileType: FileType,
): LanguageSupport | StreamLanguage<unknown> | undefined => {
	switch (fileType) {
		case FileType.JSON:
			return jsonLanguage;
		case FileType.GQ:
			return gqLanguage;
		case FileType.YAML:
			return yamlLanguage;
		case FileType.JINJA:
			return jinjaLanguage;
		default:
			return undefined;
	}
};

const getDragAndDropExtension = (importableTypes: FileType[]) =>
	EditorView.domEventHandlers({
		drop(e, _) {
			const file = e.dataTransfer?.files[0];
			validateFile(file, importableTypes, undefined, () => e.preventDefault());
		},
	});

export const getCodemirrorExtensionsByFileType = (
	fileType: FileType,
	completionSource?: CompletionSource,
): Extension[] => {
	const language = getCodemirrorLanguageByFileType(fileType);
	if (!language) {
		return [];
	}
	switch (fileType) {
		case FileType.JSON:
		case FileType.YAML:
			return [
				language,
				urlPlugin,
				Prec.highest(keymap.of([{ key: `${modKey}-Enter`, run: () => true }])),
				getDragAndDropExtension([FileType.JSON, FileType.YAML]),
			];
		case FileType.JINJA:
			return [
				language,
				Prec.highest(keymap.of([{ key: `${modKey}-Enter`, run: () => true }])),
				getDragAndDropExtension([FileType.JINJA]),
			];
		case FileType.GQ:
			return [
				language,
				autocompletion({
					override: completionSource && [completionSource],
					tooltipClass: () => "rounded-sm overflow-hidden !bg-muted-transparent !text-foreground",
					closeOnBlur: false,
					defaultKeymap: true,
				}),
				Prec.highest(
					keymap.of([
						{ key: "Tab", run: acceptCompletion },
						{ key: `${modKey}-.`, run: startCompletion },
						{ key: `${modKey}-Enter`, run: () => true },
					]),
				),
				getDragAndDropExtension([FileType.GQ]),
			];
		default:
			return [];
	}
};
