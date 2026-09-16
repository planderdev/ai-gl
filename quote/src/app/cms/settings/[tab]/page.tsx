import Link from "next/link";
import { notFound } from "next/navigation";
import PageHead from "@/components/PageHead";
import SettingsForm from "@/components/SettingsForm";
import { decodeId } from "@/lib/api";
import { SETTINGS_TABS, settingsTabById } from "@/lib/cms/schema";
import { getSiteSettings } from "@/lib/cms/service";

export const dynamic = "force-dynamic";
export default async function SettingsPage({ params }: PageProps<"/cms/settings/[tab]">) {
  const tab = settingsTabById(decodeId((await params).tab));
  if (!tab) notFound();
  const value = await getSiteSettings();
  return (
    <>
      <PageHead crumb="설정" title={tab.label} desc="사이트 운영 설정입니다. 캐디스 관리자(PHP)의 settings.json 과 같은 키를 사용합니다." actions={SETTINGS_TABS.map((t) => <Link key={t.id} href={`/cms/settings/${t.id}`} className={`admin-btn ${t.id === tab.id ? "admin-btn--primary" : "admin-btn--light"}`}>{t.label}</Link>)} />
      <SettingsForm sections={tab.sections} value={value} key={tab.id} />
    </>
  );
}
