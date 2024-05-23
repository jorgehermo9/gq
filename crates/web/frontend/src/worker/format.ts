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
	switch (type) {
		case FileType.JSON:
			return format_json(data, indent);
		case FileType.YAML:
			// TODO: Implement YAML formatting
			return data;
		case FileType.GQ:
			return format_query(data, indent);
		default:
			throw new Error("Invalid file type");
	}
});
