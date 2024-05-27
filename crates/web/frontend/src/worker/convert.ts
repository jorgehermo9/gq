import { dataToDTO, dataToModel, type Data } from "@/model/data";
import type FileType from "@/model/file-type";
import { fileTypeToDTO } from "@/model/file-type";
import init, { convert_data_to } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
	data: Data;
	outputType: FileType;
	indent: number;
}

registerWebworker(async ({ data, outputType, indent }: Message): Promise<Data> => {
	await init();
	const result = convert_data_to(
		dataToDTO(data),
		fileTypeToDTO(outputType),
		indent
	);
	return dataToModel(result);
});
