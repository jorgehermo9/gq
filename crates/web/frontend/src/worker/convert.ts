import FileType from "@/model/file-type";
import init, { convert_to_json, convert_to_yaml, format_query } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
	data: string;
	type: FileType;
}

registerWebworker(async ({ data, type }: Message) => {
	await init();
	switch (type) {
		case FileType.JSON:
			return convert_to_json(data);
		case FileType.YAML:
			return convert_to_yaml(data);
		default:
			throw new Error("Invalid file type");
	}
});
