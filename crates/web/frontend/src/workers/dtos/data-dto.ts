import { Data } from "@/model/data";
import FileType from "@/model/file-type";
import { JsData } from "gq-web";
import { fileTypeToModel } from "./file-type-dto";

export const dataToModel = (dto: JsData): Data => {
	return new Data(dto.payload, fileTypeToModel(dto.data_type));
};

export const dataToDto = (data: Data): JsData => {
	switch (data.type) {
		case FileType.JSON:
			return JsData.json(data.content.trim() || "{}");
		case FileType.YAML:
			return JsData.yaml(data.content);
		default:
			throw new Error("Invalid file type");
	}
};
