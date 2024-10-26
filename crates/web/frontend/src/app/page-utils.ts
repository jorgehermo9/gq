import { notify } from "@/lib/notify";
import type { Completion } from "@/model/completion";
import { Data } from "@/model/data";
import FileType from "@/model/file-type";
import { getShare } from "@/services/shares/share-service";
import type { CompletionContext, CompletionSource } from "@codemirror/autocomplete";
import type PromiseWorker from "webworker-promise";

export const applyGq = async (
	inputData: Data,
	queryContent: string,
	outputType: FileType,
	indent: number,
	gqWorker: PromiseWorker,
	silent = true,
): Promise<Data> => {
	const result: Data = await gqWorker.postMessage({
		query: queryContent,
		data: inputData,
		outputType: outputType,
		indent: indent,
	});
	!silent && notify.success(`Query applied to ${inputData.type.toUpperCase()}`);
	return result;
};

const triggerBlacklist = new Set<string>(["{", ":", " "]);

export const getQueryCompletionSource = (
	lspWorker?: PromiseWorker,
	inputData?: Data,
): CompletionSource => {
	return async (context: CompletionContext) => {
		if (!lspWorker) return null;
		const trigger = context.matchBefore(/./) || { text: "", from: 0, to: 0 };
		if (!context.explicit && triggerBlacklist.has(trigger.text)) return null;
		// TODO: This regex should follow the same rules as the json/yaml keys
		const word = context.matchBefore(/\w*/);
		const completionItems: Completion[] = await lspWorker.postMessage({
			query: context.state.doc.toString(),
			position: trigger.to,
			trigger: trigger.text,
			data: inputData,
		});
		return {
			from: word ? word.from : context.pos,
			options: completionItems.map((item) => ({
				type: "text",
				label: item.label,
				detail: item.detail,
			})),
		};
	};
};

export const importShare = async (
	shareId: string,
): Promise<{ input: Data; query: Data; outputType: FileType } | undefined> => {
	const toastId = notify.loading("Importing share...");
	try {
		const share = await getShare(shareId);
		notify.success("Share successfully imported", { id: toastId });
		return {
			input: new Data(share.inputContent, share.inputType),
			query: new Data(share.queryContent, FileType.GQ),
			outputType: share.outputType,
		};
	} catch (error) {
		notify.error(`Error importing share: ${error.message}`, { id: toastId });
		return undefined;
	}
};
