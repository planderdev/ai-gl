# 골프투어 견적 시스템 (ai-gl)

여행사(SGL 등)의 골프 패키지 **원가표 엑셀**을 자동으로 만드는 서비스.
숙박·골프·차량·항공 원가와 마진(15%/20%)을 날짜별로 계산해 기존 수작업 원가표와 같은 형식의 `.xlsx` 를 내려받고,
항공 운임은 외부 크롤러가 API 로 밀어 넣는다.

## 실행
```bash
npm install
npm run dev            # http://localhost:3000
npm run import:costsheet -- "원가표.xlsx"   # 기존 원가표를 상품/운임/마스터로 가져오기
npm run export:costsheet -- out.xlsx        # 전체 상품 원가표 파일 생성(CLI)
```
데이터는 `./.data/*.json` 파일 스토어(`src/lib/store`)에 저장된다. 인터페이스(`Collection<T>`)를 유지한 채 Supabase 어댑터로 교체 가능.

## 계산 규칙 (`src/lib/pricing/engine.ts`)
| 항목 | 규칙 |
|---|---|
| 호텔 ¥ | 체크인일부터 N박, 각 날짜 **요일별 1박 단가** 합 (시즌 구간 우선) |
| 골프 ¥ | 일자별 홀수(`golfPlan`, 예 `[0,18,18,0]`)가 있는 날마다 골프장 요금표의 **평일/주말/연휴(일본 공휴일)** 단가 × 홀수/18. 골프장은 선택 순서대로 라운드에 배정 |
| 차량+지원비 ₩ | **출발 요일별** 금액 |
| 항공(인디비) ₩ | 출발편(출발일) + 귀국편(귀국일) 크롤링 운임. 없으면 `미정`, `운항없음`/`마감` 전파 |
| 항공(그룹) ₩ | 날짜별 그룹가 + 월별 유류할증·택스(유택) |
| 원가합 | 인디비 = 항공+호텔+골프+차량+항공추가금 / 그룹 = 항공(그룹)+호텔+골프+차량 |
| 판매가 | 원가 ÷ (1 − 마진) — 마진 목록은 상품별 설정 |

엔→원 환산은 상품별 환율. 어떤 셀이든 표에서 직접 값을 넣으면 **수동조정(override)** 으로 저장되고(주황), 비우면 자동계산으로 돌아간다.

## 엑셀 출력 (`src/lib/excel/export.ts`)
원본 원가표와 동일한 열 배치: 날짜·요일·출발편·귀국일·귀국편·그룹가·유택·항공(인디비)·항공(그룹)·호텔(₩/¥)·골프(₩/¥)·차량·항공추가금·원가합·마진별 판매가·인스타직판·메모.
수식으로 기록(H=SUM(C,E), J=K*$B$4, P=SUM(H,J,L,N,O), R=P/0.85 …)하므로 엑셀에서 값을 고치면 재계산된다. 환율은 B4 셀. 마지막 시트에 골프장 요금표.

## 크롤러 연동 API
인증: `x-api-key: <CRAWLER_API_KEY>` (로컬에서 미설정이면 생략 가능, 운영은 필수)

| 메서드 | 경로 | 용도 |
|---|---|---|
| POST | `/api/fares/requests/next` | 가장 오래된 대기 요청을 `in_progress` 로 바꾸고 `{request, tasks:[{flightNo,origin,destination,date}]}` 반환 |
| POST | `/api/fares` | `{fares:[{flightNo,origin,destination,date,fareKrw,status?}], requestId?}` 업서트. requestId 주면 요청 `done` |
| PATCH | `/api/fares/requests/:id` | `{status:"failed", error}` 등 상태 보고 |
| GET | `/api/fares?flightNo=&from=&to=` | 운임 조회 |
| GET/POST | `/api/fares/requests` | 요청 목록 / 수동 생성 |
| POST | `/api/products/:id/fare-request[?all=1]` | 상품의 미수집 구간(또는 전체) 크롤링 요청 생성 |

`status`: `ok`(운임) · `no_flight`(운항없음) · `sold_out`(마감) · `unknown`(미정). `fareKrw` 는 세금 포함 1인 총액(원).

## 그 밖의 API
`/api/products`, `/api/products/:id`(GET/PATCH/DELETE), `/api/products/:id/quote`(계산 JSON), `/api/products/:id/export`(xlsx), `/api/products/:id/overrides`(PATCH `{date, patch}`),
`/api/hotels`, `/api/golf-courses`, `/api/vehicle-rules`(GET/POST, `/:id` DELETE), `/api/settings`(GET/PUT), `/api/export`(전체 xlsx), `/api/import`(원가표 업로드).

## 구조
```
src/types            도메인 타입(Product, Hotel, GolfCourse, VehicleRule, FlightFare, FareRequest, QuoteRow …)
src/lib/pricing      날짜 유틸 + 견적 엔진(순수 함수)
src/lib/excel        import(원가표 → 데이터) / export(데이터 → 원가표)
src/lib/store        JSON 파일 컬렉션 스토어
src/lib/{masters,products,fares}/service.ts   도메인 서비스
src/app/api          REST 라우트
src/app/(pages)      대시보드 / 상품·원가표 / 항공 운임 / 마스터 데이터
scripts              CLI(import/export)
```

## 항공 운임 크롤러 (`crawler/fares.ts`, `src/lib/crawler/`)
공급자 레지스트리(`providers.ts`)에 항공사별 수집 방식을 두고, 편명 접두(RS/7C)로 자동 선택한다. 둘 다 홈페이지의 **최저가 달력 API** 를 실제 Chrome 창(headed, 새 컨텍스트)에서 호출한다 — 헤드리스·쿠키 재사용은 봇 차단에 걸린다. 과거 날짜는 저장하지 않는다.

| 공급자 | 노선/편명 | API | 특징 |
|---|---|---|---|
| 에어서울 `airseoul` | ICN–TAK RS741 / TAK–ICN RS742 | `POST /I/KO/searchRouteMinFare.do` (form) | 약 2년치 한 번에. outbound/returnAmount, 금액 0 = 운항없음 |
| 제주항공 `jejuair` | ICN–MYJ 7C1704 / MYJ–ICN 7C1703 | `POST sec.jejuair.net/ko/ibe/booking/searchlowestFareCalendarInPeriod.json` (JSON, `Channel-Code: WPC`) | 최대 90일/호출이라 구간 분할. 총액 = fareAmount + taxesAndFeesAmount |

```bash
npm run crawl -- --all                       # 두 공급자 전체, 오늘~180일
npm run crawl:jejuair -- --all --days 240    # 제주항공만
npm run crawl -- --once | --loop 300         # 요청 큐 처리(편명으로 공급자 선택)
# --server URL --api-key KEY --dry-run --route ICN-FUK:RS...:RS...
```
화면: 항공 운임 → 크롤러 카드에서 공급자·기간을 골라 `POST /api/crawl/{airseoul|jejuair|all}` `{mode:"all"|"requests", days}`. 배포 서버에서는 501(로컬에서 CLI 실행).
새 항공사를 추가하려면 `src/lib/crawler/<airline>.ts` 에 수집 함수를 만들고 `providers.ts` 에 등록한다.

## 배포 (Vercel)
- 프로젝트: `planderdevs-projects/ai-gl` → https://ai-gl.vercel.app
- 저장소: Vercel Blob(비공개 스토어 `ai-gl-data`) — `BLOB_READ_WRITE_TOKEN` 이 있으면 `src/lib/store/blob-collection.ts` 가 `.data` 대신 사용. 최초 데이터는 `npm run seed:blob`(로컬 `.data` 업로드, `--force` 로 덮어쓰기).
- 접근 보호: `APP_PASSWORD`(Basic 인증, 아이디는 아무거나) — `src/proxy.ts`. 크롤러는 `CRAWLER_API_KEY` 헤더로 통과.
- 크롤러는 배포 서버에서 실행되지 않는다(Chrome 없음). 로컬에서 `npm run crawl -- --all --server https://ai-gl.vercel.app --api-key <CRAWLER_API_KEY>`.
- 재배포: `vercel deploy --prod --yes`. 환경변수 확인: `vercel env ls`.

## SGL 마스터 데이터 시드 (`scripts/seed-sgl-masters.ts`)
```bash
npm run seed:sgl -- "~/Downloads/0309 벳부 카메노이호텔 ... .xlsx"   # 파일 생략 시 마스터만
npm run seed:blob -- --force                                        # 운영(Blob)에 반영
```
지역별 호텔(다카마쓰 3 · 벳부 2 · 마쓰야마 3 · 후지 1), 골프장(벳부GC 쯔루미/유후 계약요금, 마쓰야마 9곳(요금 미확보), 후지 6곳 2026.7~10 요금, 세부),
차량 규칙(벳부 3박/4박, 시즈오카 렌터카)을 넣고, 0309 벳부 원가표가 있으면 타이베이(TI750/751) 벳부 상품 2개와 운임을 가져온다.
역산·예상값은 memo/notes 에 "확인 필요"로 표시되어 있다. 골프장 기간표는 **먼저 매칭되는 기간이 적용**되므로 특별요금 기간을 일반 기간보다 앞에 둔다.
