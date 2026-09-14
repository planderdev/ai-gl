import { accessSync, constants, mkdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";

/** JSON 스토어 위치: DATA_DIR → <cwd>/.data → OS temp (서버리스 임시). 운영 전환 시 Supabase 어댑터로 교체. */
let cached: string | null = null;
export function resolveDataDir(): string {
  if (cached) return cached;
  const candidates = [process.env.DATA_DIR, path.join(process.cwd(), ".data")].filter(Boolean) as string[];
  for (const dir of candidates) {
    try {
      mkdirSync(dir, { recursive: true });
      accessSync(dir, constants.W_OK);
      cached = dir;
      return dir;
    } catch {
      /* next */
    }
  }
  const tmp = path.join(os.tmpdir(), "ai-gl-data");
  mkdirSync(tmp, { recursive: true });
  console.warn(`[data-dir] using ephemeral ${tmp} — set DATA_DIR for persistence.`);
  cached = tmp;
  return tmp;
}
