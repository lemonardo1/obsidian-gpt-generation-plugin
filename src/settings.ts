export interface GPTEditorSettings {
	apiKey: string;
	model: string;
	apiUrl: string;
}

export const DEFAULT_SETTINGS: GPTEditorSettings = {
	apiKey: '',
	model: 'gpt-4',
	apiUrl: 'https://api.openai.com/v1',
};


