export type ShortcutSection = {
	title: string;
	shortcuts: Shortcut[];
};

export type Shortcut = {
	description: string;
	shortcut: string;
};

const globalShortcuts: Shortcut[] = [
	{
		description: "Apply the current query",
		shortcut: "Alt + Enter",
	},
];

const editorShortcuts: Shortcut[] = [
	{
		description: "Show autocompletions",
		shortcut: "Ctrl + .",
	},
	{
		description: "Format the content of the focused editor",
		shortcut: "Ctrl + S",
	},
];

export const shortcutSections: ShortcutSection[] = [
	{
		title: "Global Scope",
		shortcuts: globalShortcuts,
	},
	{
		title: "Editor Scope",
		shortcuts: editorShortcuts,
	},
];
