import type { Completion } from "@/model/completion";
import type {
	CompletionContext,
	CompletionSource,
} from "@codemirror/autocomplete";
import type PromiseWorker from "webworker-promise";

type MatchResult = {
	from: number;
	to: number;
	text: string;
};

export const getAutocompleteGqFn = (
	lspWorker: PromiseWorker | undefined,
): CompletionSource => {
	return async (context: CompletionContext) => {
		if (!lspWorker) return null;
		if (context.explicit) return null;
		// biome-ignore lint/style/noNonNullAssertion: this will never happen since we are ommiting the explicit check
		const trigger: MatchResult = context.matchBefore(/./)!;
		// biome-ignore lint/style/noNonNullAssertion: this will never happen since we are ommiting the explicit check
		const word: MatchResult = context.matchBefore(/\w*/)!;
		const completionItems: Completion[] = await lspWorker.postMessage({
			query: context.state.doc.toString(),
			position: trigger.from,
			trigger: trigger.text,
		});
		console.log(trigger);
		return {
			from: word.from,
			options: completionItems.map((item) => ({
				type: "text",
				apply: item.completion,
				label: item.label,
			})),
		};
	};
};
