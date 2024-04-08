export type Settings = {
	autoApplySettings: AutoApplySettings;
	formattingSettings: FormattingSettings;
};

export type AutoApplySettings = {
	autoApply: boolean;
	debounceTime: number;
};

export type FormattingSettings = {
	jsonTabSize: number;
	queryTabSize: number;
};

export const setAutoApply = (
	settings: Settings,
	autoApply: boolean,
): Settings => {
	return {
		...settings,
		autoApplySettings: {
			...settings.autoApplySettings,
			autoApply,
		},
	};
};

export const setDebounceTime = (
	settings: Settings,
	debounceTime: number,
): Settings => {
	return {
		...settings,
		autoApplySettings: {
			...settings.autoApplySettings,
			debounceTime,
		},
	};
};

export const setJsonTabSize = (
	settings: Settings,
	jsonTabSize: number,
): Settings => {
	return {
		...settings,
		formattingSettings: {
			...settings.formattingSettings,
			jsonTabSize,
		},
	};
};

export const setQueryTabSize = (
	settings: Settings,
	queryTabSize: number,
): Settings => {
	return {
		...settings,
		formattingSettings: {
			...settings.formattingSettings,
			queryTabSize,
		},
	};
};
