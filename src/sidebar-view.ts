import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import { GPTEditorPluginInterface } from './types';
import { callGPTAPI } from './gpt-service';

export const VIEW_TYPE_GPT_EDITOR = 'gpt-editor-view';

export class GPTEditorView extends ItemView {
	plugin: GPTEditorPluginInterface;

	constructor(leaf: WorkspaceLeaf, plugin: GPTEditorPluginInterface) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_GPT_EDITOR;
	}

	getDisplayText() {
		return 'GPT Editor';
	}

	getIcon() {
		return 'sparkles';
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('gpt-editor-view');

		// 제목 추가
		const titleEl = contentEl.createEl('h2', {
			text: 'GPT 문서 편집기',
		});
		titleEl.addClass('gpt-editor-title');

		// 설명 및 프롬프트 안내 추가
		const promptText = [
			'${제목}에 맞는 마크다운 문서 생성. 백과사전 느낌으로, 한국어 문서 생성. 용어는 영어로 사용해도 괜찮다.',
			'',
			'문서 마지막에는',
			'',
			'---',
			'',
			'관련 문서: [[다른 문서명]], [[다른 문서명2]]',
			'',
			'이런식으로 형식 맞춰줘. 관련 문서명은 새롭게 추천해서 추가.',
		].join('\n');
		const descEl = contentEl.createEl('p', {
			text: `현재 열린 마크다운 문서의 제목에 맞는 백과사전 스타일 문서를 생성합니다.------\n\n프롬프트 예시:\n${promptText}`,
		});
		descEl.addClass('gpt-editor-description');

		// 버튼 추가
		const buttonEl = contentEl.createEl('button', {
			text: '문서 생성하기',
		});
		buttonEl.addClass('mod-cta', 'gpt-editor-button');
		buttonEl.addEventListener('click', async () => {
			await this.handleEditDocument();
		});

		// 상태 표시 영역
		const statusEl = contentEl.createEl('div', {
			cls: 'gpt-editor-status',
		});
		statusEl.style.display = 'none';
	}

	async handleEditDocument() {
		const activeFile =
			this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('열린 문서가 없습니다.');
			return;
		}

		if (!activeFile.path.endsWith('.md')) {
			new Notice('마크다운 파일만 편집할 수 있습니다.');
			return;
		}

		// 파일명에서 제목 추출 (확장자 제거)
		const title = activeFile.basename;

		// 상태 표시
		const statusEl = this.contentEl.querySelector(
			'.gpt-editor-status'
		) as HTMLElement;
		if (statusEl) {
			statusEl.style.display = 'block';
			statusEl.textContent = 'GPT로 문서를 생성하는 중...';
			statusEl.addClass('is-loading');
		}

		// GPT API 호출
		const result = await callGPTAPI(
			title,
			this.plugin.settings
		);

		if (statusEl) {
			statusEl.removeClass('is-loading');
		}

		if (result.error) {
			new Notice(result.error);
			if (statusEl) {
				statusEl.textContent = `오류: ${result.error}`;
				statusEl.addClass('is-error');
			}
			return;
		}

		// 문서 내용 업데이트
		try {
			await this.app.vault.modify(activeFile, result.content);
			new Notice('문서가 성공적으로 생성되었습니다!');
			if (statusEl) {
				statusEl.textContent = '생성 완료!';
				statusEl.addClass('is-success');
				setTimeout(() => {
					statusEl.style.display = 'none';
					statusEl.removeClass('is-success');
				}, 3000);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: String(error);
			new Notice(`문서 저장 오류: ${errorMessage}`);
			if (statusEl) {
				statusEl.textContent = `저장 오류: ${errorMessage}`;
				statusEl.addClass('is-error');
			}
		}
	}

	async onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

