export type LoadingState = {
	isLoading: boolean;
	message: string;
};

const initialLoadingState: LoadingState = {
	isLoading: false,
	message: "",
};

export const notLoading = (): LoadingState => initialLoadingState;

export const loading = (message: string): LoadingState => ({
	isLoading: true,
	message,
});
