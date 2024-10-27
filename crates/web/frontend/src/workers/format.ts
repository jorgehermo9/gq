import { Data } from "@/model/data";
import FileType from "@/model/file-type";
import init, { format_data, format_query } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";
import { dataToDto, dataToModel } from "./dtos/data-dto";

interface Message {
	data: Data;
	indent: number;
}

registerWebworker(async ({ data, indent }: Message): Promise<Data> => {
	await init();
	switch (data.type) {
		case FileType.JSON:
		case FileType.YAML: {
			const result = format_data(dataToDto(data), indent);
			return dataToModel(result);
		}
		case FileType.GQ: {
			const result = format_query(data.content, indent);
			return new Data(result, FileType.GQ);
		}
		default:
			throw new Error("Invalid file type");
	}
});
