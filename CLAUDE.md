# ai-gl 저장소 구성
- 루트: 캐디스(AI GOLF) 웹사이트 + PHP 관리자(`admin/`) — 안이슬 팀장 작업. 디자인 토큰은 `admin/assets/css/tokens.css`.
- `quote/`: 견적·원가표 시스템(Next.js, Vercel 배포 https://ai-gl.vercel.app). 자세한 규칙은 `quote/AGENTS.md`, `quote/README.md`.
- 견적 시스템 UI 는 관리자 디자인 시스템(`admin-*` 클래스, 토큰)을 그대로 따른다. 토큰을 바꿀 때는 두 곳(`admin/assets/css/tokens.css`, `quote/src/app/tokens.css`)을 함께 수정.

## 플랜더 프로젝트 카드

`quote/`(견적·원가표 시스템, SGL VIP 랜딩 `/sgl-vip`, SGL 고객 사이트 `/sgl`)에 해당한다.

- 운영 방식: A. 플랜더 운영형
- 클라이언트: 에이지엘 주식회사(캐디스 · AI GOLF · SGL) / 담당자 미정 / 계정용 공용 이메일 미정
- 결정 기록:
  - 2026-11-23 카드 처음 작성. 지금까지 배포해 온 플랜더 계정(GitHub `planderdev/ai-gl`, Vercel `planderdevs-projects/ai-gl`)을 그대로 쓰기로 확인.
  - 2026-11-23 SGL 고객 사이트(`/sgl`)는 공개 스위치를 끈 채 배포. 입금 계좌·사진을 확인한 뒤 설정 › 고객 사이트에서 켠다.

| 서비스 | 소유 | 계정·팀 | 플랜더 권한 | 상태 |
|---|---|---|---|---|
| 도메인 | 클라이언트 | 미정 (지금은 `ai-gl.vercel.app` 사용, 자체 도메인 미연결) | DNS 관리 | 미정 |
| GitHub | 플랜더 | `planderdev/ai-gl` (공개 저장소) | 소유 | 운영 중 |
| Vercel | 플랜더 | `planderdevs-projects` / `ai-gl` (Root Directory `quote`, CLI 배포) | 소유 | 운영 중 · 팀 플랜(Pro) 확인 필요 |
| Vercel Blob | 플랜더 | 비공개 스토어 `ai-gl-data` | 소유 | 운영 중 |
| Resend | — | 사용 안 함 | — | 해당 없음 |
| 토스페이먼츠(PG) | 미정 | 미정 | 미정 | 미가맹 · 키 없음(카드결제 닫힘) |

- 환경 변수: `APP_PASSWORD`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `CRAWLER_API_KEY`, `LOGIN_ACCOUNTS`, `LOGIN_ALLOWED_IDS`, `SITE_URL` · 미설정: `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`
- 개인정보: 예약·상담·VIP 신청 정보가 플랜더 계정의 Vercel Blob 에 저장된다 → 클라이언트 개인정보처리방침의 위탁(수탁자)에 플랜더 기재 여부 확인 필요.
- 배포: 저장소 루트에서 `vercel deploy --prod --yes` (Git 자동 배포 아님). `main` 에 푸시한 뒤 배포한다.
