import { type ExternalToast, toast } from "sonner";

const loading = (message: string | React.ReactNode, data?: ExternalToast): string | number => {
	return toast.loading(message, data);
};

const success = (message: string | React.ReactNode, data?: ExternalToast): string | number => {
	return toast.success(message, { ...data, duration: 2000 });
};

const info = (message: string | React.ReactNode, data?: ExternalToast): string | number => {
	return toast.info(message, { ...data, duration: 2000 });
};

const error = (message: string | React.ReactNode, data?: ExternalToast): string | number => {
	return toast.error(message, { ...data, duration: 5000 });
};

export const notify = {
	loading,
	success,
	info,
	error,
};
