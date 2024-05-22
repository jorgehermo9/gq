import { Completion } from "@/model/completion";
import init, { completions, JsCompletionItem } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
	query: string;
	position: number;
	trigger: string;
}

registerWebworker(async ({ query, position, trigger }: Message) => {
	await init();
	const completion = completions(query, position, trigger);
	return completion.map((item: JsCompletionItem) => ({
		completion: item.completion,
		label: item.label,
		detail: item.detail,
		from: item.from,
		to: item.to,
	})) as Completion[];
});
