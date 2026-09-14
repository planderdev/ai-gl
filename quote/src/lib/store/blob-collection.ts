import { get, put } from "@vercel/blob";
import type { Collection } from "./collection";

/**
 * Vercel Blob(비공개) 기반 컬렉션 — 컬렉션 하나를 JSON 파일 하나로 저장.
 * 인스턴스 메모리 캐시 + TTL 로 읽기 비용을 줄이고, 쓰기는 전체 파일을 덮어쓴다(데이터 규모 수천 행 수준을 가정).
 */
const PREFIX = process.env.BLOB_PREFIX ?? "ai-gl";
const TTL_MS = 5_000;
const pathOf = (name: string) => `${PREFIX}/${name}.json`;

export async function blobReadJson<T>(name: string): Promise<T | null> {
  const res = await get(pathOf(name), { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  const text = await new Response(res.stream).text();
  return JSON.parse(text) as T;
}
export async function blobWriteJson(name: string, value: unknown): Promise<void> {
  await put(pathOf(name), JSON.stringify(value), { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true });
}

export class BlobCollection<T extends { id: string }> implements Collection<T> {
  private cache: Map<string, T> | null = null;
  private loadedAt = 0;
  private writing: Promise<void> = Promise.resolve();
  constructor(private name: string) {}
  private async load(force = false) {
    if (this.cache && !force && Date.now() - this.loadedAt < TTL_MS) return this.cache;
    const arr = (await blobReadJson<T[]>(this.name)) ?? [];
    this.cache = new Map(arr.map((x) => [x.id, x]));
    this.loadedAt = Date.now();
    return this.cache;
  }
  private persist(mutate: (m: Map<string, T>) => void) {
    // 쓰기 직전에 최신본을 다시 읽어 병합 → 다른 인스턴스의 변경을 덮어쓰지 않도록 최소한의 보호
    this.writing = this.writing.then(async () => {
      const m = await this.load(true);
      mutate(m);
      await blobWriteJson(this.name, [...m.values()]);
      this.loadedAt = Date.now();
    });
    return this.writing;
  }
  async list() { return [...(await this.load()).values()]; }
  async get(id: string) { return (await this.load()).get(id) ?? null; }
  async upsert(item: T) { await this.persist((m) => m.set(item.id, item)); return item; }
  async upsertMany(items: T[]) { await this.persist((m) => items.forEach((it) => m.set(it.id, it))); return items.length; }
  async remove(id: string) { await this.persist((m) => m.delete(id)); }
  async replaceAll(items: T[]) { await this.persist((m) => { m.clear(); items.forEach((it) => m.set(it.id, it)); }); }
}
