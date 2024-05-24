import FileType from "./file-type";

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
