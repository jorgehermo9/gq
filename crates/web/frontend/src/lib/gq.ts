import init, { gq } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface MessageContent {
	query: string;
	json: string;
	indent: number;
}

registerWebworker(async ({ query, json, indent }: MessageContent) => {
	await init();
	return gq(query, json, indent)
});
