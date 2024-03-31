import init, { gq } from "gq-web";
import { js_beautify as format } from "js-beautify";
import registerWebworker from "webworker-promise/lib/register";

interface MessageContent {
	query: string;
	json: string;
}

registerWebworker(async (message: MessageContent) => {
	await init();
	return format(gq(message.query, message.json))
});
