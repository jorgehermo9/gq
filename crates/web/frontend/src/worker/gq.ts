import type { Data } from "@/model/data";
import type FileType from "@/model/file-type";
import { getDataType } from "@/model/file-type";
import init, { gq } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
	query: Data;
	data: Data;
	outputType: FileType;
	indent: number;
}

registerWebworker(async ({ query, data, outputType, indent }: Message) => {
	await init();
	return gq(
		query.content,
		data.content,
		getDataType(data.type),
		getDataType(outputType),
		indent,
	);
});
