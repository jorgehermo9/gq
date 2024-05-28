import { type Data, dataToDTO, dataToModel } from "@/model/data";
import FileType, { fileTypeToDTO } from "@/model/file-type";
import init, { format_data, format_query } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
	data: Data;
	indent: number;
}

registerWebworker(async ({ data, indent }: Message): Promise<Data> => {
	await init();
	switch (data.type) {
		case FileType.JSON:
		case FileType.YAML: {
			const result = format_data(dataToDTO(data), indent);
			return dataToModel(result);
		}
		case FileType.GQ: {
			const result = format_query(data.content, indent);
			return {
				content: result,
				type: FileType.GQ,
			};
		}
		default:
			throw new Error("Invalid file type");
	}
});
