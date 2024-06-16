import { cn } from "@/lib/utils";
import styles from "./onboarding-popup.module.css";
import { Stars, X } from "lucide-react";

interface Props {
	className?: string;
	visible: boolean;
	onClose: () => void;
}

const OnboardingPopup = ({ className, visible, onClose }: Props) => {
	return (
		<div
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
			data-visible={visible}
			className={cn(className, styles.popupContainer)}
		>
			<div className="absolute z-10 bottom-full h-4 w-[1px] bg-accent left-5" />
			<div className="flex items-center gap-2 mb-2">
				<Stars className="h-4 w-4" />
				<h3 className="font-semibold text-md">New to GQ?</h3>
			</div>
			<span className="text-sm">
				You can check some examples here as your starting point to discover all the features!
			</span>
			<X className="absolute top-2 right-2 h-4 w-4 cursor-pointer" onClick={onClose} />
		</div>
	);
};

export default OnboardingPopup;
