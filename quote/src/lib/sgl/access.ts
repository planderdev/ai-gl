import { cache } from "react";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth/session";
import { loadConfig } from "./catalog";

/**
 * 고객 사이트를 지금 이 요청에 보여 줘도 되는지.
 * 공개 중이면 누구에게나, 그 밖(공개 스위치 꺼짐·비공개·점검)에는 로그인한 관리자에게만 미리보기로 연다.
 * 한 번의 렌더(레이아웃·메타데이터)에서는 설정을 한 번만 읽는다.
 */
export const siteAccess = cache(async () => {
  const config = await loadConfig();
  if (config.status === "open") return { config, allowed: true, preview: false };
  const admin = !!(await currentUser());
  return { config, allowed: admin, preview: admin };
});

/**
 * 고객 페이지의 첫 줄에서 부른다. 비공개면 여기서 404 로 끝내고, 점검 중이면 `allowed: false` 를 돌려주니 페이지는 null 을 반환한다.
 * 레이아웃과 페이지는 따로 렌더되어 한 응답에 실리므로, 레이아웃만 막으면 페이지가 읽은 상품·가격이 404 응답의 스트림에 남는다.
 */
export async function guardSite() {
  const access = await siteAccess();
  if (!access.allowed && access.config.status === "private") notFound();
  return access;
}
