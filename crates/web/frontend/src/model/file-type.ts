import { JsDataType } from "gq-web";

enum FileType {
	JSON = "json",
	GQ = "gq",
	YAML = "yaml",
}

export const getFileExtensions = (fileType: FileType): string[] => {
	switch (fileType) {
		case FileType.JSON:
			return ["json"];
		case FileType.GQ:
			return ["gq"];
		case FileType.YAML:
			return ["yml", "yaml"];
	}
};

export const getDataType = (fileType: FileType): JsDataType => {
	switch (fileType) {
		case FileType.JSON:
			return JsDataType.Json;
		case FileType.YAML:
			return JsDataType.Yaml;
		default:
			throw new Error("Invalid data file type");
	}
};

export default FileType;
