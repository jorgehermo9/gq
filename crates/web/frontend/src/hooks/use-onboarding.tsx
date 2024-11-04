import OnboardingPopup from "@/components/onboarding-popup/onboarding-popup";
import { useCallback, useEffect, useState } from "react";

export const useOnboarding = () => {
	const [visible, setVisible] = useState(false);

	const dismiss = useCallback(() => {
		if (!visible) return;
		setVisible(false);
		localStorage.setItem("onboarding", "done");
	}, [visible]);

	useEffect(() => {
		localStorage.getItem("onboarding") === "done" || setVisible(true);
	}, []);

	const OnboardingComponent = ({ className }: { className?: string }) => (
		<OnboardingPopup className={className} visible={visible} onClose={dismiss} />
	);

	return [OnboardingComponent, visible, dismiss] as const;
};
