import type { Data } from "@/model/data";
import type FileType from "@/model/file-type";
import { getDataType } from "@/model/file-type";
import init, { convert_data_to } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
	data: Data;
	outputType: FileType;
	indent: number;
}

registerWebworker(async ({ data, outputType, indent }: Message) => {
	await init();
	return convert_data_to(
		data.content,
		getDataType(data.type),
		getDataType(outputType),
		indent,
	);
});
