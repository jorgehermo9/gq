import { cn } from "@/lib/utils";
import { Stars, X } from "lucide-react";
import styles from "./onboarding-popup.module.css";

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
			<div className="flex items-center gap-2 mb-2">
				<Stars className="h-3.5 w-3.5" />
				<h4>New to GQ?</h4>
			</div>
			<p className="text-wrap text-start">
				You can check some examples here as your starting point to discover all the features!
			</p>
			<X className="absolute top-2 right-2 h-3 w-3 cursor-pointer" onClick={onClose} />
		</div>
	);
};

export default OnboardingPopup;
