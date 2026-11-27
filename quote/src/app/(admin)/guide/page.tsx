import Link from "next/link";
import type { ReactNode } from "react";
import PageHead from "@/components/PageHead";
import { productGroups, products } from "@/lib/products/service";

export const dynamic = "force-dynamic";

/** 상품관리(원가표) 사용 가이드. 내용은 고정 문서이고, 숫자와 예시 링크만 현재 데이터에서 가져온다 */
const SECTIONS = [
  ["structure", "구조 한눈에 보기"], ["menu", "메뉴 안내"], ["types", "원가표 유형 두 가지"], ["input", "입력표로 만들기"], ["import", "기존 원가표 가져오기"], ["sheet", "원가표 보기·고치기"], ["settings", "원가표 설정"],
  ["rates", "단가 고치기"], ["export", "엑셀 받기"], ["groups", "상품군 관리"], ["fares", "항공 운임"], ["rules", "계산 규칙"], ["inquiries", "문의관리"], ["faq", "자주 묻는 질문"],
] as const;

function Section({ id, icon, title, children }: { id: string; icon: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="admin-card scroll-mt-24">
      <div className="admin-card__head"><h2><i className={`${icon} mr-2 text-[var(--admin-primary)]`} />{title}</h2><a href="#top" className="text-xs text-[var(--admin-text-soft)] hover:text-[var(--admin-primary)]">맨 위로</a></div>
      <div className="admin-card__body space-y-3 text-sm leading-relaxed text-[var(--admin-text)]">{children}</div>
    </section>
  );
}
function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-2">
      {items.map((x, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-xs font-extrabold text-[var(--admin-primary)]">{i + 1}</span>
          <span className="min-w-0">{x}</span>
        </li>
      ))}
    </ol>
  );
}
const Tip = ({ children }: { children: ReactNode }) => <p className="rounded-xl bg-[var(--admin-surface-muted)] px-4 py-3 text-[13px] text-[var(--admin-text-muted)]"><i className="ri-lightbulb-line mr-1.5 text-[var(--admin-warning)]" />{children}</p>;
const Go = ({ href, children }: { href: string; children: ReactNode }) => <Link href={href} className="font-bold text-[var(--admin-primary)] hover:underline">{children}</Link>;
const Level = ({ icon, name, desc, example }: { icon: string; name: string; desc: string; example: string }) => (
  <div className="min-w-40 flex-1 rounded-2xl border border-[var(--admin-border)] bg-white p-4">
    <div className="flex items-center gap-1.5 text-[15px] font-extrabold text-[var(--admin-text-strong)]"><i className={`${icon} text-lg text-[var(--admin-primary)]`} />{name}</div>
    <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{desc}</p>
    <p className="mt-2 text-xs font-semibold text-[var(--admin-text-soft)]">예: {example}</p>
  </div>
);
const Arrow = () => <i className="ri-arrow-right-s-line hidden self-center text-2xl text-[var(--admin-text-soft)] md:block" aria-hidden />;
/** 지금 등록된 원가표 중 하나를 예시로 건다(없으면 아무것도 그리지 않는다) */
const Example = ({ p }: { p?: { id: string; name: string } }) => (p ? <>예시: <Go href={`/products/${p.id}`}>{p.name}</Go></> : null);

export default async function GuidePage() {
  const [list, groups] = await Promise.all([products().list(), productGroups().list()]);
  const regions = new Set([...groups.map((g) => g.region), ...list.map((p) => p.region)]);
  const land = list.find((p) => p.saleType === "land"), air = list.find((p) => p.saleType !== "land");
  return (
    <>
      <div id="top" />
      <PageHead
        crumb="사용 가이드"
        title="상품관리 사용 가이드"
        desc="원가표 엑셀을 가져와 상품으로 관리하고, 단가를 고치고, 다시 엑셀로 내려받는 방법을 정리했습니다. 처음이라면 위에서부터 차례로, 익숙하다면 필요한 항목만 골라 보세요."
        stats={[{ label: "지역", value: regions.size }, { label: "상품군", value: groups.length }, { label: "원가표", value: list.length }]}
        actions={<Link href="/products" className="admin-btn admin-btn--primary"><i className="ri-node-tree" /> 상품 구조 열기</Link>}
      />
      <nav className="flex flex-wrap gap-1.5 text-sm" aria-label="가이드 목차">
        {SECTIONS.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-xl border border-[var(--admin-border)] bg-white px-3 py-1.5 font-semibold text-[var(--admin-text-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]">{label}</a>)}
      </nav>

      <Section id="structure" icon="ri-node-tree" title="구조 한눈에 보기">
        <p>상품은 네 단계로 묶여 있습니다. 위 단계가 아래 단계를 담습니다.</p>
        <div className="flex flex-col gap-2 md:flex-row">
          <Level icon="ri-map-pin-2-fill" name="지역" desc="국가 아래의 여행 지역" example="일본 › 마쓰야마" />
          <Arrow />
          <Level icon="ri-folder-3-fill" name="상품군" desc="원가표 엑셀 파일 1개. 같은 항공·호텔 조합의 묶음" example="마쓰야마 3대 명문골프 (제주항공 조조)" />
          <Arrow />
          <Level icon="ri-file-list-3-line" name="원가표" desc="시트 1장. 박수·홀수·구성이 정해진 상품" example="3박 54홀 현지착 (4인)" />
          <Arrow />
          <Level icon="ri-calendar-2-line" name="출발일별 행" desc="날짜마다 계산된 원가와 판매가" example="12/1 화 · 원가 739,932원" />
        </div>
        <p><b>단가</b>(호텔·골프장·차량)는 원가표가 아니라 <b>지역</b>에 속합니다. 여러 원가표가 같은 단가를 함께 쓰므로, 단가를 한 번 고치면 그 단가를 쓰는 원가표가 모두 다시 계산됩니다.</p>
      </Section>

      <Section id="menu" icon="ri-menu-line" title="메뉴 안내">
        <p>왼쪽 사이드바의 <b>상품관리</b>에 원가표 관련 메뉴가 모여 있습니다.</p>
        <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)]">
          <table className="admin-table">
            <thead><tr><th>메뉴</th><th>하는 일</th></tr></thead>
            <tbody>
              <tr><td className="whitespace-nowrap"><Go href="/products">상품 구조 · 원가표</Go></td><td>지역 › 상품군 › 원가표를 트리로 봅니다. 원가표 이름을 누르면 날짜별 표가 열립니다.</td></tr>
              <tr><td className="whitespace-nowrap"><Go href="/products/new">새 원가표 만들기</Go></td><td>엑셀 없이 화면에서 항공편·숙박·골프·차량을 골라 원가표를 만듭니다.</td></tr>
              <tr><td className="whitespace-nowrap"><Go href="/products/new#import">원가표 엑셀 가져오기</Go></td><td>입력표(채워서 올리는 양식)나 기존에 쓰던 원가표 파일을 올려 상품군·원가표·단가를 한 번에 만듭니다.</td></tr>
              <tr><td className="whitespace-nowrap"><a href="/api/input-template" className="font-bold text-[var(--admin-primary)] hover:underline">입력표 빈 양식 받기</a></td><td>원가표를 만드는 데 필요한 값을 적는 엑셀 양식을 내려받습니다.</td></tr>
              <tr><td className="whitespace-nowrap"><Go href="/masters">호텔·골프장·차량 단가</Go></td><td>지역별 호텔 1박 단가, 골프장 그린피, 차량비와 환율·마진·일본 공휴일을 고칩니다.</td></tr>
              <tr><td className="whitespace-nowrap"><Go href="/fares">항공 운임·크롤러</Go></td><td>항공사에서 수집한 날짜별 운임을 보고, 직접 입력하거나 수집을 요청합니다.</td></tr>
              <tr><td className="whitespace-nowrap"><Go href="/vehicles">차량 요금표(MK택시)</Go></td><td>MK택시 공항 송영 요금표를 도시별로 봅니다.</td></tr>
              <tr><td className="whitespace-nowrap">전체 원가표 다운로드</td><td>모든 원가표를 시트로 담은 엑셀 파일 하나를 받습니다.</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-[var(--admin-text-muted)]"><b>사이트 상품</b> 메뉴는 캐디스 웹사이트에 노출하는 상품·호텔·분류를 관리하는 곳으로, 원가표와는 별개입니다.</p>
      </Section>

      <Section id="types" icon="ri-flight-takeoff-line" title="원가표 유형 두 가지">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--admin-border)] p-4">
            <p className="mb-1"><span className="admin-chip">항공 포함</span></p>
            <p>항공료까지 넣은 원가입니다. 원가가 <b>인디비</b>(개별 운임)와 <b>그룹</b>(그룹가 + 유택) 두 가지로 나옵니다.</p>
            <p className="mt-2 text-[13px] text-[var(--admin-text-muted)]">원가합 = 항공 + 호텔 + 골프 + 차량 + 기타 원가 + 항공추가금</p>
            <p className="mt-2 text-xs text-[var(--admin-text-soft)]"><Example p={air} /></p>
          </div>
          <div className="rounded-2xl border border-[var(--admin-border)] p-4">
            <p className="mb-1"><span className="admin-chip admin-chip--success">현지착</span></p>
            <p>항공료를 뺀 현지 비용만의 원가입니다. 표에 보이는 항공 운임은 <b>참고용</b>이고 원가에 들어가지 않습니다.</p>
            <p className="mt-2 text-[13px] text-[var(--admin-text-muted)]">원가합 = 호텔 + 골프 + 차량 + 기타 원가</p>
            <p className="mt-2 text-xs text-[var(--admin-text-soft)]"><Example p={land} /></p>
          </div>
        </div>
        <p>두 유형 모두 판매가는 <b>원가합 ÷ (1 − 마진)</b> 으로 계산합니다. 마진이 15%면 원가를 0.85로 나눈 값입니다.</p>
      </Section>

      <Section id="input" icon="ri-edit-box-line" title="입력표로 만들기">
        <p><b>원가표 입력표</b>는 원가표를 만드는 데 필요한 값을 한 파일에 적는 엑셀 양식입니다. 채워서 올리면 상품군·원가표와 호텔·골프장·차량 단가가 한 번에 만들어집니다.</p>
        <Steps items={[
          <><a href="/api/input-template" className="font-bold text-[var(--admin-primary)] hover:underline">입력표 빈 양식</a>을 받습니다. 이미 있는 상품군을 고치거나 비슷한 상품을 만들 때는 <Go href="/products">상품 구조</Go>의 상품군 줄에서 <b>입력표</b>를 누르면 지금 값이 채워진 파일을 받습니다.</>,
          <><b>1 원가표</b> 시트에 상품군 이름·지역과 원가표를 적습니다. 열 하나가 원가표 하나이고, 항목 설명과 예시는 B열에 있습니다.</>,
          <>새 호텔·골프장·차량이거나 요금이 바뀌었으면 <b>2 호텔 · 3 호텔 일자별 요금 · 4 골프장 요금 · 5 차량</b> 시트에 적습니다. 등록된 단가를 그대로 쓸 거면 비워 둡니다(등록된 이름은 <b>참고</b> 시트에 있습니다).</>,
          <>날짜마다 다른 값(판매가, 그룹가·유택, 직접 넣을 금액, 출발 없는 날)이 있으면 <b>6 날짜별 입력</b> 시트에 적습니다.</>,
          <><Go href="/products/new#import">원가표 엑셀 가져오기</Go>에서 올립니다. 결과에 원가표별 구성과 첫 출발일 원가가 나오니 맞는지 확인합니다.</>,
        ]} />
        <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)]">
          <table className="admin-table">
            <thead><tr><th>시트</th><th>적는 내용</th><th>꼭 필요한가</th></tr></thead>
            <tbody>
              <tr><td className="whitespace-nowrap font-bold">1 원가표</td><td>상품군 이름·지역, 원가표별 판매 유형·항공편·박수·일자별 홀수·출발일·환율·마진·숙박 구성·골프 구성·차량 규칙·기타 원가</td><td>필수</td></tr>
              <tr><td className="whitespace-nowrap font-bold">2 호텔</td><td>호텔의 요일별 1인 1박 요금(엔)</td><td>새 호텔이거나 요금이 바뀔 때</td></tr>
              <tr><td className="whitespace-nowrap font-bold">3 호텔 일자별 요금</td><td>날짜마다 요금이 다른 호텔의 숙박일별 요금(엔)</td><td>해당 호텔만</td></tr>
              <tr><td className="whitespace-nowrap font-bold">4 골프장 요금</td><td>기간·스타일별 주중/주말/연휴 그린피(엔)</td><td>새 골프장이거나 요금이 바뀔 때</td></tr>
              <tr><td className="whitespace-nowrap font-bold">5 차량</td><td>출발 요일별 1인 차량+지원비(원)</td><td>새 규칙이거나 금액이 바뀔 때</td></tr>
              <tr><td className="whitespace-nowrap font-bold">6 날짜별 입력</td><td>출발일별 판매가, 그룹가·유택, 직접 넣을 운임·금액, 강조·마감·숨김</td><td>있을 때만</td></tr>
            </tbody>
          </table>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-[var(--admin-text-muted)]">
          <li>노란색 머리글(* 표시)은 꼭 채웁니다. 빠지거나 이름이 맞지 않으면 <b>아무것도 저장하지 않고</b> 고칠 곳을 줄 단위로 알려 줍니다.</li>
          <li>숙박 구성은 <code className="rounded bg-[var(--admin-surface-muted)] px-1">쥬라쿠 스파&amp;리조트 1박 + 넘버원 2박</code>, 골프 구성은 <code className="rounded bg-[var(--admin-surface-muted)] px-1">썬셋힐즈컨트리클럽(셀프플레이) + 오쿠도고골프클럽(셀프플레이)</code>, 기타 원가는 <code className="rounded bg-[var(--admin-surface-muted)] px-1">철판구이 석식 40000원 + 가이드비 3000엔</code> 처럼 + 로 이어 적습니다.</li>
          <li>원가표·상품군 이름이 이미 있는 것과 같으면 그것을 고치고, 다르면 새로 만듭니다.</li>
          <li>4 골프장 요금에 적은 골프장은 요금 구간 전체가 표 내용으로 바뀝니다. 6 날짜별 입력에 줄이 있는 원가표는 날짜별 값이 표 내용으로 통째로 바뀌고, 줄이 없으면 기존 값을 그대로 둡니다.</li>
        </ul>
        <Tip>단가를 바꾸면 같은 호텔·골프장·차량을 쓰는 다른 원가표도 함께 바뀝니다. 한 원가표의 특정 날짜만 다르게 하려면 6 날짜별 입력의 “(직접)” 칸을 쓰세요.</Tip>
      </Section>

      <Section id="import" icon="ri-upload-2-line" title="기존 원가표 가져오기">
        <p className="text-[var(--admin-text-muted)]">입력표가 아니라 지금까지 쓰던 원가표 파일을 그대로 올리는 방법입니다.</p>
        <Steps items={[
          <><Go href="/products/new#import">원가표 엑셀 가져오기</Go>에서 파일(.xlsx)을 고릅니다. 지역 칸은 비워 두면 시트 이름에서 알아서 찾습니다.</>,
          <><b>가져오기</b>를 누릅니다. 파일은 상품군 1개, 날짜 표가 있는 시트는 각각 원가표 1개가 됩니다.</>,
          <>아래에 나오는 결과를 확인합니다. <b>원가합이 원본과 다른 행</b>이 0이면 원본과 똑같이 계산된 것입니다.</>,
        ]} />
        <ul className="list-disc space-y-1 pl-5 text-[var(--admin-text-muted)]">
          <li>항공 포함 양식과 현지착 양식은 머리글을 보고 자동으로 구분합니다.</li>
          <li>파일 안에 <b>호텔 요금표</b> 시트가 있으면 호텔의 날짜별 요금으로, <b>골프장 요금표</b> 시트가 있으면 골프장 그린피로 들어갑니다.</li>
          <li>이미 등록된 호텔·골프장과 이름이 같거나 비슷하면 새로 만들지 않고 그 단가를 갱신합니다. 결과에 어떤 것과 맞췄는지 나옵니다.</li>
          <li><b>수동값으로 남긴 행</b>은 규칙으로 계산한 값과 원본이 달라 원본 값을 그대로 보존한 행입니다. 표에서 주황색으로 보입니다.</li>
        </ul>
        <Tip>같은 파일을 다시 올려도 중복으로 생기지 않고 같은 상품군·원가표가 갱신됩니다. 단, 화면에서 고친 날짜별 값은 파일 내용으로 다시 덮입니다.</Tip>
      </Section>

      <Section id="sheet" icon="ri-table-line" title="원가표 보기·고치기">
        <p><Go href="/products">상품 구조 · 원가표</Go>에서 원가표 이름을 누르면 열립니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><b>원가 구조</b> — 항공·숙박·골프·차량·기타 원가가 어떤 단가로 합쳐지는지 보여 줍니다.</li>
          <li><b>같은 상품군의 다른 원가표</b> — 제목 아래 탭을 눌러 바로 넘어갑니다(엑셀의 시트 탭과 같습니다).</li>
          <li><b>날짜별 표</b> — 셀을 눌러 값을 직접 넣을 수 있습니다. 넣은 값은 그 날짜에만 적용되고 <span className="rounded bg-orange-50 px-1 font-medium text-orange-900">주황색</span>으로 표시됩니다. 셀을 비우면 자동 계산으로 돌아갑니다.</li>
          <li><b>계산 내역</b> — 날짜를 누르면 그날 숙박·골프가 어떤 요금으로 계산됐는지 나옵니다.</li>
          <li><b>판매가</b> — 만원 단위로 넣습니다. <code className="rounded bg-[var(--admin-surface-muted)] px-1">84,9</code> 는 849,000원입니다. 넣으면 옆 칸에 실제 수익률(1 − 원가 ÷ 판매가)이 나옵니다.</li>
          <li><b>플래그</b> — 날짜 강조(노란색), 마감 표시, 그 날짜 숨김을 켜고 끕니다. 숨긴 날짜는 표 위의 “숨긴 날짜 표시”에서 되돌립니다.</li>
        </ul>
      </Section>

      <Section id="settings" icon="ri-settings-3-line" title="원가표 설정">
        <p>원가표 화면 오른쪽 위 <b>원가표 설정</b>을 누르면 구성을 바꿀 수 있습니다. 저장해도 날짜별로 넣어 둔 값은 그대로 남습니다.</p>
        <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)]">
          <table className="admin-table">
            <thead><tr><th>항목</th><th>설명</th></tr></thead>
            <tbody>
              <tr><td className="whitespace-nowrap font-bold">위치</td><td>어느 상품군에 둘지, 판매 유형(항공 포함/현지착), 기준 인원을 정합니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">항공 · 일정</td><td>항공편과 시간, 박수, 출발일 범위. 항공 포함이면 월별 유택도 여기서 넣습니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">숙박</td><td>호텔과 박수. <b>호텔 나눠 묵기</b>를 누르면 “쥬라쿠 1박 + 넘버원 2박”처럼 순서대로 나눌 수 있습니다. 박수 합이 전체 박수와 같아야 저장됩니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">골프</td><td>일자별 홀수(예: <code className="rounded bg-[var(--admin-surface-muted)] px-1">0,18,18,0</code>)를 넣으면 라운드 칸이 생기고, 라운드마다 골프장과 스타일(셀프플레이/캐디포함)을 고릅니다. 도착일에 치는 조조 항공편은 <code className="rounded bg-[var(--admin-surface-muted)] px-1">18,18,18,0</code> 처럼 첫날부터 넣습니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">차량 · 기타 원가</td><td>차량 규칙을 고르고, 석식·가이드비 같은 1인 고정 비용을 원 또는 엔으로 추가합니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">환율 · 마진</td><td>이 원가표에만 적용되는 환율과 마진(콤마로 여러 개)입니다.</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="rates" icon="ri-price-tag-3-line" title="단가 고치기">
        <p><Go href="/masters">호텔·골프장·차량 단가</Go>에서 위쪽 지역 버튼을 누르면 그 지역 단가만 보입니다. 상품 구조 화면의 지역 제목 옆 <b>단가</b> 버튼으로도 바로 갑니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><b>호텔</b> — 요일별 1인 1박 단가(엔)를 넣습니다. 날짜마다 요금이 다른 호텔은 <b>일자별 요금</b>을 열어 한 줄에 하나씩 <code className="rounded bg-[var(--admin-surface-muted)] px-1">2026-12-01 11500</code> 형식으로 넣습니다. 적힌 날은 요일 단가 대신 이 금액을 씁니다.</li>
          <li><b>골프장</b> — 이름을 눌러 펼치면 기간별 주중/주말/연휴 요금을 고칩니다. <b>스타일</b> 칸에 셀프플레이·캐디포함을 적으면 원가표에서 그 스타일을 고른 라운드에만 적용됩니다. 연말연시처럼 특별요금인 기간은 <b>+ 기간</b>으로 한 줄 추가한 뒤 ▲ 로 위로 올립니다. 날짜가 겹치면 위에 있는 줄이 먼저 적용됩니다.</li>
          <li><b>차량+지원비</b> — 출발 요일별 1인 금액(원)입니다.</li>
          <li><b>기본 설정</b> — 새 원가표의 기본 환율·마진과 일본 공휴일 목록입니다. 공휴일은 골프 연휴 요금 판정에 쓰입니다.</li>
        </ul>
        <Tip>단가를 저장하면 그 단가를 쓰는 모든 원가표가 바로 다시 계산됩니다. 특정 날짜만 다르게 하고 싶으면 단가가 아니라 원가표의 그 날짜 셀에 직접 넣으세요.</Tip>
      </Section>

      <Section id="export" icon="ri-file-excel-2-line" title="엑셀 받기">
        <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)]">
          <table className="admin-table">
            <thead><tr><th>버튼</th><th>위치</th><th>받는 파일</th></tr></thead>
            <tbody>
              <tr><td className="whitespace-nowrap font-bold">원가표 .xlsx</td><td>원가표 화면, 상품 구조의 각 줄</td><td>그 원가표 시트 1장 + 골프장 요금표. 날짜별 요금을 쓰는 호텔이 있으면 호텔 요금표도 붙습니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">묶음 .xlsx</td><td>상품 구조의 상품군 줄, 원가표 화면의 탭 오른쪽</td><td>상품군의 원가표 전부를 시트로 묶은 파일. 원래 쓰시던 파일과 같은 형태입니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">전체 원가표</td><td>사이드바, 화면 맨 위</td><td>모든 원가표를 한 파일로.</td></tr>
            </tbody>
          </table>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-[var(--admin-text-muted)]">
          <li>열 배치와 수식은 원본 원가표와 같습니다. 엑셀에서 환율 칸이나 엔화 금액을 고치면 원가와 판매가가 다시 계산됩니다.</li>
          <li>현지착 양식은 항공(E열)이 비어 있습니다. 엑셀에서 항공료를 넣으면 원가합에 더해집니다.</li>
          <li>연한 주황 셀은 화면에서 직접 넣은 값입니다.</li>
        </ul>
      </Section>

      <Section id="groups" icon="ri-folder-3-line" title="상품군 관리">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><b>상품군 추가</b> — <Go href="/products">상품 구조</Go> 화면 오른쪽 위 버튼. 이름·지역·항공사·정렬 순서를 넣습니다.</li>
          <li><b>상품군 수정</b> — 각 상품군 줄 오른쪽 버튼. 이름을 바꾸거나 순서를 조정합니다.</li>
          <li><b>원가표를 다른 상품군으로 옮기기</b> — 원가표 설정의 <b>상품군</b> 칸에서 바꿉니다.</li>
          <li><b>상품군 삭제</b> — 상품군만 지워지고 안에 있던 원가표는 지워지지 않고 <b>미분류</b>로 남습니다.</li>
          <li><b>미분류 자동 묶기</b> — 미분류 원가표가 있으면 버튼이 나타납니다. 지역·호텔·항공편이 같은 것끼리 상품군을 만들어 묶어 줍니다.</li>
        </ul>
      </Section>

      <Section id="fares" icon="ri-flight-land-line" title="항공 운임">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>항공 포함 원가표의 인디비 운임은 <Go href="/fares">항공 운임·크롤러</Go>에 수집된 값을 씁니다. 출발편은 출발일, 귀국편은 귀국일 운임입니다.</li>
          <li>아직 수집되지 않은 날짜는 <b>미정</b>으로 나오고 원가도 미정이 됩니다. 원가표 화면의 <b>운임 크롤링 요청</b>으로 수집을 요청하거나, 표의 운임 칸에 직접 넣을 수 있습니다.</li>
          <li><b>마감</b>은 그 인원이 함께 탈 좌석이 없다는 뜻이고, <b>운항없음</b>은 그날 편이 없다는 뜻입니다.</li>
          <li>그룹 운임은 수집하지 않습니다. 표의 <b>그룹가</b> 칸에 날짜별로 넣고, 유택(유류할증 + 택스)은 원가표 설정에서 월별로 넣습니다.</li>
          <li>현지착 원가표의 운임은 참고용이라 비어 있어도 원가 계산에는 영향이 없습니다.</li>
        </ul>
      </Section>

      <Section id="rules" icon="ri-calculator-line" title="계산 규칙">
        <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)]">
          <table className="admin-table">
            <thead><tr><th>항목</th><th>계산 방법</th></tr></thead>
            <tbody>
              <tr><td className="whitespace-nowrap font-bold">호텔 ¥</td><td>체크인일부터 숙박 구성 순서대로 1박씩, 그날 단가를 더합니다. 단가는 일자별 요금 → 시즌 구간 → 요일 단가 순으로 찾습니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">골프 ¥</td><td>라운드가 있는 날마다 그 골프장 요금표에서 평일/주말/연휴 요금을 골라 더합니다. 일본 공휴일은 연휴 요금입니다. 9홀이면 절반입니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">차량 ₩</td><td>출발 요일에 해당하는 금액.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">기타 원가 ₩</td><td>석식 등 고정 항목의 합. 엔으로 넣은 항목은 환율을 곱합니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">항공 ₩</td><td>인디비 = 출발편 + 귀국편 운임. 그룹 = 그룹가 + 그 달의 유택. 현지착은 원가에 넣지 않습니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">원가합 ₩</td><td>위 항목의 합. 엔화(호텔·골프)는 원가표의 환율을 곱해 원으로 바꿉니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">판매가 ₩</td><td>원가합 ÷ (1 − 마진). 마진 15%·20% 두 가지가 기본입니다.</td></tr>
              <tr><td className="whitespace-nowrap font-bold">판매 수익률</td><td>실제 판매가를 넣었을 때 1 − 원가합 ÷ 판매가.</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-[var(--admin-text-muted)]">모든 금액은 1인 기준입니다.</p>
      </Section>

      <Section id="inquiries" icon="ri-customer-service-2-line" title="문의관리">
        <p><Go href="/inquiries">문의관리</Go>는 인스타(플러그인)·카카오 채널·직판·홈페이지로 들어온 문의와 상담 경과를 한곳에서 보는 화면입니다. 쓰시던 ‘문의관리현황 목록’ 엑셀과 같은 칸으로 되어 있습니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><b>요약</b> — 접수 채널·목적지·출발 달별 문의 수와 출발 확정 수(확정률)입니다. 줄을 누르면 그 조건으로 목록이 좁혀지고, 다시 누르면 풀립니다. 출발 달은 출발이 확정된 문의는 확정된 출발일, 나머지는 고객이 말한 희망 출발일로 셉니다.</li>
          <li><b>달력</b> — 오른쪽 위에서 <b>달력</b>을 누르면 한 달이 펼쳐집니다. <b>문의일 기준</b>은 문의가 들어온 날, <b>출발일 기준</b>은 출발하는 날에 문의 수와 출발 확정 수가 놓입니다. 날짜를 누르면 아래 목록이 그날 문의로 좁혀지고, 채널·상태 같은 조건은 달력에도 그대로 적용됩니다. 출발날짜가 “1월 하순”처럼 달만 적힌 문의는 달력 아래에 따로 묶여 있습니다.</li>
          <li><b>목록</b> — 최근 접수순입니다. 상태(신규 · 상담중 · 출발 확정 · 종료)는 목록에서 바로 바꾸고, 이름이나 <b>수정</b>을 누르면 나머지 칸을 고칩니다. 출발 확정 내용을 적으면 상태가 출발 확정으로 바뀝니다.</li>
          <li><b>문의 등록</b> — 새 문의를 직접 넣습니다. 출발날짜와 지역은 엑셀에 적던 그대로(12월4일, 1월 하순, 인천-가고시마) 적으면 날짜·출발지·목적지를 알아서 읽습니다.</li>
          <li><b>엑셀 가져오기</b> — ‘문의관리현황 목록’ 파일을 그대로 올립니다. 이름·채널·접수일이 같은 문의는 건너뛰므로 같은 파일을 다시 올려도 두 번 들어가지 않습니다. 엑셀에서 고친 비고·확정 내용까지 반영하려면 “이미 있는 문의도 고치기”를 켭니다.</li>
          <li><b>엑셀 내려받기</b> — 같은 열 배치(직판문의 … 비고)로 받습니다. 뒤에 홈페이지 문의·연락처·상태 칸이 붙습니다.</li>
          <li>고객 사이트의 상담 폼으로 들어온 문의는 채널이 <b>홈페이지</b>로 표시되어 같은 목록에 자동으로 들어옵니다.</li>
        </ul>
      </Section>

      <Section id="faq" icon="ri-question-line" title="자주 묻는 질문">
        <dl className="space-y-3">
          {([
            ["표의 주황색 셀은 무엇인가요?", "자동 계산 대신 사람이 직접 넣은 값입니다. 셀을 비우고 다른 곳을 누르면 자동 계산으로 돌아갑니다."],
            ["노란색 날짜는 무엇인가요?", "강조 표시입니다. 항공 포함 원가표에서는 스팟특가, 현지착 원가표에서는 연휴·성수기 표시로 씁니다. 플래그 칸의 버튼으로 켜고 끕니다."],
            ["단가를 고쳤는데 어떤 날짜는 안 바뀝니다.", "그 날짜에 직접 넣은 값(주황색)이 있으면 단가보다 그 값이 우선합니다. 셀을 비우면 새 단가로 계산됩니다."],
            ["골프장에 셀프와 캐디 요금이 둘 다 있습니다.", "단가 화면에서 골프장 요금 줄마다 스타일을 적어 두고, 원가표 설정의 골프 라운드에서 스타일을 고르면 해당 요금이 적용됩니다."],
            ["환율이 바뀌었습니다.", "원가표마다 환율을 따로 가집니다. 원가표 설정에서 환율을 고치면 그 원가표 전체가 다시 계산됩니다. 단가 화면의 기본 환율은 새로 만드는 원가표에만 쓰입니다."],
            ["출발이 없는 날짜를 빼고 싶습니다.", "그 날짜의 플래그 칸에서 숨김을 누릅니다. 엑셀에도 나오지 않습니다. 표 위의 “숨긴 날짜 표시”에서 되돌릴 수 있습니다."],
            ["원가표를 지우고 싶습니다.", "화면에는 아직 삭제 버튼이 없습니다. 필요하면 관리자에게 요청하세요. 당장 안 쓰는 원가표는 상품군을 따로 만들어 옮겨 두면 됩니다."],
          ] as const).map(([q, a]) => (
            <div key={q}><dt className="font-bold text-[var(--admin-text-strong)]"><i className="ri-question-fill mr-1.5 text-[var(--admin-primary)]" />{q}</dt><dd className="mt-0.5 pl-6 text-[var(--admin-text-muted)]">{a}</dd></div>
          ))}
        </dl>
      </Section>
    </>
  );
}
