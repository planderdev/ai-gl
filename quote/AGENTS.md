<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ai-gl — 골프투어 견적 시스템
- 도메인 설명·계산 규칙·API 계약은 [README.md](README.md) 참고. 계산은 `src/lib/pricing/engine.ts` 의 순수 함수만 수정하고, 화면/엑셀은 `QuoteRow` 를 소비만 한다.
- 데이터는 `.data/*.json`(gitignore). 스키마 변경 시 `src/types/index.ts` → `src/lib/schemas.ts`(zod) → 화면 순으로 맞춘다.
- PATCH 용 zod 스키마는 `.default()` 가 없는 원형에서 `.partial()` 로 만든다. zod 4 는 partial 뒤에도 기본값을 채워, 보내지 않은 필드(overrides 등)를 빈 값으로 덮어쓴다.
- 상품은 국가 › 지역 › 상품군(`ProductGroup`, 엑셀 파일) › 원가표(`Product`, 시트) 구조다. 판매 유형 `air`(항공 포함)·`land`(현지착)에 따라 표와 엑셀 양식이 갈린다.
- 동적 세그먼트 id 는 한글일 수 있으므로 라우트/페이지에서 `decodeId()` 로 복원한다.
- 엑셀 출력은 원본 원가표 열 배치를 유지한다(여행사 담당자가 그대로 쓰는 양식). 열을 바꾸려면 사용자 확인.
- 고객 사이트(`/sgl`)는 `src/lib/sgl/catalog.ts` 가 만든 `Public*` 데이터만 화면에 넘긴다. 원가·마진·운임을 고객 화면이나 공개 API 응답에 싣지 않는다. 금액은 예약 시 서버가 다시 계산한다.
