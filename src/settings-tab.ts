import { PluginSettingTab, Setting } from 'obsidian';
import { GPTEditorPluginInterface } from './types';

export class GPTEditorSettingTab extends PluginSettingTab {
	plugin: GPTEditorPluginInterface;

	constructor(plugin: GPTEditorPluginInterface) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'AI 문서 편집기 설정' });

		new Setting(containerEl)
			.setName('AI 제공자')
			.setDesc('사용할 AI 서비스를 선택하세요.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('openai', 'OpenAI')
					.addOption('gemini', 'Google Gemini')
					.setValue(this.plugin.settings.provider)
					.onChange(async (value) => {
						this.plugin.settings.provider = value as 'openai' | 'gemini';
						await this.plugin.saveSettings();
						this.display(); // Refresh to show relevant settings
					})
			);

		if (this.plugin.settings.provider === 'openai') {
			containerEl.createEl('h3', { text: 'OpenAI 설정' });
			new Setting(containerEl)
				.setName('OpenAI API 키')
				.setDesc('OpenAI API 키를 입력하세요. https://platform.openai.com/api-keys 에서 발급받을 수 있습니다.')
				.addText((text) => {
					text.setPlaceholder('sk-...')
						.setValue(this.plugin.settings.apiKey)
						.inputEl.type = 'password';
					text.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					});
				});

			new Setting(containerEl)
				.setName('모델')
				.setDesc('사용할 GPT 모델을 선택하세요.')
				.addDropdown((dropdown) =>
					dropdown
						.addOption('gpt-4', 'GPT-4')
						.addOption('gpt-4-turbo', 'GPT-4 Turbo')
						.addOption('gpt-5-nano-2025-08-07', 'gpt-5-nano-2025-08-07')
						.setValue(this.plugin.settings.model)
						.onChange(async (value) => {
							this.plugin.settings.model = value;
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName('API URL')
				.setDesc('OpenAI API 엔드포인트 URL (기본값 사용 권장)')
				.addText((text) =>
					text
						.setPlaceholder('https://api.openai.com/v1')
						.setValue(this.plugin.settings.apiUrl)
						.onChange(async (value) => {
							this.plugin.settings.apiUrl = value;
							await this.plugin.saveSettings();
						})
				);
		} else if (this.plugin.settings.provider === 'gemini') {
			containerEl.createEl('h3', { text: 'Google Gemini 설정' });
			new Setting(containerEl)
				.setName('Gemini API 키')
				.setDesc('Google Gemini API 키를 입력하세요.')
				.addText((text) => {
					text.setPlaceholder('AIza...')
						.setValue(this.plugin.settings.geminiApiKey)
						.inputEl.type = 'password';
					text.onChange(async (value) => {
						this.plugin.settings.geminiApiKey = value;
						await this.plugin.saveSettings();
					});
				});

			new Setting(containerEl)
				.setName('모델')
				.setDesc('사용할 Gemini 모델을 선택하세요.')
				.addDropdown((dropdown) =>
					dropdown
						.addOption('gemini-3-pro-preview', 'Gemini 3 Pro Preview')
						.addOption('gemini-pro', 'Gemini Pro')
						.setValue(this.plugin.settings.geminiModel)
						.onChange(async (value) => {
							this.plugin.settings.geminiModel = value;
							await this.plugin.saveSettings();
						})
				);
		}
	}
}

