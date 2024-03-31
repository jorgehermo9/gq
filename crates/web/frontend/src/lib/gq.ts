import init, { gq } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface MessageContent {
	query: string;
	json: string;
}

registerWebworker(async (message: MessageContent) => {
	await init();
	return gq(message.query, message.json)
});
