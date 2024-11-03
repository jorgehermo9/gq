import { Braces, Globe } from "lucide-react";

export type ShortcutSection = {
	title: string;
	icon: React.ReactNode;
	shortcuts: Shortcut[];
};

export type Shortcut = {
	description: string;
	shortcut: string;
};

const globalShortcuts = (isMac: boolean) => [
	{
		description: "Apply the current query",
		shortcut: `${isMac ? "⌘" : "Ctrl"} + Enter`,
	},
	{
		description: "Toggle the left sidebar",
		shortcut: `${isMac ? "⌘" : "Ctrl"} + B`,
	},
];

const editorShortcuts = (isMac: boolean) => [
	{
		description: "Show autocompletions",
		shortcut: `${isMac ? "⌘" : "Ctrl"} + .`,
	},
	{
		description: "Format the content of the focused editor",
		shortcut: `${isMac ? "⌘" : "Ctrl"} + S`,
	},
];

export const shortcutSections = (isMac: boolean): ShortcutSection[] => [
	{
		title: "Global Scope",
		icon: <Globe className="w-3.5 h-3.5" />,
		shortcuts: globalShortcuts(isMac),
	},
	{
		title: "Editor Scope",
		icon: <Braces className="w-3.5 h-3.5" />,
		shortcuts: editorShortcuts(isMac),
	},
];
