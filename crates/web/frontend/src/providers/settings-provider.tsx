"use client";

import { type Settings, getDefaultSettings } from "@/model/settings";
import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useContext,
	useEffect,
	useRef,
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
	const [settings, setSettings] = useState<Settings>(getDefaultSettings());
	const isRendered = useRef(false);

	useEffect(() => {
		const storedSettings = localStorage.getItem("settings");
		storedSettings && setSettings(JSON.parse(storedSettings));
	}, []);

	useEffect(() => {
		if (isRendered.current) {
			localStorage.setItem("settings", JSON.stringify(settings));
		}
		isRendered.current = true;
	}, [settings]);

	return (
		<SettingsContext.Provider value={{ settings, setSettings }}>
			{children}
		</SettingsContext.Provider>
	);
};
