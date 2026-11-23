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

## 원가표 입력표 (`src/lib/excel/input-*.ts`)
원가표를 만드는 데 필요한 값을 한 파일에 적는 엑셀 양식. `GET /api/input-template` 은 빈 양식, `?group=<상품군 id>` 는 그 상품군의 현재 값으로 채운 양식을 준다. 올리는 곳은 기존 원가표와 같은 `/api/import` 이고, A1 이 `원가표 입력표` 로 시작하는 시트가 있으면 입력표로 읽는다.

| 시트 | 내용 |
|---|---|
| 1 원가표 | 세로 양식. 상품군(이름·국가·지역) + 열 하나가 원가표 하나: 판매 유형·항공편·박수·일자별 홀수·출발일·환율·마진·숙박 구성·골프 구성·차량 규칙·기타 원가·머리글 문구 |
| 2 호텔 | 요일별 1인 1박 요금(엔) |
| 3 호텔 일자별 요금 | 가로 양식(숙박일 · 요일 · 호텔명…). 적힌 날은 `dateRates` 로 들어간다 |
| 4 골프장 요금 | 기간·스타일별 주중/주말/연휴. 적은 골프장은 요금 구간 전체를 교체(위 줄 우선) |
| 5 차량 | 출발 요일별 1인 금액(원) |
| 6 날짜별 입력 | 판매가·그룹가·유택·직접 넣을 운임/금액·강조/마감/숨김. 줄이 있는 원가표는 날짜별 값을 통째로 교체, 없으면 기존 값 유지 |
| 참고 등록된 단가 | 등록된 호텔·골프장·차량 이름과 요금(읽지 않음) |

- 양식 정의는 `input-sheet.ts` 한 곳(쓰기 `input-export.ts`, 읽기 `input-import.ts` 공용). 읽을 때 시트·열은 머리글 문구로 찾으므로 문구를 바꾸면 양쪽이 함께 바뀐다.
- 숙박 구성 `호텔명 N박 + …`, 골프 구성 `골프장명(스타일) + …`, 기타 원가 `항목 40000원 + 항목 3000엔` 은 `+` 로 잇는 글이다. 이름은 2·4·5 시트나 같은 지역의 등록 단가와 맞춘다(글자 그대로 → 업종어를 뺀 이름).
- 이름이 같은 상품군·원가표·호텔·골프장·차량은 새로 만들지 않고 고친다. 고칠 곳이 하나라도 있으면 `InputIssues` 로 전부 모아 422 로 돌려주고 아무것도 저장하지 않는다.
- 입력표의 운임(직접) 칸은 공용 운임이 아니라 그 원가표의 수동조정(`outboundFare`/`inboundFare`)으로 들어간다.
- 채운 양식을 그대로 다시 올리면 금액이 달라지지 않아야 한다(상품군 전체 왕복 검증으로 확인).

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
`/api/hotels`, `/api/golf-courses`, `/api/vehicle-rules`(GET/POST, `/:id` DELETE), `/api/settings`(GET/PUT), `/api/export`(전체 xlsx), `/api/import`(원가표 입력표·기존 원가표 업로드), `/api/input-template`(입력표 양식, `?group=` 로 채운 양식).

## 구조
```
src/types            도메인 타입(Product, Hotel, GolfCourse, VehicleRule, FlightFare, FareRequest, QuoteRow …)
src/lib/pricing      날짜 유틸 + 견적 엔진(순수 함수)
src/lib/excel        import(원가표 → 데이터) / export(데이터 → 원가표)
src/lib/store        JSON 파일 컬렉션 스토어
src/lib/{masters,products,fares}/service.ts   도메인 서비스
src/app/api          REST 라우트
src/app/(pages)      대시보드 / 상품·원가표 / 항공 운임 / 마스터 데이터
src/app/sgl          SGL 고객 사이트(상담·예약·결제) — src/lib/sgl 가 관리자 데이터를 고객용으로 변환
scripts              CLI(import/export)
```

## 항공 운임 크롤러 (`crawler/fares.ts`, `src/lib/crawler/`)
공급자 레지스트리(`providers.ts`)에 항공사별 수집 방식을 두고, 편명 접두(RS/7C)로 자동 선택한다. **조회 기준 인원(pax)** 은 기본 4명이며(두 항공사 달력 API 의 paxCnt / passengers.count), 화면·CLI(`--pax`)·크롤링 요청(`pax`)에서 바꿀 수 있다. 운임에는 `meta.pax` 로 기준 인원이 남는다. 둘 다 홈페이지의 **최저가 달력 API** 를 실제 Chrome 창(headed, 새 컨텍스트)에서 호출한다 — 헤드리스·쿠키 재사용은 봇 차단에 걸린다. 과거 날짜는 저장하지 않는다.

| 공급자 | 노선/편명 | API | 특징 |
|---|---|---|---|
| 에어서울 `airseoul` | ICN–TAK RS741 / TAK–ICN RS742 | `POST /I/KO/searchRouteMinFare.do` (form) | 약 2년치 한 번에. outbound/returnAmount, 금액 0 = 운항없음 |
| 제주항공 `jejuair` | ICN–MYJ 7C1704 / MYJ–ICN 7C1703 | `POST sec.jejuair.net/ko/ibe/booking/searchlowestFareCalendarInPeriod.json` (JSON, `Channel-Code: WPC`) | 최대 90일/호출이라 구간 분할. 총액 = fareAmount + taxesAndFeesAmount |
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
계절에 따라 편명이 바뀌는 노선(진에어 ICN–KKJ: 하계 LJ349/350, 동계 LJ385/386)은 운임을 실제 편명으로 저장하고, 견적 엔진이 설정 편명의 운임이 없으면 **같은 항공사·노선·날짜의 운임**으로 대체한다(`lookupFare`).
잘못 수집된 운임은 `npx tsx scripts/purge-fares.ts --prefix LJ --source crawler` 로 지운다(BLOB 토큰이 있으면 운영 대상).

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

## SGL 고객 사이트 — 상담 · 예약 · 결제 (`/sgl`, `src/app/sgl/`, `src/lib/sgl/`)
관리자에서 만든 상품군·원가표·설정을 고객이 보는 공개 사이트. 로그인 없이 열리도록 `src/proxy.ts` matcher 에서 `sgl`(→ `/sgl`, `/sgl-vip`)과 `api/public` 을 제외했다.

| 화면 | 경로 | 관리자에서 오는 것 |
|---|---|---|
| 랜딩(히어로·검색·상품 목록·이용 방법·FAQ) | `/sgl` | 공개 상품군, 출발일별 판매가, 콘텐츠관리 FAQ, 설정(연락처·결제 수단) |
| 상품 상세(일정 선택·가격 달력·인원) | `/sgl/p/<상품군 id>` | 상품군의 원가표(일정)·숙박·골프장·항공편, 취소/환불 설정 |
| 예약 작성 | `/sgl/book?sheet=&date=&pax=` | 서버가 그 날짜의 판매가를 다시 계산 |
| 예약 현황·결제 | `/sgl/booking/<예약번호>?k=<열람 토큰>` | 결제 설정(수단·계좌·예약금), 예약관리의 상태 |
| 상담 신청 / 예약 조회 | `/sgl/consult`, `/sgl/lookup` | 상담 채널 설정 |

- **상품 = 상품군, 일정 = 원가표.** 상품군의 `publicStatus` 가 `hidden` 이 아니고 출발일이 남은 원가표가 있으면 상품으로 보인다(상품관리 › 상품군 수정 › 고객 사이트 노출에서 공개/숨김·고객용 이름·사진·소개를 정한다).
- **판매가** (`src/lib/sgl/catalog.ts`): 원가표 행의 실제 판매가(`directSalePrice`) → 없으면 원가 ÷ (1 − 마진)을 올림(인디비 항공이 마감·미정이면 그룹 원가). 둘 다 없으면 "가격 문의"(상담), 인디비 마감이면 마감. 마진·올림 단위·실제 판매가만 공개 여부는 설정 › 고객 사이트. **원가·마진·운임 내역은 고객에게 내려가지 않는다**(`Public*` 타입에 없음). 카탈로그는 인스턴스 메모리에 30초 보관한다.
- **예약** (`src/lib/sgl/bookings.ts`): 예약관리(`cms-bookings`, 건별 저장)에 쌓인다. 예약번호는 `SGL` + 날짜 + 무작위 5자, 예약 화면은 예약번호의 HMAC 토큰(`AUTH_SECRET`)이 주소에 있어야 열리고, 예약 조회는 예약번호 + 휴대폰 번호가 모두 맞아야 그 주소를 준다. 온라인 예약은 설정의 인원 범위·예약 마감일(출발 N일 전) 안에서만 받고, 그 밖은 상담으로 보낸다.
- **결제**: 설정 › 결제 설정을 그대로 따른다. 무통장입금은 계좌번호가 있어야, 카드결제는 `TOSS_CLIENT_KEY`·`TOSS_SECRET_KEY`(토스페이먼츠 결제창 API 개별 연동 키, `test_ck_`/`test_sk_` 또는 `live_`)가 있어야 열린다. '부분결제'를 켜고 예약금 정책(고정·비율, 1인당/건당)을 정하면 예약금만 먼저 결제할 수 있다. 무통장·현장 결제는 신청만 받고, **입금 확인은 관리자가 예약관리에서 결제 상태를 '결제완료'로 바꾼다** → 고객의 예약 화면에 바로 반영. 카드는 `/api/public/sgl/toss/success` 에서 주문번호·금액을 저장값과 대조한 뒤 승인한다.
- **상담**: `POST /api/public/sgl/inquiries` → 예약관리 › 상담 문의(`cms-inquiries`).
- **공개 스위치**: 설정 › 고객 사이트의 "고객 사이트(/sgl) 공개"(`sgl_site_open`, 기본 꺼짐)를 켜야 고객에게 열린다. 꺼져 있으면 화면은 404, 공개 API 는 404 이고, 로그인한 관리자만 미리보기 띠와 함께 볼 수 있다(`src/lib/sgl/access.ts`). 켜기 전에 결제 설정의 입금 계좌가 실제 계좌인지 확인한다.
- 공개한 뒤에는 설정 › 기본 설정의 사이트 상태가 `maintenance` 면 점검 안내, `private` 이면 404(관리자는 미리보기).
- 화면: `src/app/sgl/_ui/`(히어로·검색·달력·카드·상세·폼), 스타일 `sgl.css`(모든 규칙이 `.sgl` 아래). 기본 사진·히어로 문구·지역 정보는 `src/lib/sgl/config.ts`. 사진을 지정하지 않은 상품은 분위기 예시 사진(Unsplash)을 쓰므로 실제 사진을 상품군에 넣는 것이 좋다.
- 공개 API(`/api/public/sgl/*`)는 인스턴스별 간이 호출 제한 + 허니팟만 있다. 대량 호출 방어는 Vercel Firewall 로 한다.

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
