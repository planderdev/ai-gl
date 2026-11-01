import { createHash } from "node:crypto";
import { collectionById } from "@/lib/cms/schema";
import { cmsStore, nowLocal } from "@/lib/cms/service";
import type { VipApplyInput } from "@/lib/schemas";
import { recordCollection } from "@/lib/store/collection";
import type { VipApplication, VipBenefit } from "@/types";
import { formatPhone, parseKst, VIP_CONSENT_VERSION, VIP_FIRST_BENEFIT } from "./config";

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

/** 공개 시각이 지난 혜택만 돌려준다 → 공개 전 내용은 HTML·RSC 페이로드에 실리지 않는다 */
export async function listRevealedBenefits(now: number): Promise<VipBenefit[]> {
  let stored: VipBenefit[] = [];
  try { stored = (await cmsStore(collectionById("vip-benefits")!).list()) as unknown as VipBenefit[]; }
  catch (e) { console.error("[sgl-vip] 혜택 목록을 읽지 못해 첫 혜택만 표시합니다", e); }
  const all = stored.some((b) => b.id === VIP_FIRST_BENEFIT.id) ? stored : [VIP_FIRST_BENEFIT, ...stored];
  return all.filter((b) => b.status === "publish" && parseKst(b.reveal_at) <= now).sort((a, b) => a.sort_order - b.sort_order);
}
