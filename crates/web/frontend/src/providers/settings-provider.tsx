"use client";

import type { Settings } from "@/model/settings";
import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useContext,
	useState,
} from "react";

export const SettingsContext = createContext<
	| {
			settings: Settings;
			setSettings: Dispatch<SetStateAction<Settings>>;
	  }
	| undefined
>(undefined);

export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (context === undefined) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
};

interface Props {
	children: React.ReactNode;
}

export const SettingsProvider = ({ children }: Props) => {
	const [settings, setSettings] = useState<Settings>({
		autoApplySettings: {
			autoApply: true,
			debounceTime: 1000,
		},
		formattingSettings: {
			jsonTabSize: 2,
			queryTabSize: 2,
		},
	});

	return (
		<SettingsContext.Provider value={{ settings, setSettings }}>
			{children}
		</SettingsContext.Provider>
	);
};
