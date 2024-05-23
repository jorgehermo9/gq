import type FileType from "@/model/file-type";
import init, { format_json, format_query } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
	data: string;
	from: FileType;
	to: FileType;
}

registerWebworker(async ({ data, from, to }: Message) => {
	await init();
	return data;
});
