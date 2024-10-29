export type ShortcutSection = {
	title: string;
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
		shortcuts: globalShortcuts(isMac),
	},
	{
		title: "Editor Scope",
		shortcuts: editorShortcuts(isMac),
	},
];
