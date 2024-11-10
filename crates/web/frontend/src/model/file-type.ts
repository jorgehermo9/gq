enum FileType {
	JSON = "json",
	GQ = "gq",
	YAML = "yaml",
	JINJA = "jinja",
	UNKNOWN = "render",
}

export const getFileExtensions = (fileType: FileType): string[] => {
	switch (fileType) {
		case FileType.JSON:
			return ["json"];
		case FileType.GQ:
			return ["gq"];
		case FileType.YAML:
			return ["yml", "yaml"];
		case FileType.JINJA:
			return ["jinja"];
		case FileType.UNKNOWN:
			return [];
	}
};

export const fromMimeType = (mime: string): FileType => {
	if (mime.startsWith("application/json")) {
		return FileType.JSON;
	}
	if (mime.startsWith("application/yaml")) {
		return FileType.YAML;
	}
	if (mime.startsWith("application/jinja")) {
		return FileType.JINJA;
	}
	if (mime === "") {
		return FileType.GQ;
	}
	throw new Error(`Unexpected file type ${mime}`);
};

export const fromString = (fileType: string): FileType => {
	switch (fileType.toLowerCase()) {
		case FileType.JSON:
			return FileType.JSON;
		case FileType.GQ:
			return FileType.GQ;
		case FileType.YAML:
			return FileType.YAML;
		default:
			throw new Error(`Unexpected file type ${fileType}`);
	}
};

export default FileType;
