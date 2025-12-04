import OpenAI from 'openai';
import { GoogleGenAI } from "@google/genai";
import { GPTEditorSettings } from './settings';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

export interface GPTResponse {
	content: string;
	error?: string;
}

function resolveBaseUrl(apiUrl: string | undefined): string {
	const fallback = DEFAULT_BASE_URL;
	if (!apiUrl) {
		return fallback;
	}

	let sanitized = apiUrl.trim();
	if (!sanitized) {
		return fallback;
	}

	sanitized = sanitized.replace(/\/chat\/completions\/?$/i, '');
	sanitized = sanitized.replace(/\/+$/, '');
	if (!sanitized) {
		return fallback;
	}

	try {
		const url = new URL(sanitized);
		const path = url.pathname.replace(/\/+$/, '');
		if (
			/api\.openai\.com$/i.test(url.hostname) &&
			!/\/v\d+$/i.test(path)
		) {
			url.pathname = `${path || ''}/v1`;
			return url.toString();
		}

		url.pathname = path;
		return url.toString();
	} catch (error) {
		console.error('Invalid API URL provided, falling back to default.', error);
		return fallback;
	}
}

export async function callGPTAPI(
	title: string,
	settings: GPTEditorSettings
): Promise<GPTResponse> {
	if (settings.provider === 'gemini') {
		if (!settings.geminiApiKey) {
			return {
				content: '',
				error: 'Gemini API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.',
			};
		}

		try {
			const ai = new GoogleGenAI({ apiKey: settings.geminiApiKey });
			const systemPrompt = 'You are a helpful assistant that creates encyclopedia-style markdown documents in Korean. Create comprehensive, well-structured content. Return only the markdown content without any explanations or additional text.';
			const userPrompt = `${title}에 맞는 마크다운 문서 생성. 백과사전 느낌으로, 한국어 문서 생성. 용어는 영어로 사용해도 괜찮다.\n\n문서 마지막에는\n\n---\n\n관련 문서: [[다른 문서명]], [[다른 문서명2]]\n\n이런식으로 형식 맞춰줘. 관련 문서명은 새롭게 추천해서 추가. 수식은 옵시디안 형식으로 in line 의 경우 $ $ 표시로 감싸기`;
			
			const response = await ai.models.generateContent({
				model: settings.geminiModel,
				contents: `${systemPrompt}\n\n${userPrompt}`,
			});

			const editedContent = response.text;

			if (!editedContent) {
				return {
					content: '',
					error: 'Gemini로부터 응답을 받지 못했습니다.',
				};
			}

			return { content: editedContent };
		} catch (error) {
			return {
				content: '',
				error: `Gemini API 오류: ${error instanceof Error ? error.message : String(error)}`,
			};
		}
	}

	// Default to OpenAI
	if (!settings.apiKey) {
		return {
			content: '',
			error: 'API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.',
		};
	}

	try {
		const client = new OpenAI({
			apiKey: settings.apiKey,
			baseURL: resolveBaseUrl(settings.apiUrl),
			dangerouslyAllowBrowser: true,
		});

		const response = await client.chat.completions.create({
			model: settings.model,
			messages: [
				{
					role: 'system',
					content:
						'You are a helpful assistant that creates encyclopedia-style markdown documents in Korean. Create comprehensive, well-structured content. Return only the markdown content without any explanations or additional text.',
				},
				{
					role: 'user',
					content: `${title}에 맞는 마크다운 문서 생성. 백과사전 느낌으로, 한국어 문서 생성. 용어는 영어로 사용해도 괜찮다.\n\n문서 마지막에는\n\n---\n\n관련 문서: [[다른 문서명]], [[다른 문서명2]]\n\n이런식으로 형식 맞춰줘. 관련 문서명은 새롭게 추천해서 추가. 수식은 옵시디안 형식으로 in line 의 경우 $ $ 표시로 감싸기`,
				},
			],
		});

		const editedContent =
			response.choices?.[0]?.message?.content || '';

		if (!editedContent) {
			return {
				content: '',
				error: 'GPT로부터 응답을 받지 못했습니다.',
			};
		}

		return { content: editedContent };
	} catch (error) {
		return {
			content: '',
			error: `API 오류: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
}

