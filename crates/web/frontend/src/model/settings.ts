export type Settings = {
	autoApplySettings: AutoApplySettings;
	formattingSettings: FormattingSettings;
};

export type AutoApplySettings = {
	autoApply: boolean;
	debounceTime: number;
};

export type FormattingSettings = {
	formatOnImport: boolean;
	dataTabSize: number;
	queryTabSize: number;
};

const getDefaultSettings = (): Settings => {
	return {
		autoApplySettings: {
			autoApply: true,
			debounceTime: 1000,
		},
		formattingSettings: {
			formatOnImport: true,
			dataTabSize: 2,
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

const setFormatOnImport = (
	settings: Settings,
	formatOnImport: boolean,
): Settings => {
	return {
		...settings,
		formattingSettings: {
			...settings.formattingSettings,
			formatOnImport,
		},
	};
};

const setDataTabSize = (settings: Settings, dataTabSize: number): Settings => {
	return {
		...settings,
		formattingSettings: {
			...settings.formattingSettings,
			dataTabSize: dataTabSize,
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
	setFormatOnImport,
	setDataTabSize,
	setQueryTabSize,
};
