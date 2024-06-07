import type { Completion } from "@/model/completion";
import { Data } from "@/model/data";
import type {
	CompletionContext,
	CompletionSource,
} from "@codemirror/autocomplete";
import type PromiseWorker from "webworker-promise";

const triggerBlacklist = new Set(["{"]);

export const getAutocompleteGqFn = (
	lspWorker?: PromiseWorker,
	inputData?: Data
): CompletionSource => {
	return async (context: CompletionContext) => {
		if (!lspWorker) return null;
		if (context.explicit) return null;
		const trigger = context.matchBefore(/./);
		if (!trigger || triggerBlacklist.has(trigger?.text)) return null;
		// TODO: This regex should follow the same rules as the json/yaml keys
		const word = context.matchBefore(/\w*/);
		const completionItems: Completion[] = await lspWorker.postMessage({
			query: context.state.doc.toString(),
			position: trigger?.to,
			trigger: trigger?.text,
			data: inputData
		});
		return {
			from: word ? word.from : context.pos,
			options: completionItems.map((item) => ({
				type: "text",
				apply: item.completion,
				label: item.label,
			})),
		};
	};
};
