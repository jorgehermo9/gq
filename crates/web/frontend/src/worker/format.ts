import FileType from "@/model/file-type";
import init, { format_json, format_query } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
	data: string;
	indent: number;
	type: FileType;
}

registerWebworker(async ({ data, indent, type }: Message) => {
	await init();
	if (type === FileType.JSON) {
		return format_json(data, indent);
	}
	if (type === FileType.GQ) {
		return format_query(data, indent);
	}
	throw new Error("Invalid file type");
});
