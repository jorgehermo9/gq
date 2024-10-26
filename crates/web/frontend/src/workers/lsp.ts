import type { Completion } from "@/model/completion";
import type { Data } from "@/model/data";
import init, { completions, type JsCompletionItem } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";
import { dataToDto } from "./dtos/data-dto";

interface Message {
	query: string;
	position: number;
	trigger: string;
	data: Data;
}

registerWebworker(async ({ query, position, trigger, data }: Message) => {
	await init();
	const completion = completions(query, position, trigger, dataToDto(data));
	return completion.map((item: JsCompletionItem) => ({
		label: item.label,
		detail: item.detail,
	})) as Completion[];
});
