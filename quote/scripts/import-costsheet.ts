/** 사용: npx tsx scripts/import-costsheet.ts <원가표.xlsx> [--region 다카마쓰] [--replace] */
import { readFileSync } from "node:fs";
import { importCostWorkbook } from "../src/lib/excel/import";
import { golfCourses, hotels, saveSettings, vehicleRules } from "../src/lib/masters/service";
import { products } from "../src/lib/products/service";
import { fares } from "../src/lib/fares/service";

const [file, ...rest] = process.argv.slice(2);
if (!file) { console.error("xlsx 경로를 지정하세요"); process.exit(1); }
const region = rest.includes("--region") ? rest[rest.indexOf("--region") + 1] : undefined;
async function main() {
const res = await importCostWorkbook(readFileSync(file), { region });
await hotels().upsert(res.hotel);
await vehicleRules().upsert(res.vehicle);
await golfCourses().upsertMany(res.courses);
await products().upsertMany(res.products);
await fares().upsertMany(res.fares);
await saveSettings({ exchangeRate: res.exchangeRate, margins: res.margins });
console.log(res.log.join("\n"));
console.log(`호텔 1, 차량규칙 1, 골프장 ${res.courses.length}, 상품 ${res.products.length}, 항공운임 ${res.fares.length}건 저장`);
}
main().catch((e) => { console.error(e); process.exit(1); });
