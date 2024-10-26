import type FileType from "./file-type";

export type Share = {
	id: string;
	inputContent: string;
	inputType: FileType;
	queryContent: string;
	outputType: FileType;
};

export type ShareCreation = {
	inputContent: string;
	inputType: FileType;
	queryContent: string;
	outputType: FileType;
	expirationTimeSecs: number;
};
