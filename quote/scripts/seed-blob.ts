/** 로컬 .data/*.json 을 Vercel Blob 으로 올린다. 사용: BLOB_READ_WRITE_TOKEN=... npx tsx scripts/seed-blob.ts [--force] */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { blobReadJson, blobWriteJson } from "../src/lib/store/blob-collection";

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN 이 필요합니다");
  const force = process.argv.includes("--force");
  const dir = path.join(process.cwd(), ".data");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const name = f.replace(/\.json$/, "");
    const existing = await blobReadJson<unknown>(name).catch(() => null);
    if (existing && !force) { console.log(`skip ${name} (이미 존재, --force 로 덮어쓰기)`); continue; }
    const data = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
    await blobWriteJson(name, data);
    console.log(`uploaded ${name} (${Array.isArray(data) ? data.length + " items" : "doc"})`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
