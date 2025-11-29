import { Plugin } from 'obsidian';
import { GPTEditorSettings, DEFAULT_SETTINGS } from './src/settings';
import { GPTEditorSettingTab } from './src/settings-tab';
import {
	GPTEditorView,
	VIEW_TYPE_GPT_EDITOR,
} from './src/sidebar-view';

export class GPTEditorPlugin extends Plugin {
	settings: GPTEditorSettings;

	async onload() {
		await this.loadSettings();

		// 왼쪽 사이드바 리본에 아이콘 버튼 추가
		const ribbonIconEl = this.addRibbonIcon(
			'rocking-chair',
			'GPT 문서 편집기',
			async (evt: MouseEvent) => {
				// 버튼 클릭 시 오른쪽 사이드바 뷰 활성화
				await this.activateView();
			}
		);
		ribbonIconEl.addClass('gpt-editor-ribbon-icon');

		// 오른쪽 사이드바에 뷰 등록
		this.registerView(
			VIEW_TYPE_GPT_EDITOR,
			(leaf) => new GPTEditorView(leaf, this)
		);

		// 뷰 활성화
		this.activateView();

		// 설정 탭 추가
		this.addSettingTab(new GPTEditorSettingTab(this));

		// 명령어 추가: 사이드바 열기/닫기
		this.addCommand({
			id: 'toggle-gpt-editor-view',
			name: 'GPT 편집기 사이드바 토글',
			callback: () => {
				this.activateView();
			},
		});
	}

	async onunload() {
		// 뷰 정리
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE_GPT_EDITOR)
			.forEach((leaf) => leaf.detach());
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const { workspace } = this.app;

		// 이미 뷰가 열려있는지 확인
		let leaf = workspace.getLeavesOfType(VIEW_TYPE_GPT_EDITOR)[0];

		if (!leaf) {
			// 오른쪽 사이드바에 뷰 추가
			const rightLeaf = workspace.getRightLeaf(false);
			if (!rightLeaf) {
				return;
			}
			leaf = rightLeaf;
			await leaf.setViewState({
				type: VIEW_TYPE_GPT_EDITOR,
				active: true,
			});
		}

		// 뷰 활성화
		workspace.revealLeaf(leaf);
	}
}

export default GPTEditorPlugin;
