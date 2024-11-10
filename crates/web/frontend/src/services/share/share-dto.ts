import { fromString } from "@/model/file-type";
import type { Share, ShareCreation } from "@/model/share";
import { z } from "zod";
import { fileTypeToDto } from "./file-type-dto";

export const ShareDtoSchema = z.object({
	id: z.string().uuid(),
	inputData: z.string(),
	inputType: z.enum(["JSON", "YAML"]),
	query: z.string(),
	outputType: z.enum(["JSON", "YAML"]),
});
export type ShareDto = z.infer<typeof ShareDtoSchema>;

export const ShareCreationDtoSchema = z.object({
	inputData: z.string(),
	inputType: z.enum(["JSON", "YAML"]),
	query: z.string(),
	outputType: z.enum(["JSON", "YAML"]),
	expirationTimeSecs: z.number(),
});
export type ShareCreationDto = z.infer<typeof ShareCreationDtoSchema>;

export const shareDtoToModel = (dto: ShareDto): Share => ({
	id: dto.id,
	inputContent: dto.inputData,
	inputType: fromString(dto.inputType),
	queryContent: dto.query,
	outputType: fromString(dto.outputType),
});

export const shareCreationToDto = (shareCreation: ShareCreation): ShareCreationDto => ({
	inputData: shareCreation.inputContent,
	inputType: fileTypeToDto(shareCreation.inputType),
	query: shareCreation.queryContent,
	outputType: fileTypeToDto(shareCreation.outputType),
	expirationTimeSecs: shareCreation.expirationTimeSecs,
});
