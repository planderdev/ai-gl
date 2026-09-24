/** 운임 정리: 조건에 맞는 운임을 삭제. 예) npx tsx scripts/purge-fares.ts --prefix LJ --source crawler   (BLOB_READ_WRITE_TOKEN 이 있으면 운영 Blob 대상) */
import { fares } from "../src/lib/fares/service";
async function main() {
  const a = process.argv.slice(2); const opt = (k: string) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  const prefix = opt("--prefix"), source = opt("--source"), flightNo = opt("--flight");
  const all = await fares().list();
  const keep = all.filter((f) => !((!prefix || f.flightNo.startsWith(prefix)) && (!source || f.source === source) && (!flightNo || f.flightNo === flightNo)));
  await fares().replaceAll(keep);
  console.log(`삭제 ${all.length - keep.length}건, 남은 운임 ${keep.length}건 (${process.env.BLOB_READ_WRITE_TOKEN ? "Blob" : "local"})`);
}
main().catch((e) => { console.error(e); process.exit(1); });
