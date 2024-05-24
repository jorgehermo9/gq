import type { Data } from "@/model/data";
import FileType, { getDataType } from "@/model/file-type";
import init, { format_data, format_query } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
	data: Data;
	indent: number;
}

registerWebworker(async ({ data, indent }: Message) => {
	await init();
	switch (data.type) {
		case FileType.JSON || FileType.YAML:
			return format_data(data.content, getDataType(data.type), indent);
		case FileType.GQ:
			return format_query(data.content, indent);
		default:
			throw new Error("Invalid file type");
	}
});
