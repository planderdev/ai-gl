# ai-gl 저장소 구성
- 루트: 캐디스(AI GOLF) 웹사이트 + PHP 관리자(`admin/`) — 안이슬 팀장 작업. 디자인 토큰은 `admin/assets/css/tokens.css`.
- `quote/`: 견적·원가표 시스템(Next.js, Vercel 배포 https://ai-gl.vercel.app). 자세한 규칙은 `quote/AGENTS.md`, `quote/README.md`.
- 견적 시스템 UI 는 관리자 디자인 시스템(`admin-*` 클래스, 토큰)을 그대로 따른다. 토큰을 바꿀 때는 두 곳(`admin/assets/css/tokens.css`, `quote/src/app/tokens.css`)을 함께 수정.
