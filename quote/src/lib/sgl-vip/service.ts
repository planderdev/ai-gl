import { createHash } from "node:crypto";
import { collectionById } from "@/lib/cms/schema";
import { listItems, nowLocal } from "@/lib/cms/service";
import type { VipApplyInput } from "@/lib/schemas";
import { recordCollection } from "@/lib/store/collection";
import type { VipApplication, VipBenefit } from "@/types";
import { formatPhone, parseKst, VIP_ANNOUNCED_BENEFITS, VIP_CONSENT_VERSION } from "./config";

/** 같은 번호면 먼저 접수된 건을 유지한다. 응답은 동일하게 성공 → 어떤 번호가 신청했는지 외부에서 알 수 없다 */
export async function submitVipApplication(input: VipApplyInput) {
  const at = nowLocal();
  const item: VipApplication = {
    id: createHash("sha256").update(`sgl-vip:${input.phone}`).digest("hex").slice(0, 24),
    name: input.name, phone: formatPhone(input.phone), instagram: input.instagram, regions: input.regions, used_sgl_before: input.usedBefore, status: "new",
    marketing_consent: input.marketingConsent, privacy_consent_at: at, marketing_consent_at: input.marketingConsent ? at : "", consent_version: VIP_CONSENT_VERSION,
    utm_source: input.utm_source, utm_medium: input.utm_medium, utm_campaign: input.utm_campaign, utm_content: input.utm_content, referrer: input.referrer,
    created_at: at, updated_at: at,
  };
  return recordCollection<VipApplication>("cms-vip-applications").createIfAbsent(item);
}

/**
 * 공개 시각이 지난 혜택과, 공개 예정으로 등록된 혜택 중 가장 이른 공개 시각.
 * 공개 전 혜택은 시각만 넘기므로 내용이 HTML·RSC 페이로드에 실리지 않는다.
 */
export async function loadVipBenefits(now: number): Promise<{ revealed: VipBenefit[]; scheduledAt: number | null }> {
  let all = VIP_ANNOUNCED_BENEFITS;
  try { all = (await listItems(collectionById("vip-benefits")!)) as unknown as VipBenefit[]; }
  catch (e) { console.error("[sgl-vip] 혜택 목록을 읽지 못해 릴스로 공개된 혜택만 표시합니다", e); }
  const live = all.filter((b) => b.status === "publish");
  const upcoming = live.map((b) => parseKst(b.reveal_at)).filter((t) => t > now);
  return {
    revealed: live.filter((b) => parseKst(b.reveal_at) <= now).sort((a, b) => a.sort_order - b.sort_order),
    scheduledAt: upcoming.length ? Math.min(...upcoming) : null,
  };
}
