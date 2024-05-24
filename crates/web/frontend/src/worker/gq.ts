import type { Data } from "@/model/data";
import type FileType from "@/model/file-type";
import { getDataType } from "@/model/file-type";
import init, { gq } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
	query: string;
	data: Data;
	outputFileType: FileType;
	indent: number;
}

registerWebworker(async ({ query, data, outputFileType, indent }: Message) => {
	await init();
	return gq(query, data.content, getDataType(data.type), getDataType(outputFileType), indent);
});
