import { type ExternalToast, toast } from "sonner";
import { ERROR_DURATION, INFO_DURATION, SUCCESS_DURATION } from "./constants";

const loading = (message: string | React.ReactNode, data?: ExternalToast): string | number => {
	return toast.loading(message, data);
};

const success = (message: string | React.ReactNode, data?: ExternalToast): string | number => {
	return toast.success(message, { ...data, duration: SUCCESS_DURATION });
};

const info = (message: string | React.ReactNode, data?: ExternalToast): string | number => {
	return toast.info(message, { ...data, duration: INFO_DURATION });
};

const error = (message: string | React.ReactNode, data?: ExternalToast): string | number => {
	return toast.error(message, { ...data, duration: ERROR_DURATION });
};

export const notify = {
	loading,
	success,
	info,
	error,
};
