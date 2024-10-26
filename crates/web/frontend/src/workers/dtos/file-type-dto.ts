import FileType from "@/model/file-type";
import { JsDataType } from "gq-web";

export const fileTypeToDto = (fileType: FileType): JsDataType => {
	switch (fileType) {
		case FileType.JSON:
			return JsDataType.Json;
		case FileType.YAML:
			return JsDataType.Yaml;
		default:
			throw new Error("Invalid data file type");
	}
};

export const fileTypeToModel = (dto: JsDataType) => {
	switch (dto) {
		case JsDataType.Json:
			return FileType.JSON;
		case JsDataType.Yaml:
			return FileType.YAML;
		default:
			throw new Error("Invalid dto file type");
	}
};
