import type FileType from "./file-type";

export class Data {
	content: string;
	type: FileType;

	constructor(content: string, type: FileType) {
		this.content = content;
		this.type = type;
	}
}
