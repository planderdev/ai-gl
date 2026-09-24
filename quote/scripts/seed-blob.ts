/**
 * 로컬 .data/*.json 을 Vercel Blob 으로 올린다.
 *   BLOB_READ_WRITE_TOKEN=... npx tsx scripts/seed-blob.ts [--force] [--only a,b] [--skip a,b]
 * 크롤링 산출물(fares, vehicle-fares, fare-requests)은 운영이 더 최신인 경우가 많아 기본 제외한다. 올리려면 --only 또는 --include-crawled.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { blobReadJson, blobWriteJson } from "../src/lib/store/blob-collection";

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN 이 필요합니다");
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const listOpt = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1].split(",").map((x) => x.trim()).filter(Boolean) : null; };
  const only = listOpt("--only");
  const CRAWLED = ["fares", "vehicle-fares", "fare-requests"];
  const skip = new Set([...(listOpt("--skip") ?? []), ...(args.includes("--include-crawled") || only ? [] : CRAWLED)]);
  const dir = path.join(process.cwd(), ".data");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const name = f.replace(/\.json$/, "");
    if ((only && !only.includes(name)) || skip.has(name)) { console.log(`skip ${name} (${only ? "--only 대상 아님" : "크롤링 산출물 — --include-crawled 또는 --only 로 명시"})`); continue; }
    const existing = await blobReadJson<unknown>(name).catch(() => null);
    if (existing && !force) { console.log(`skip ${name} (이미 존재, --force 로 덮어쓰기)`); continue; }
    const data = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
    await blobWriteJson(name, data);
    console.log(`uploaded ${name} (${Array.isArray(data) ? data.length + " items" : "doc"})`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
