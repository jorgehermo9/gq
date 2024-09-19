import { JsData } from "gq-web";
import FileType, { fileTypeToModel } from "./file-type";

export class Data {
	content: string;
	type: FileType;

	constructor(content: string, type: FileType) {
		this.content = content;
		this.type = type;
	}
}

export const dataToModel = (dto: JsData): Data => {
	return new Data(dto.payload, fileTypeToModel(dto.data_type));
};

export const dataToDTO = (data: Data): JsData => {
	switch (data.type) {
		case FileType.JSON:
			return JsData.json(data.content.trim() || "{}");
		case FileType.YAML:
			return JsData.yaml(data.content);
		default:
			throw new Error("Invalid file type");
	}
};
