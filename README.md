# GPT Editor for Obsidian

GPT Editor는 현재 활성화된 마크다운 파일의 제목을 기반으로 백과사전 스타일의 한국어 문서를 생성해 주는 Obsidian 플러그인입니다. 오른쪽 사이드바에서 버튼 한 번만 클릭하면 GPT가 자동으로 문서를 작성해 주며, 생성된 문서의 마지막에는 관련 문서 링크 블록이 추가됩니다.

## 주요 기능
- 왼쪽 리본에 `rocking-chair` 아이콘 버튼 추가 (클릭 시 GPT Editor 사이드바 열기)
- GPT가 백과사전 톤의 새로운 문서를 생성하고 기존 내용을 덮어쓰기
- 사이드바 상태 영역에서 진행 상황 및 오류 안내
- OpenAI API 키, 모델, 엔드포인트 URL을 설정 화면에서 관리

## 설치 및 개발
1. 저장소를 `<Vault>/.obsidian/plugins/gpt-editor/` 위치에 클론합니다.
2. 플러그인 폴더에서 의존성을 설치합니다.
   ```bash
   npm install
   ```
3. 개발 모드(Watch):
   ```bash
   npm run dev
   ```
4. 프로덕션 번들:
   ```bash
   npm run build
   ```
5. Obsidian을 리로드하고 **Settings → Community plugins → GPT Editor**를 활성화합니다.

## 사용 방법
1. 마크다운 파일을 연 상태에서 오른쪽 사이드바의 **문서 생성하기** 버튼을 클릭합니다.
2. 플러그인은 파일명의 베이스 이름을 제목으로 사용해 GPT에게 새 문서 생성을 요청합니다.
3. 응답이 도착하면 기존 파일 내용이 GPT가 생성한 텍스트로 교체됩니다.

## 설정
플러그인 설정 탭(**Settings → GPT Editor**)에서 다음 값을 관리할 수 있습니다.
- **OpenAI API 키**: `sk-`로 시작하는 개인 키. 비워두면 호출이 차단됩니다.
- **모델**: `gpt-4`, `gpt-4-turbo`, `gpt-5-nano-2025-08-07` 중 선택.
- **API URL**: 기본값은 `https://api.openai.com/v1`. 다른 호환 엔드포인트도 설정 가능하며, `callGPTAPI`가 자동으로 `/v1`이 포함된 형태로 정규화 합니다.

## GPT 프롬프트 위치
- 구현 파일: `src/gpt-service.ts`
- 시스템 메시지:
```21:34:src/gpt-service.ts
content: 'You are a helpful assistant that creates encyclopedia-style markdown documents in Korean. Create comprehensive, well-structured content. Return only the markdown content without any explanations or additional text.',
```
- 사용자 메시지:
```35:37:src/gpt-service.ts
content: `${title}에 맞는 마크다운 문서 생성. 백과사전 느낌으로, 한국어 문서 생성. 용어는 영어로 사용해도 괜찮다.\n\n문서 마지막에는\n\n---\n\n관련 문서: [[다른 문서명]], [[다른 문서명2]]\n\n이런식으로 형식 맞춰줘`,
```
제목은 활성 파일의 베이스 이름(`basename`)을 사용하며, 생성된 결과는 파일 전체를 덮어씁니다.

## 라이선스
MIT License. 자세한 내용은 `LICENSE` 파일을 참고하세요.
