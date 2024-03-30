import init, { gq } from "gq-web";
import { js_beautify as format } from "js-beautify";

interface MessageContent {
	query: string;
	json: string;
}

init();

addEventListener("message", (event: MessageEvent<MessageContent>) => {
	console.log("Executing query...")
	postMessage(format(gq(event.data.query, event.data.json)));
});
