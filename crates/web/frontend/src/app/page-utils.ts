import type { Completion } from "@/model/completion";
import type { Data } from "@/model/data";
import type FileType from "@/model/file-type";
import type {
	CompletionContext,
	CompletionSource,
} from "@codemirror/autocomplete";
import { toast } from "sonner";
import type PromiseWorker from "webworker-promise";

export interface LoadingState {
	isLoading: boolean;
	message: string;
}

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

const triggerBlacklist = new Set(["{", ":"]);

export const getQueryCompletionSource = (
	lspWorker?: PromiseWorker,
	inputData?: Data,
): CompletionSource => {
	return async (context: CompletionContext) => {
		if (!lspWorker) return null;
		const trigger = context.matchBefore(/./);
		if (!trigger || triggerBlacklist.has(trigger.text)) return null;
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
