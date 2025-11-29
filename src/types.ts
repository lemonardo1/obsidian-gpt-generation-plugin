import { Plugin } from 'obsidian';
import { GPTEditorSettings } from './settings';

export interface GPTEditorPluginInterface extends Plugin {
	settings: GPTEditorSettings;
	saveSettings(): Promise<void>;
}

