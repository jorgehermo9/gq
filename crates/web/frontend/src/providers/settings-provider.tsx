"use client";

import { Settings } from "@/model/settings";
import { createContext, useContext, useState } from "react";

export const SettingsContext = createContext<
  | {
      settings: Settings;
      setSettings: (settings: Settings) => void;
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
    autoApply: true,
    debounceTime: 1000,
    jsonTabSize: 2,
    queryTabSize: 2,
  });

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
