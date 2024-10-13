export type ExpirationTime = "1 hour" | "1 day" | "1 week";

export const toSeconds = (expirationTime: ExpirationTime): number => {
	switch (expirationTime) {
		case "1 hour":
			return 3600;
		case "1 day":
			return 86400;
		case "1 week":
			return 604800;
	}
};
