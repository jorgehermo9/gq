import init, { gq } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
	query: string;
	json: string;
	indent: number;
}

registerWebworker(async ({ query, json, indent }: Message) => {
	await init();
	return gq(query, json, indent);
});
