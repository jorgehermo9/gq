import registerWebworker from "webworker-promise/lib/register";
import init, { format_json, format_query } from "gq-web";
import FileType from "@/model/file-type";

interface Message {
	data: string;
	indent: number;
	type: FileType;
}

registerWebworker(async ({ data, indent, type }: Message) => {
	await init();
	if (type === FileType.JSON) {
		return format_json(data, indent);
	} else if (type === FileType.GQ) {
		return format_query(data, indent);
	} else {
		throw new Error("Invalid file type");
	}
});
