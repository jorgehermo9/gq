import FileType from "@/model/file-type";

export const fileTypeToDto = (fileType: FileType): "JSON" | "YAML" => {
	switch (fileType) {
		case FileType.JSON:
			return "JSON";
		case FileType.YAML:
			return "YAML";
		default:
			throw new Error("Unexpected data file type");
	}
};
