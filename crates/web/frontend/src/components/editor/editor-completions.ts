import type { Completion } from "@/model/completion";
import type {
	CompletionContext,
	CompletionSource,
} from "@codemirror/autocomplete";
import type PromiseWorker from "webworker-promise";

export const getAutocompleteGqFn = (
	lspWorker: PromiseWorker | undefined,
): CompletionSource => {
	return async (context: CompletionContext) => {
		if (!lspWorker) return null;
		if (context.explicit) return null;
		const trigger = context.matchBefore(/./);
		// TODO: This regex should follow the same rules as the json/yaml keys
		const word = context.matchBefore(/\w*/);
		const completionItems: Completion[] = await lspWorker.postMessage({
			query: context.state.doc.toString(),
			position: trigger?.from,
			trigger: trigger?.text,
		});
		console.log(trigger);
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
