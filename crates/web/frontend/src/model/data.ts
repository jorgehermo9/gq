import { JsData } from "gq-web";
import FileType, { fileTypeToDTO, fileTypeToModel } from "./file-type";

export type Data = {
	content: string;
	type: FileType;
};

export const empty = (fileType: FileType): Data => {
	switch (fileType) {
		case FileType.JSON:
			return {
				content: "{}",
				type: fileType,
			};
		case FileType.GQ:
			return {
				content: "",
				type: fileType,
			};
		case FileType.YAML:
			return {
				content: "",
				type: fileType,
			};
	}
};

export const dataToModel = (dto: JsData): Data => {
	return {
		content: dto.payload,
		type: fileTypeToModel(dto.data_type)
	}
}

export const dataToDTO = (data: Data): JsData => {
	switch (data.type) {
		case FileType.JSON:
			return JsData.json(data.content);
		case FileType.YAML:
			return JsData.yaml(data.content);
		default:
			throw new Error("Invalid file type");
	}
}
