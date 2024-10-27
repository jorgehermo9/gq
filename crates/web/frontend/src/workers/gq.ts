import type { Data } from "@/model/data";
import type FileType from "@/model/file-type";
import init, { type JsData, gq } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";
import { dataToDto, dataToModel } from "./dtos/data-dto";
import { fileTypeToDto } from "./dtos/file-type-dto";

interface Message {
	query: string;
	data: Data;
	outputType: FileType;
	indent: number;
}

registerWebworker(async ({ query, data, outputType, indent }: Message): Promise<Data> => {
	await init();
	const result: JsData = gq(query, dataToDto(data), fileTypeToDto(outputType), indent);
	return dataToModel(result);
});
