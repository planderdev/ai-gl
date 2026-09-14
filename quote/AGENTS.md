<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ai-gl — 골프투어 견적 시스템
- 도메인 설명·계산 규칙·API 계약은 [README.md](README.md) 참고. 계산은 `src/lib/pricing/engine.ts` 의 순수 함수만 수정하고, 화면/엑셀은 `QuoteRow` 를 소비만 한다.
- 데이터는 `.data/*.json`(gitignore). 스키마 변경 시 `src/types/index.ts` → `src/lib/schemas.ts`(zod) → 화면 순으로 맞춘다.
- 동적 세그먼트 id 는 한글일 수 있으므로 라우트/페이지에서 `decodeId()` 로 복원한다.
- 엑셀 출력은 원본 원가표 열 배치를 유지한다(여행사 담당자가 그대로 쓰는 양식). 열을 바꾸려면 사용자 확인.
