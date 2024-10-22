export class ShareTooLargeError extends Error {
	constructor() {
		super("The playground content is larger than the maximum allowed size (2MB)");
	}
}
