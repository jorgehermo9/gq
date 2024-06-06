export type Settings = {
	autoApplySettings: AutoApplySettings;
	formattingSettings: FormattingSettings;
	workspaceSettings: WorkspaceSettings;
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

export type WorkspaceSettings = {
	linkEditors: boolean;
}

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
		workspaceSettings: {
			linkEditors: true
		}
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

const setLinkEditors = (
	settings: Settings,
	linkEditors: boolean,
): Settings => {
	return {
		...settings,
		workspaceSettings: {
			...settings.workspaceSettings,
			linkEditors
		}
	}
}

export {
	getDefaultSettings,
	setAutoApply,
	setDebounceTime,
	setFormatOnImport,
	setDataTabSize,
	setQueryTabSize,
	setLinkEditors
};
