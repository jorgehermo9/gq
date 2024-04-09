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

const getDefaultSettings = (): Settings => {
	return {
		autoApplySettings: {
			autoApply: true,
			debounceTime: 1000,
		},
		formattingSettings: {
			jsonTabSize: 2,
			queryTabSize: 2,
		},
	};
};

const setAutoApply = (settings: Settings, autoApply: boolean): Settings => {
	return {
		...settings,
		autoApplySettings: {
			...settings.autoApplySettings,
			autoApply,
		},
	};
};

const setDebounceTime = (
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

const setJsonTabSize = (settings: Settings, jsonTabSize: number): Settings => {
	return {
		...settings,
		formattingSettings: {
			...settings.formattingSettings,
			jsonTabSize,
		},
	};
};

const setQueryTabSize = (
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

export {
	getDefaultSettings,
	setAutoApply,
	setDebounceTime,
	setJsonTabSize,
	setQueryTabSize,
};
