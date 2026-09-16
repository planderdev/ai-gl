/** PHP 관리자 데이터(admin/data/*.json, products.json)를 CMS 컬렉션으로 가져온다. 사용: npx tsx scripts/seed-cms.ts [--force] [--root ../] */
import { readFileSync } from "node:fs";
import path from "node:path";
import { COLLECTIONS } from "../src/lib/cms/schema";
import { cmsStore, saveSiteSettings, getSiteSettings } from "../src/lib/cms/service";

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const root = path.resolve(process.cwd(), args.includes("--root") ? args[args.indexOf("--root") + 1] : "..");
  for (const c of COLLECTIONS) {
    const raw = JSON.parse(readFileSync(path.join(root, c.source), "utf8"));
    const list: Record<string, unknown>[] = c.sourceGroup ? raw[c.sourceGroup] ?? [] : raw;
    const store = cmsStore(c);
    const existing = await store.list();
    if (existing.length && !force) { console.log(`skip ${c.id} (${existing.length}건 존재, --force 로 덮어쓰기)`); continue; }
    await store.replaceAll(list.map((it) => ({ ...it, id: String(it.id) })));
    console.log(`seeded ${c.id}: ${list.length}건 ← ${c.source}${c.sourceGroup ? `#${c.sourceGroup}` : ""}`);
  }
  const s = JSON.parse(readFileSync(path.join(root, "admin/data/settings.json"), "utf8")) as Record<string, unknown>;
  const cur = await getSiteSettings();
  if (!Object.keys(cur).length || force) {
    const flat: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(s)) if (typeof v !== "object" || v === null) flat[k] = v;
    // 중첩(general/payment/policy/integration)에 실제 값이 있으면 평면 키를 채운다
    for (const g of ["general", "payment", "policy", "integration"]) { const o = s[g]; if (o && typeof o === "object") for (const [k, v] of Object.entries(o as Record<string, unknown>)) if (flat[k] === "" || flat[k] == null || flat[k] === 0) flat[k] = v; }
    await saveSiteSettings(flat);
    console.log(`seeded settings: ${Object.keys(flat).length} keys`);
  } else console.log("skip settings (존재)");
}
main().catch((e) => { console.error(e); process.exit(1); });
