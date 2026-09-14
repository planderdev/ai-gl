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

## 에어서울 운임 크롤러 (`crawler/airseoul.ts`, `src/lib/crawler/airseoul.ts`)
에어서울 예약 1단계 화면의 달력이 쓰는 내부 API `POST /I/KO/searchRouteMinFare.do` (`language=KO&departure=ICN&arrival=TAK&paxCnt=1`)가
노선의 날짜별 **편도 총액(성인 1인, 세금 포함) 최저가**를 약 2년치 한 번에 돌려준다. ICN–TAK 는 하루 1편이므로
`outboundAmount` = RS741(ICN→TAK), `returnAmount` = RS742(TAK→ICN) 운임과 같다. 금액 0 = 운항없음(또는 판매종료).

- 서버 밖에서 직접 호출하면 Cloudflare 챌린지(403)에 막히므로 **Playwright + 설치된 Chrome 창(headed)** 으로 페이지를 연 뒤 페이지 안에서 fetch 한다.
  헤드리스나 프로필/쿠키 재사용은 챌린지에 걸리므로 매번 새 컨텍스트로 연다(1~2초 내 자동 통과).
- 과거 날짜는 달력이 0 을 돌려주므로 오늘(KST) 이후만 저장한다.

```bash
npm run crawl:airseoul -- --all                      # 오늘 이후 전체 → /api/fares
npm run crawl:airseoul -- --once                     # 대기 요청 1건 처리(요청 done/failed 보고)
npm run crawl:airseoul -- --loop 300                 # 5분마다 요청 큐 폴링
npm run crawl:airseoul -- --all --dry-run            # 전송 없이 확인
# --server http://host:3000  --api-key KEY  --route ICN-TAK:RS741:RS742  --headless(차단됨, 실험용)
```
화면에서는 **항공 운임 → 에어서울 크롤러** 카드의 버튼이 `POST /api/crawl/airseoul` `{mode:"all"|"requests"}` 를 호출해 같은 일을 서버(로컬 PC)에서 수행한다.
다른 노선을 추가하려면 `DEFAULT_ROUTES`(또는 CLI `--route`)에 `출발-도착:출발편:귀국편` 을 넣는다.

## 배포 (Vercel)
- 프로젝트: `planderdevs-projects/ai-gl` → https://ai-gl.vercel.app
- 저장소: Vercel Blob(비공개 스토어 `ai-gl-data`) — `BLOB_READ_WRITE_TOKEN` 이 있으면 `src/lib/store/blob-collection.ts` 가 `.data` 대신 사용. 최초 데이터는 `npm run seed:blob`(로컬 `.data` 업로드, `--force` 로 덮어쓰기).
- 접근 보호: `APP_PASSWORD`(Basic 인증, 아이디는 아무거나) — `src/proxy.ts`. 크롤러는 `CRAWLER_API_KEY` 헤더로 통과.
- 크롤러는 배포 서버에서 실행되지 않는다(Chrome 없음). 로컬에서 `npm run crawl:airseoul -- --all --server https://ai-gl.vercel.app --api-key <CRAWLER_API_KEY>`.
- 재배포: `vercel deploy --prod --yes`. 환경변수 확인: `vercel env ls`.
