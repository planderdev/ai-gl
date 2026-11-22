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

## 상품 구조 (상하 관계)
```
국가 › 지역 › 상품군(ProductGroup) › 원가표(Product) › 출발일별 행(QuoteRow)
                 └ 엑셀 파일 1개      └ 시트 1장
지역 › 호텔 · 골프장 · 차량 규칙(단가)  ← 원가표가 참조
```
- **상품군** = 같은 지역·항공·호텔 조합의 원가표 묶음(원가표 엑셀 파일 1개). `/products` 가 이 트리를 보여 주고, 상품군 단위로 묶음 엑셀을 내려받는다.
- **원가표** = 일정(박수·홀수)과 구성(숙박·골프·차량·기타 원가·항공)을 정한 시트 1장. 판매 유형은 두 가지.
  - `air` 항공 포함: 인디비(크롤링 운임)·그룹(그룹가+유택) 두 가지 원가 — 0904 에어서울 원가표 양식
  - `land` 현지착: 항공을 원가에서 빼고 운임은 참고용으로만 표시 — 1108 마쓰야마 원가표 양식
- 단가(호텔·골프장·차량)는 지역에 속하고 여러 원가표가 함께 쓴다. 단가를 고치면 그 단가를 쓰는 모든 원가표가 바뀐다.

## 계산 규칙 (`src/lib/pricing/engine.ts`)
| 항목 | 규칙 |
|---|---|
| 호텔 ¥ | 체크인일부터 N박. 숙박 구성(`stays`, 예: 쥬라쿠 1박 + 넘버원 2박) 순서대로 각 숙박일의 단가 합. 단가는 **일자별 요금(`dateRates`) → 시즌 구간 → 요일 단가** 순 |
| 골프 ¥ | 일자별 홀수(`golfPlan`, 예 `[0,18,18,0]`, 조조 항공편은 `[18,18,18,0]`)가 있는 날마다 라운드. 라운드별 골프장(`golfCourseIds`)과 플레이 스타일(`golfStyles`)로 요금표의 **평일/주말/연휴(일본 공휴일)** 단가 × 홀수/18. 스타일을 지정하면 그 스타일 행만, 아니면 스타일 없는 행만 본다. 같은 풀 안에서는 먼저 맞는 기간이 우선(특별요금일을 앞에 둔다) |
| 차량+지원비 ₩ | **출발 요일별** 금액 |
| 기타 원가 ₩ | 석식 등 1인 고정 항목(`extras`, 원 또는 엔)의 합 |
| 항공(인디비) ₩ | 출발편(출발일) + 귀국편(귀국일) 크롤링 운임. 없으면 `미정`, `운항없음`/`마감` 전파. 현지착은 설정 편명의 운임만 참고로 표시 |
| 항공(그룹) ₩ | 날짜별 그룹가 + 월별 유류할증·택스(유택) |
| 원가합 | 항공 포함: 인디비 = 항공+호텔+골프+차량+기타+항공추가금 / 그룹 = 항공(그룹)+호텔+골프+차량+기타. 현지착: 호텔+골프+차량+기타 |
| 판매가 | 원가 ÷ (1 − 마진) — 마진 목록은 상품별 설정. 실제 판매가(`directSalePrice`, "84,9" = 849,000원)를 넣으면 판매 수익률 = 1 − 원가 ÷ 판매가 |

엔→원 환산은 상품별 환율. 어떤 셀이든 표에서 직접 값을 넣으면 **수동조정(override)** 으로 저장되고(주황), 비우면 자동계산으로 돌아간다.

## 엑셀 출력 (`src/lib/excel/export.ts`)
- **항공 포함 양식**: 날짜·요일·출발편·귀국일·귀국편·그룹가·유택·항공(인디비)·항공(그룹)·호텔(₩/¥)·골프(₩/¥)·차량·항공추가금·원가합·마진별 판매가·인스타직판·메모. 수식(H=SUM(C,E), J=K*$B$4, P=SUM(H,J,L,N,O), R=P/0.85 …), 환율은 B4 셀. 기타 원가가 있는 상품만 차량 뒤에 열이 하나 더 생긴다.
- **현지착 양식**: 날짜·요일·출발편·귀국편·항공(빈칸)·호텔(₩/¥)·골프(₩/¥)·차량·기타 원가…·원가합·수익 N%·판매가·메모. L=SUM(E,F,H,J,K), M=SUM(L)/0.85, 환율은 4행 셀. 오른쪽(Y열~)에 라운드별 기준 요금과 출발일별 라운드 금액.
- 뒤쪽 시트: 골프장 요금표(스타일별 행), 일자별 요금을 쓰는 호텔이 있으면 호텔 요금표(숙박일별 단가 + 출발일별 1~N박 합계).
- `/api/product-groups/:id/export` 는 상품군의 원가표를 박수·홀수 순 시트로 묶은 파일을 만든다.

## 엑셀 가져오기 (`src/lib/excel/import*.ts`)
파일 1개 = 상품군, A5 가 `날짜` 인 시트 1장 = 원가표. 5행 머리글에 `그룹` 열이 있으면 항공 포함 양식, 없으면 현지착 양식으로 읽는다.
현지착 양식은 요금표 시트의 "출발일별 1~N박 단가" 블록을 호텔 일자별 요금으로, 오른쪽 위 기준표(골프장·주중·주말)를 골프장 요금 구간으로 바꾼다. 달력상 평일인데 모든 라운드가 주말 요금으로 잡힌 날은 특별요금일(연말연시 등)로 등록한다.
호텔·골프장은 기존 단가와 이름을 맞춰(`matchByName`: 정규화 일치 → 지역명만 다른 포함 관계 → 자모 편집 거리 1) 중복 등록하지 않는다. 규칙으로 재현되지 않는 셀만 수동조정으로 남는다.

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
`/api/product-groups`(GET/POST), `/api/product-groups/:id`(GET/PATCH/DELETE — 삭제해도 하위 원가표는 미분류로 남는다), `/api/product-groups/:id/export`(묶음 xlsx), `/api/product-groups/auto`(POST, 미분류 원가표를 지역·호텔·항공편 기준으로 묶기),
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
공급자 레지스트리(`providers.ts`)에 항공사별 수집 방식을 두고, 편명 접두(RS/7C)로 자동 선택한다. **조회 기준 인원(pax)** 은 기본 4명이며(두 항공사 달력 API 의 paxCnt / passengers.count), 화면·CLI(`--pax`)·크롤링 요청(`pax`)에서 바꿀 수 있다. 운임에는 `meta.pax` 로 기준 인원이 남는다. 둘 다 홈페이지의 **최저가 달력 API** 를 실제 Chrome 창(headed, 새 컨텍스트)에서 호출한다 — 헤드리스·쿠키 재사용은 봇 차단에 걸린다. 과거 날짜는 저장하지 않는다.

| 공급자 | 노선/편명 | API | 특징 |
|---|---|---|---|
| 에어서울 `airseoul` | ICN–TAK RS741 / TAK–ICN RS742 | `POST /I/KO/searchRouteMinFare.do` (form) | 약 2년치 한 번에. outbound/returnAmount, 금액 0 = 운항없음 |
| 제주항공 `jejuair` | ICN–MYJ 오후편 7C1703(13:05) / 7C1704(15:40), 조조편 7C1721(07:00) / 7C1722(09:35) | `POST sec.jejuair.net/ko/ibe/booking/searchlowestFareCalendar.json` (form `lowestFareCalendar=<JSON>&pageId`, `Channel-Code: WPC`) — 왕복 2구간으로 조회 | 시작 달부터 두 달치씩. 총액 = fareAmount + taxesAndFeesAmount(사이트 달력 표시와 같음). **노선 하루 최저가라 편을 구분하지 못한다**(아래 참고) |
| 진에어 `jinair` | ICN–KKJ LJ349/LJ350, ICN–TAK LJ359/LJ360 | 예약 화면에서 편도·성인 N명 조회 1회 → `POST /booking/getAirAvailabilityJson`(X-CSRF-TOKEN) 날짜별 호출, `GET /booking/bestfares` 로 좌석부족/운항없음 구분 | Cloudflare 매니지드 챌린지 → 자동화 흔적 제거 옵션 필요. **요청 빈도 제한(1015/429)** 이 있어 호출 간격 4초(`JINAIR_PACE_MS`)로 날짜당 1회 호출 → 180일·왕복 노선 하나에 약 25분. 429 시 70초 대기 후 재시도, 계속되면 미정으로 남김. 편별 좌석 기준이라 **인원이 정확히 반영**됨 |

```bash
npm run crawl -- --all                       # 두 공급자 전체, 오늘~180일, 4인 기준
npm run crawl -- --all --pax 6               # 6인 기준
npm run crawl:jejuair -- --all --days 240    # 제주항공만
npm run crawl -- --once | --loop 300         # 요청 큐 처리(편명으로 공급자 선택)
# --server URL --api-key KEY --dry-run --route ICN-FUK:RS...:RS...
```
화면: 항공 운임 → 크롤러 카드에서 공급자·기간을 골라 `POST /api/crawl/{airseoul|jejuair|all}` `{mode:"all"|"requests", days}`. 배포 서버에서는 501(로컬에서 CLI 실행).
새 항공사를 추가하려면 `src/lib/crawler/<airline>.ts` 에 수집 함수를 만들고 `providers.ts` 에 등록한다.
### 제주항공 달력의 통화·세금·편 구분 (2026-11-22 수정)
- **통화**: 달력은 조회한 첫 구간 출발지 통화로 내려온다. 편도로 물으면 일본 출발편(MYJ→ICN)이 엔화(JPY)라, 예전 크롤러는 엔화 금액을 원화로 저장했다. 지금은 항상 `tripRoute` 2구간(한국 출발 왕복)으로 물어 두 방향 모두 원화로 받고, 응답의 `currencyCode` 가 KRW 가 아니면 금액을 저장하지 않는다(`status: unknown`, `meta.currency`·`meta.fare`·`meta.tax` 에 원본).
- **세금**: `taxesAndFeesAmount` 가 0 이거나 `includeTaxesAndFees` 가 false 인 응답도 저장하지 않는다(`unknown`). 9월 수집분은 세금이 0 으로 내려온 기본운임이었다.
- **편 구분**: 달력 금액은 그날 그 노선의 최저가다. ICN–MYJ 는 하루 2편이고 편별 차이가 크다(사이트 4인 조회 예: 12/4 MYJ→ICN 7C1722 183,100원 · 7C1704 298,600원, 12/5 는 7C1704 마감). 그래서 같은 공항 쌍에 편이 둘 이상 등록된 노선은 금액을 운임으로 쓰지 않고 `status: unknown` + `meta.dayLowestKrw`(참고값) + `meta.basis: "day-lowest"` 로 저장한다 — 화면에는 “미정 · 최저 N~”. 그날 전체가 마감·비운항이면 모든 편에 그대로 넣는다. 편이 하나뿐인 노선은 달력 최저가 = 그 편의 운임(`ok`)이다.
- **편별 운임**: 예약 조회(`AvailSearch.do`, `getAvailSchedule.json`)는 봇 차단(Akamai) 대상이라 자동화 브라우저에서는 요청이 끊긴다(ERR_HTTP2_PROTOCOL_ERROR). 차단을 피해 가는 설정은 넣지 않았으므로 편별 운임은 사이트에서 확인해 항공 운임 화면에 직접 입력하거나 원가표에서 가져온다. `meta.basis = "day-lowest"` 인 수집값은 가져오거나(`import`) 직접 넣은(`manual`) 운임을 덮어쓰지 않는다(`src/lib/fares/protect.ts`, 서버 `upsertFares` 와 CLI 업로드 양쪽).
- **호출 간격·차단**: 짧은 시간에 여러 번 조회하면 달력 요청에도 봇 확인 페이지(HTTP 200 `text/html`, CORS 헤더 없음 → 페이지에서는 `Failed to fetch`)가 내려온다. 호출 사이 5초(`JEJUAIR_PACE_MS`, `--pace`)를 두고, 막히면 60초 뒤 한 번만 다시 시도하고 그만둔다(종료 코드 3). 확인 페이지를 풀거나 피해 가지 않으니 30분 이상 지난 뒤 같은 명령을 다시 실행한다 — 180일 수집은 달력 호출 4번이면 끝난다.

계절에 따라 편명이 바뀌는 노선(진에어 ICN–KKJ: 하계 LJ349/350, 동계 LJ385/386)은 운임을 실제 편명으로 저장하고, 견적 엔진이 설정 편명의 운임이 없으면 **같은 항공사·노선·날짜의 운임**으로 대체한다(`lookupFare`).
잘못 수집된 운임은 `npx tsx scripts/purge-fares.ts --prefix LJ --source crawler` 로 지운다(BLOB 토큰이 있으면 운영 대상). `--source crawler` 를 붙이면 가져온(`import`)·직접 넣은(`manual`) 운임은 남는다.

## 차량 요금표 크롤러 — MK택시 공항 송영 (`src/lib/crawler/mk-taxi.ts`, `/vehicles`)
`https://www.mk-group.co.jp/kr/shuttle/{도시}` 의 정액 요금표(1대 기준 엔)를 fetch + HTML 표 파싱으로 수집한다(정적 페이지라 배포 서버에서도 실행 가능).
rowspan 셀을 펼치고, 표 앞 텍스트의 "■나리타 송영 / ＜하네다 픽업＞ / ＜2026년 5월 21일～＞"를 섹션·적용기간으로 삼으며, 종료일이 지난 표는 건너뛴다.
화면 `/vehicles` 에서 도시를 골라 "지금 수집"(`POST /api/crawl/vehicles/{mk-tokyo|…|all}`), 조회는 `GET /api/vehicle-fares?provider=mk-tokyo`. 저장은 `vehicle-fares` 컬렉션(공급자 단위 교체).

## 관리자 메뉴(CMS) — 캐디스 PHP 관리자 이관 (`src/lib/cms/`, `/cms/*`)
안이슬 팀장의 PHP 관리자(`admin/`)가 관리하던 메뉴를 같은 구조로 옮겼다: 상품관리(전체 상품/골프장·패키지 등록/호텔/국가·지역·테마·배지), 이벤트관리, 예약관리(목록·캘린더·등록), 고객관리, 콘텐츠관리(공지·FAQ·배너), 설정(기본·결제·취소환불·API).
- 스키마 `src/lib/cms/schema.ts`: 컬렉션마다 목록 컬럼·검색 필드·상태·폼 섹션/필드를 정의(PHP form.php 의 라벨·옵션 기준). 새 컬렉션은 여기에 추가하면 목록/등록/수정 화면과 API(`/api/cms/<collection>`)가 자동으로 생긴다.
- 데이터: `cms-<collection>` 컬렉션(로컬 `.data`, 운영 Blob). 최초 이관은 `npm run seed:cms`(저장소 루트의 `admin/data/*.json`, `admin/modules/product/data/products.json` → 컬렉션, `settings.json` → `cms-settings`). `--force` 로 덮어쓰기.
- 이관 이후에는 이 화면이 원본이며 PHP 쪽 json 과 자동 동기화되지 않는다.

## SGL VIP 사전신청 랜딩 (`/sgl-vip`, `src/app/sgl-vip/`, `src/lib/sgl-vip/`)
광고 영상(SGL 인스타그램 운영 1주년, 12월 26일 오픈, 연회비 10만원, 매주 일요일 19시 혜택 공개)에서 유입된 고객이 사전신청하는 공개 페이지. 로그인 없이 열리도록 `src/proxy.ts` matcher 에서 `sgl-vip`, `api/public` 을 제외했다.
- 신청: `POST /api/public/sgl-vip/apply` → CMS 컬렉션 `vip-applications`(관리자: 이벤트관리 → VIP 사전신청, 엑셀 다운로드). 공개 폼이 동시에 쓰므로 `perRecord` 로 **건당 Blob 하나**(`recordCollection`)에 저장한다. id 는 휴대폰 번호 해시라 번호당 한 건이며, 재신청해도 응답은 같고 첫 건이 유지된다.
- 혜택 공개: CMS 컬렉션 `vip-benefits`(이벤트관리 → VIP 혜택 공개). 상태가 공개이고 공개 일시(KST)가 지난 항목만 서버에서 골라 보내므로 공개 전 내용은 페이지 소스에 실리지 않는다. 페이지 캐시 60초 → 최대 1분 지연. 릴스로 공개된 혜택(`VIP_ANNOUNCED_BENEFITS`, 1~3탄)은 컬렉션 기본 항목(`seedItems`)이라 저장소에 없어도 랜딩·관리자에 보이고, 관리자에서 저장하면 저장소 값이 우선한다(삭제 대신 상태 '숨김'). 잠긴 카드의 다음 공개 시각은 공개 예정으로 등록된 혜택이 있으면 그 시각, 없으면 다음 일요일 19시이며, 직전 혜택이 일요일보다 당겨 공개됐으면(3탄 토요일) 그 주는 건너뛴다.
- 일정·문구 상수: `src/lib/sgl-vip/config.ts`. 동의 문구를 바꾸면 `VIP_CONSENT_VERSION` 도 올린다.
- 자산: `public/sgl-vip/`. 영상에 자막이 박혀 있어 사진·히어로 클립은 자막 띠를 피해 잘랐다.
- 유입 경로: 광고 링크에 `?utm_source=&utm_medium=&utm_campaign=&utm_content=` 를 붙이면 신청 건에 함께 저장된다.

## 배포 (Vercel)
- 프로젝트: `planderdevs-projects/ai-gl` → https://ai-gl.vercel.app
- 저장소: Vercel Blob(비공개 스토어 `ai-gl-data`) — `BLOB_READ_WRITE_TOKEN` 이 있으면 `src/lib/store/blob-collection.ts` 가 `.data` 대신 사용. 최초 데이터는 `npm run seed:blob`(로컬 `.data` 업로드, `--force` 로 덮어쓰기).
- 접근 보호: `/login` 에서 이름을 입력하면 서명 쿠키 세션(30일)이 발급된다(`src/lib/auth/session.ts`, `src/proxy.ts`). `LOGIN_ALLOWED_IDS`(콤마 구분 이메일)에 있는 계정만 로그인되며, `APP_PASSWORD` 를 설정하면 공용 비밀번호도 요구. 자기 비밀번호를 쓰는 계정은 `LOGIN_ACCOUNTS`(`아이디:해시` 콤마 구분)에 넣는다 — 해시는 `npm run -s hash-password -- <아이디>` 로 만들고(평문은 넣지 않음) `vercel env add LOGIN_ACCOUNTS --environment production --sensitive --force` 후 재배포. 서명 키는 `AUTH_SECRET`. 크롤러는 `CRAWLER_API_KEY` 헤더로 통과.
- 크롤러는 배포 서버에서 실행되지 않는다(Chrome 없음). 로컬에서 `npm run crawl -- --all --server https://ai-gl.vercel.app --api-key <CRAWLER_API_KEY>`.
- 재배포: `vercel deploy --prod --yes`. 환경변수 확인: `vercel env ls`.

## SGL 마스터 데이터 시드 (`scripts/seed-sgl-masters.ts`)
```bash
npm run seed:sgl -- "~/Downloads/0309 벳부 카메노이호텔 ... .xlsx"   # 파일 생략 시 마스터만
npm run seed:blob -- --force                                        # 운영(Blob)에 반영 (fares·vehicle-fares 등 크롤링 산출물은 기본 제외, --only/--include-crawled)
```
지역별 호텔(다카마쓰 3 · 벳부 2 · 마쓰야마 3 · 후지 1), 골프장(벳부GC 쯔루미/유후 계약요금, 마쓰야마 9곳(요금 미확보), 후지 6곳 2026.7~10 요금, 세부),
차량 규칙(벳부 3박/4박, 시즈오카 렌터카)을 넣고, 0309 벳부 원가표가 있으면 타이베이(TI750/751) 벳부 상품 2개와 운임을 가져온다.
역산·예상값은 memo/notes 에 "확인 필요"로 표시되어 있다. 골프장 기간표는 **먼저 매칭되는 기간이 적용**되므로 특별요금 기간을 일반 기간보다 앞에 둔다.
