import init, { gq } from "gq-web";
import { js_beautify as format } from "js-beautify";
import registerWebworker from "webworker-promise/lib/register";

interface MessageContent {
	query: string;
	json: string;
}

init();

registerWebworker(async (message: MessageContent) => format(gq(message.query, message.json)));
