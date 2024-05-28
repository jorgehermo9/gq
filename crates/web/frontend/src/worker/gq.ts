import { type Data, dataToDTO, dataToModel } from "@/model/data";
import type FileType from "@/model/file-type";
import { fileTypeToDTO } from "@/model/file-type";
import init, { type JsData, gq } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
	query: Data;
	data: Data;
	outputType: FileType;
	indent: number;
}

registerWebworker(
	async ({ query, data, outputType, indent }: Message): Promise<Data> => {
		await init();
		const result: JsData = gq(
			query.content,
			dataToDTO(data),
			fileTypeToDTO(outputType),
			indent,
		);
		return dataToModel(result);
	},
);
