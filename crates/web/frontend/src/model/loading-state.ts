export type LoadingState = {
	isLoading: boolean;
	message: string;
};

export const initLoadingState: LoadingState = {
	isLoading: false,
	message: "",
};
