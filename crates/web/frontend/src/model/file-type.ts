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
			return ["yaml", "yml"];
	}
}

export default FileType;
