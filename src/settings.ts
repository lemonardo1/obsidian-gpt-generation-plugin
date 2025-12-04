export interface GPTEditorSettings {
	apiKey: string;
	model: string;
	apiUrl: string;
	provider: 'openai' | 'gemini';
	geminiApiKey: string;
	geminiModel: string;
}

export const DEFAULT_SETTINGS: GPTEditorSettings = {
	apiKey: '',
	model: 'gpt-4',
	apiUrl: 'https://api.openai.com/v1',
	provider: 'openai',
	geminiApiKey: '',
	geminiModel: 'gemini-3-pro-preview',
};


