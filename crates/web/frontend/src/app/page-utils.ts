import type { Completion } from "@/model/completion";
import { Data } from "@/model/data";
import FileType from "@/model/file-type";
import { getShare } from "@/service/share-service";
import type { CompletionContext, CompletionSource } from "@codemirror/autocomplete";
import { toast } from "sonner";
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
	!silent && toast.success(`Query applied to ${inputData.type.toUpperCase()}`);
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

export const importShare = async (shareId: string): Promise<{ input: Data; query: Data }> => {
	const toastId = toast.loading("Importing share...");
	try {
		const share = await getShare(shareId);
		toast.success("Share successfully imported", { id: toastId });
		return Promise.resolve({
			input: new Data(share.json, FileType.JSON),
			query: new Data(share.query, FileType.GQ),
		});
	} catch (error) {
		toast.error(`Error importing share: ${error.message}`, { id: toastId, duration: 5000 });
		return Promise.reject(error);
	}
};
